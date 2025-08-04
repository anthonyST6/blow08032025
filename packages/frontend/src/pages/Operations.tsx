import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUseCaseContext } from '../contexts/UseCaseContext';
import {
  CubeTransparentIcon,
  ChartBarIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  CpuChipIcon,
  CircleStackIcon,
  ChevronDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  BeakerIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Progress } from '../components/Progress';
import { useCaseService } from '../services/usecase.service';
import { UseCase, AgentGraph, AgentNode } from '../types/usecase.types';
import { agentExecution } from '../services/agentExecution.service';
import { toast } from 'react-hot-toast';

interface AgentStatus {
  agentId: string;
  agentName: string;
  status: 'online' | 'offline' | 'busy' | 'error' | 'maintenance';
  lastHeartbeat: Date;
  currentTask?: string;
  performance: {
    cpu: number;
    memory: number;
    responseTime: number;
  };
  tasksCompleted: number;
  errorRate: number;
}

interface UseCaseOperations {
  useCaseId: string;
  status: 'active' | 'inactive' | 'partial';
  agentStatuses: AgentStatus[];
  workflowsRunning: number;
  totalExecutions: number;
  successRate: number;
  avgResponseTime: number;
}

const Operations: React.FC = () => {
  const { useCases, selectedUseCase, setSelectedUseCase } = useUseCaseContext();
  const [operations, setOperations] = useState<UseCaseOperations[]>([]);
  const [showUseCaseDropdown, setShowUseCaseDropdown] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Generate operations data when use cases load
  useEffect(() => {
    if (useCases.length > 0) {
      const mockOperations = useCases.map(useCase => generateMockOperations(useCase.id));
      setOperations(mockOperations);
    }
  }, [useCases]);

  // Refresh operations data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOperations();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, selectedUseCase]);


  const generateMockOperations = (useCaseId: string): UseCaseOperations => {
    // Define agent names and tasks based on use case
    let agentNames: string[] = [];
    let taskDescriptions: string[] = [];
    
    if (useCaseId === 'oilfield-land-lease') {
      agentNames = [
        'Data Ingest Agent',
        'Oilfield Lease Orchestrator Agent',
        'Lease Expiration Risk Agent',
        'Revenue Forecast Agent',
        'Compliance Analysis Agent',
        'Document Generation Agent',
        'Title Search Agent',
        'Environmental Assessment Agent'
      ];
      taskDescriptions = [
        'Ingesting lease data from CSV files',
        'Orchestrating workflow execution',
        'Analyzing lease expiration risks',
        'Calculating revenue projections',
        'Performing regulatory compliance checks',
        'Generating compliance reports',
        'Searching property titles',
        'Assessing environmental impact'
      ];
    } else if (useCaseId === 'insurance-risk-assessment') {
      agentNames = [
        'Policy Data Ingestion Agent',
        'Risk Assessment Orchestrator',
        'Claims Analysis Agent',
        'Fraud Detection Agent',
        'Underwriting Agent',
        'Report Generation Agent'
      ];
      taskDescriptions = [
        'Processing policy applications',
        'Coordinating risk assessment workflow',
        'Analyzing historical claims data',
        'Detecting potential fraud patterns',
        'Evaluating underwriting criteria',
        'Generating risk assessment reports'
      ];
    } else {
      // Generic agents for other use cases
      agentNames = [
        'Data Processing Agent',
        'Workflow Orchestrator',
        'Analysis Agent',
        'Validation Agent',
        'Output Generation Agent'
      ];
      taskDescriptions = [
        'Processing input data',
        'Coordinating workflow tasks',
        'Performing data analysis',
        'Validating results',
        'Generating output reports'
      ];
    }
    
    // Generate agent statuses with real names
    const agentCount = Math.min(agentNames.length, Math.floor(Math.random() * 3) + 5);
    const agentStatuses: AgentStatus[] = agentNames.slice(0, agentCount).map((name, i) => ({
      agentId: `${useCaseId}-agent-${i}`,
      agentName: name,
      status: ['online', 'offline', 'busy', 'error', 'maintenance'][Math.floor(Math.random() * 5)] as any,
      lastHeartbeat: new Date(Date.now() - Math.random() * 60000),
      currentTask: Math.random() > 0.5 ? `Task-${Math.floor(Math.random() * 1000)}: ${taskDescriptions[Math.floor(Math.random() * taskDescriptions.length)]}` : undefined,
      performance: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        responseTime: Math.random() * 500,
      },
      tasksCompleted: Math.floor(Math.random() * 1000),
      errorRate: Math.random() * 10,
    }));

    const onlineAgents = agentStatuses.filter(a => a.status === 'online' || a.status === 'busy').length;
    const totalAgents = agentStatuses.length;

    return {
      useCaseId,
      status: onlineAgents === totalAgents ? 'active' : onlineAgents === 0 ? 'inactive' : 'partial',
      agentStatuses,
      workflowsRunning: Math.floor(Math.random() * 10),
      totalExecutions: Math.floor(Math.random() * 10000),
      successRate: 85 + Math.random() * 15,
      avgResponseTime: Math.random() * 200 + 50,
    };
  };

  const refreshOperations = () => {
    setLastUpdate(new Date());
    
    // Update operations with new mock data but preserve total executions
    setOperations(prev => prev.map(op => {
      const newOp = generateMockOperations(op.useCaseId);
      return {
        ...newOp,
        totalExecutions: op.totalExecutions + Math.floor(Math.random() * 10),
      };
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-vanguard-green';
      case 'busy':
        return 'text-vanguard-blue';
      case 'offline':
        return 'text-gray-500';
      case 'error':
        return 'text-vanguard-red';
      case 'maintenance':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'busy':
        return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'offline':
        return <XCircleIcon className="w-4 h-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'maintenance':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'coordinator':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'security':
        return <ShieldCheckIcon className="w-4 h-4" />;
      case 'integrity':
        return <DocumentCheckIcon className="w-4 h-4" />;
      case 'accuracy':
        return <BeakerIcon className="w-4 h-4" />;
      default:
        return <CubeTransparentIcon className="w-4 h-4" />;
    }
  };

  const filteredOperations = !selectedUseCase || selectedUseCase === 'all'
    ? operations
    : operations.filter(op => op.useCaseId === selectedUseCase);

  const selectedUseCaseData = useCases.find(uc => uc.id === selectedUseCase);

  // Demo execution function
  const executeDemoWorkflow = async () => {
    if (!selectedUseCaseData || selectedUseCase === 'all') {
      toast.error('Please select a specific use case to execute');
      return;
    }

    setIsExecuting(true);
    try {
      // Get the agent graph for the selected use case
      const agentGraph = await useCaseService.getAgentGraph(selectedUseCase);
      
      if (!agentGraph) {
        toast.error('Failed to load agent configuration');
        return;
      }
      
      // Get all agents from the graph
      const agents = agentGraph.agents || [];
      
      // Execute workflow with all agents
      await agentExecution.executeWorkflow(
        agents,
        `Workflow for ${selectedUseCaseData.name}`,
        selectedUseCase,
        `workflow-${Date.now()}`
      );
      
      toast.success('Workflow executed successfully! Check the Output Viewer for results.');
      
      // Refresh operations data
      refreshOperations();
    } catch (error) {
      console.error('Failed to execute demo workflow:', error);
      toast.error('Failed to execute workflow');
    } finally {
      setIsExecuting(false);
    }
  };

  // Calculate overall statistics
  const overallStats = {
    totalAgents: filteredOperations.reduce((sum, op) => sum + op.agentStatuses.length, 0),
    onlineAgents: filteredOperations.reduce((sum, op) => 
      sum + op.agentStatuses.filter(a => a.status === 'online' || a.status === 'busy').length, 0
    ),
    totalWorkflows: filteredOperations.reduce((sum, op) => sum + op.workflowsRunning, 0),
    avgSuccessRate: filteredOperations.length > 0 
      ? filteredOperations.reduce((sum, op) => sum + op.successRate, 0) / filteredOperations.length 
      : 0,
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center mb-2">
          <BoltIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Operations Center
        </h1>
        <p className="text-gray-400">
          Real-time monitoring of agent status and workflow execution across all use cases
        </p>
      </div>

      {/* Control Bar */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-seraphim-gold/10 to-transparent border-seraphim-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Use Case Filter */}
            <div className="relative">
              <button
                onClick={() => setShowUseCaseDropdown(!showUseCaseDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <CubeTransparentIcon className="w-5 h-5 text-seraphim-gold" />
                <span className="text-white">
                  {!selectedUseCase || selectedUseCase === 'all' ? 'All Use Cases' : selectedUseCaseData?.name || 'Select Use Case'}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>
              
              {showUseCaseDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
                  <button
                    onClick={() => {
                      setSelectedUseCase('all');
                      setShowUseCaseDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-lg"
                  >
                    <div className="font-medium text-white">All Use Cases</div>
                    <div className="text-xs text-gray-400 mt-1">Monitor all operations</div>
                  </button>
                  {useCases.map(useCase => (
                    <button
                      key={useCase.id}
                      onClick={() => {
                        setSelectedUseCase(useCase.id);
                        setShowUseCaseDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors last:rounded-b-lg"
                    >
                      <div className="font-medium text-white">{useCase.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{useCase.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Interval */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Refresh:</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-1 bg-white/10 text-white rounded border border-gray-700 focus:border-seraphim-gold"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            </div>

            {/* Execution Button */}
            {selectedUseCase && selectedUseCase !== 'all' && (
              <button
                onClick={executeDemoWorkflow}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-2 bg-seraphim-gold hover:bg-seraphim-gold/80 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>Execute</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Last Update */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ClockIcon className="w-4 h-4" />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Agents</p>
              <p className="text-2xl font-bold text-white">{overallStats.totalAgents}</p>
            </div>
            <CubeTransparentIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Online Agents</p>
              <p className="text-2xl font-bold text-vanguard-green">{overallStats.onlineAgents}</p>
            </div>
            <SignalIcon className="w-8 h-8 text-vanguard-green opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Workflows</p>
              <p className="text-2xl font-bold text-vanguard-blue">{overallStats.totalWorkflows}</p>
            </div>
            <ArrowPathIcon className="w-8 h-8 text-vanguard-blue opacity-50 animate-spin" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">{overallStats.avgSuccessRate.toFixed(1)}%</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-seraphim-gold opacity-50" />
          </div>
        </Card>
      </div>

      {/* Use Case Operations */}
      <div className="space-y-6">
        {filteredOperations.map(operation => {
          const useCase = useCases.find(uc => uc.id === operation.useCaseId);
          if (!useCase) return null;

          return (
            <Card key={operation.useCaseId} className="p-6">
              {/* Use Case Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <CubeTransparentIcon className="w-6 h-6 mr-2 text-seraphim-gold" />
                    {useCase.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{useCase.description}</p>
                </div>
                <Badge
                  variant={
                    operation.status === 'active' ? 'success' : 
                    operation.status === 'inactive' ? 'error' : 
                    'warning'
                  }
                  size="large"
                >
                  {operation.status.toUpperCase()}
                </Badge>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Workflows Running</p>
                  <p className="text-lg font-semibold text-white">{operation.workflowsRunning}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Total Executions</p>
                  <p className="text-lg font-semibold text-white">{operation.totalExecutions.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Success Rate</p>
                  <p className="text-lg font-semibold text-vanguard-green">{operation.successRate.toFixed(1)}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Avg Response Time</p>
                  <p className="text-lg font-semibold text-white">{operation.avgResponseTime.toFixed(0)}ms</p>
                </div>
              </div>

              {/* Agent Status Grid */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Agent Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {operation.agentStatuses.map((agent, index) => (
                    <motion.div
                      key={agent.agentId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAgentTypeIcon('custom')}
                          <span className="text-sm font-medium text-white">
                            Agent {index + 1}: {agent.agentName}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 ${getStatusColor(agent.status)}`}>
                          {getStatusIcon(agent.status)}
                          <span className="text-xs capitalize">{agent.status}</span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <p className="text-xs text-gray-400">Current Task</p>
                        <p className="text-xs text-white" title={agent.currentTask || 'No active task'}>
                          {agent.currentTask || 'No active task'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">CPU</span>
                            <span className="text-white">{agent.performance.cpu.toFixed(0)}%</span>
                          </div>
                          <Progress value={agent.performance.cpu} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Memory</span>
                            <span className="text-white">{agent.performance.memory.toFixed(0)}%</span>
                          </div>
                          <Progress value={agent.performance.memory} className="h-1" />
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Tasks</span>
                          <p className="text-white font-medium">{agent.tasksCompleted}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Error Rate</span>
                          <p className={`font-medium ${agent.errorRate > 5 ? 'text-vanguard-red' : 'text-vanguard-green'}`}>
                            {agent.errorRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredOperations.length === 0 && (
        <Card className="p-12 text-center">
          <CubeTransparentIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg text-gray-400">No operations data available</p>
          <p className="text-sm text-gray-500 mt-2">
            Deploy a use case to see live operations data
          </p>
        </Card>
      )}
    </div>
  );
};

export default Operations;