import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  CubeTransparentIcon,
  PlusIcon,
  TrashIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  LinkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BeakerIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Log component mount
console.log('AgentOrchestrationFixed: Component file loaded');

// Agent types
interface Agent {
  id: string;
  name: string;
  type: 'coordinator' | 'security' | 'integrity' | 'accuracy' | 'custom';
  role?: string;
  description?: string;
  status: 'active' | 'inactive' | 'processing';
  position: { x: number; y: number };
  config?: Record<string, any>;
  connections: string[];
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'data' | 'control';
}

// Fallback use cases
const FALLBACK_USE_CASES = [
  {
    id: 'oilfield-land-lease',
    name: 'Oilfield Land Lease',
    description: 'Automated workflow for processing and analyzing land lease agreements',
  },
  {
    id: 'energy-load-forecasting',
    name: 'Energy Load Forecasting',
    description: 'AI-powered workflow for predicting energy consumption patterns',
  },
];

// Agent Card Component
const AgentCard: React.FC<{
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}> = ({ agent, isSelected, onSelect, onDelete, onToggleStatus }) => {
  console.log('AgentCard: Rendering agent', agent.id);
  
  const typeConfig = {
    coordinator: {
      icon: CubeTransparentIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    security: {
      icon: ShieldCheckIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    integrity: {
      icon: ExclamationTriangleIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    accuracy: {
      icon: ChartBarIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    custom: {
      icon: BeakerIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
  };

  const config = typeConfig[agent.type] || typeConfig.custom;
  const Icon = config.icon;

  return (
    <div
      style={{
        position: 'absolute',
        left: agent.position.x,
        top: agent.position.y,
      }}
      className={`
        w-48 rounded-lg border-2 p-4 backdrop-blur-sm transition-all cursor-pointer
        ${config.bgColor} ${isSelected ? config.borderColor : 'border-gray-700'}
        shadow-lg hover:shadow-xl
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus();
            }}
            className="p-1 rounded transition-colors text-gray-400 hover:text-white"
          >
            {agent.status === 'active' ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-red-500 hover:text-red-400 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-white mb-1">{agent.name}</h3>
      <p className="text-xs text-gray-400 capitalize">{agent.type} Agent</p>
    </div>
  );
};

// Agent Library Panel
const AgentLibrary: React.FC<{
  onAddAgent: (type: Agent['type']) => void;
}> = ({ onAddAgent }) => {
  console.log('AgentLibrary: Rendering');
  
  const agentTypes = [
    {
      type: 'security' as const,
      name: 'Security Agent',
      description: 'Monitors security compliance',
      icon: ShieldCheckIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      type: 'integrity' as const,
      name: 'Integrity Agent',
      description: 'Validates data integrity',
      icon: ExclamationTriangleIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      type: 'accuracy' as const,
      name: 'Accuracy Agent',
      description: 'Ensures output accuracy',
      icon: ChartBarIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      type: 'custom' as const,
      name: 'Custom Agent',
      description: 'Configure custom logic',
      icon: BeakerIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <CubeTransparentIcon className="h-5 w-5 text-yellow-500 mr-2" />
        Agent Library
      </h3>
      
      <div className="space-y-3">
        {agentTypes.map((agentType) => (
          <button
            key={agentType.type}
            onClick={() => onAddAgent(agentType.type)}
            className={`
              w-full p-3 rounded-lg border text-left transition-all
              ${agentType.bgColor} ${agentType.borderColor}
              hover:border-yellow-500/50
            `}
          >
            <div className="flex items-start space-x-3">
              <agentType.icon className={`h-5 w-5 ${agentType.color} mt-0.5`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{agentType.name}</p>
                <p className="text-xs text-gray-400 mt-1">{agentType.description}</p>
              </div>
              <PlusIcon className="h-4 w-4 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

// Preconfigured Oilfield Land Lease data
const getOilfieldLandLeaseAgents = (): Agent[] => [
  {
    id: 'orchestrator',
    name: 'Oilfield Lease Orchestrator Agent',
    type: 'coordinator',
    role: 'Coordinator',
    description: 'Coordinates the entire lease analysis workflow',
    status: 'inactive',
    position: { x: 400, y: 50 },
    connections: ['ingest', 'risk', 'forecast', 'compliance'],
  },
  {
    id: 'ingest',
    name: 'Data Ingest Agent',
    type: 'custom',
    role: 'Data Processing',
    description: 'Ingests and validates lease data from various sources',
    status: 'inactive',
    position: { x: 100, y: 200 },
    connections: ['orchestrator'],
  },
  {
    id: 'risk',
    name: 'Lease Expiration Risk Agent',
    type: 'custom',
    role: 'Risk Analysis',
    description: 'Analyzes lease expiration dates and identifies risks',
    status: 'inactive',
    position: { x: 250, y: 350 },
    connections: ['docgen'],
  },
  {
    id: 'forecast',
    name: 'Revenue Forecast Agent',
    type: 'custom',
    role: 'Financial Analysis',
    description: 'Forecasts revenue based on lease terms and market conditions',
    status: 'inactive',
    position: { x: 400, y: 350 },
    connections: ['docgen'],
  },
  {
    id: 'compliance',
    name: 'Compliance Analysis Agent',
    type: 'custom',
    role: 'Compliance',
    description: 'Checks lease agreements for regulatory compliance',
    status: 'inactive',
    position: { x: 550, y: 350 },
    connections: ['docgen'],
  },
  {
    id: 'docgen',
    name: 'Document Generation Agent',
    type: 'custom',
    role: 'Documentation',
    description: 'Generates compliance reports and renewal recommendations',
    status: 'inactive',
    position: { x: 400, y: 500 },
    connections: [],
  },
  {
    id: 'security',
    name: 'Security Agent',
    type: 'security',
    role: 'Security',
    description: 'Monitors security compliance',
    status: 'inactive',
    position: { x: 650, y: 200 },
    connections: [],
  },
  {
    id: 'accuracy',
    name: 'Accuracy Agent',
    type: 'accuracy',
    role: 'Accuracy',
    description: 'Ensures output accuracy',
    status: 'inactive',
    position: { x: 700, y: 100 },
    connections: [],
  },
];

const getOilfieldLandLeaseConnections = (): Connection[] => [
  { id: 'conn-1', from: 'ingest', to: 'orchestrator', type: 'data' },
  { id: 'conn-2', from: 'orchestrator', to: 'risk', type: 'control' },
  { id: 'conn-3', from: 'orchestrator', to: 'forecast', type: 'control' },
  { id: 'conn-4', from: 'orchestrator', to: 'compliance', type: 'control' },
  { id: 'conn-5', from: 'compliance', to: 'docgen', type: 'data' },
  { id: 'conn-6', from: 'risk', to: 'docgen', type: 'data' },
  { id: 'conn-7', from: 'forecast', to: 'docgen', type: 'data' },
];

// Main Component
const AgentOrchestrationFixed: React.FC = () => {
  console.log('AgentOrchestrationFixed: Component mounting');
  
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState('oilfield-land-lease');
  const [isDeploying, setIsDeploying] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  
  // Load preconfigured data for Oilfield Land Lease
  useEffect(() => {
    console.log('AgentOrchestrationFixed: Use case changed to', selectedUseCase);
    
    if (selectedUseCase === 'oilfield-land-lease' && !hasLoadedInitialData) {
      console.log('AgentOrchestrationFixed: Loading Oilfield Land Lease preconfigured data');
      const preconfiguredAgents = getOilfieldLandLeaseAgents();
      const preconfiguredConnections = getOilfieldLandLeaseConnections();
      
      setAgents(preconfiguredAgents);
      setConnections(preconfiguredConnections);
      setHasLoadedInitialData(true);
      
      toast.success('Loaded Oilfield Land Lease configuration');
    } else if (selectedUseCase === 'custom') {
      // Clear canvas for custom mode
      setAgents([]);
      setConnections([]);
      setHasLoadedInitialData(false);
    }
  }, [selectedUseCase, hasLoadedInitialData]);

  // Log state changes
  useEffect(() => {
    console.log('AgentOrchestrationFixed: State updated', {
      agentsCount: agents.length,
      connectionsCount: connections.length,
      selectedAgent,
      selectedUseCase,
    });
  }, [agents, connections, selectedAgent, selectedUseCase]);

  // Add new agent
  const handleAddAgent = useCallback((type: Agent['type']) => {
    console.log('AgentOrchestrationFixed: Adding agent of type', type);
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Agent ${agents.length + 1}`,
      type,
      status: 'inactive',
      position: { x: 50 + (agents.length % 3) * 250, y: 50 + Math.floor(agents.length / 3) * 150 },
      connections: [],
    };
    setAgents([...agents, newAgent]);
    toast.success(`Added ${newAgent.name}`);
  }, [agents]);

  // Delete agent
  const handleDeleteAgent = useCallback((agentId: string) => {
    console.log('AgentOrchestrationFixed: Deleting agent', agentId);
    setAgents(agents.filter(agent => agent.id !== agentId));
    setConnections(connections.filter(conn =>
      conn.from !== agentId && conn.to !== agentId
    ));
    if (selectedAgent === agentId) {
      setSelectedAgent(null);
    }
    toast.success('Agent deleted');
  }, [agents, connections, selectedAgent]);

  // Toggle agent status
  const handleToggleStatus = useCallback((agentId: string) => {
    console.log('AgentOrchestrationFixed: Toggling agent status', agentId);
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
        : agent
    ));
  }, [agents]);

  // Deploy workflow
  const handleDeployWorkflow = async () => {
    console.log('AgentOrchestrationFixed: Deploy workflow clicked');
    
    if (agents.length === 0) {
      toast.error('Please add at least one agent before deploying');
      return;
    }

    const hasOrchestrator = agents.some(agent => agent.type === 'coordinator');
    if (!hasOrchestrator) {
      toast.error('Please add an orchestrator agent before deploying');
      return;
    }

    if (selectedUseCase === 'custom') {
      toast.error('Please select a specific use case before deploying');
      return;
    }

    setIsDeploying(true);
    
    try {
      // Simulate saving to backend
      console.log('AgentOrchestrationFixed: Saving orchestration', {
        useCaseId: selectedUseCase,
        agents: agents.length,
        connections: connections.length,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Deployment initiated for ${FALLBACK_USE_CASES.find(uc => uc.id === selectedUseCase)?.name || selectedUseCase}`);
      navigate('/deployment', { state: { fromAgentOrchestration: true } });
    } catch (error) {
      console.error('Failed to deploy workflow:', error);
      toast.error('Failed to initiate deployment');
    } finally {
      setIsDeploying(false);
    }
  };

  // Render connections
  const renderConnections = () => {
    return connections.map(connection => {
      const fromAgent = agents.find(a => a.id === connection.from);
      const toAgent = agents.find(a => a.id === connection.to);
      
      if (!fromAgent || !toAgent) return null;
      
      const x1 = fromAgent.position.x + 96; // Center of agent card
      const y1 = fromAgent.position.y + 40;
      const x2 = toAgent.position.x + 96;
      const y2 = toAgent.position.y + 40;
      
      return (
        <svg
          key={connection.id}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <marker
              id={`arrowhead-${connection.id}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#EAB308"
              />
            </marker>
          </defs>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#EAB308"
            strokeWidth="2"
            markerEnd={`url(#arrowhead-${connection.id})`}
            className="opacity-50"
          />
        </svg>
      );
    });
  };

  console.log('AgentOrchestrationFixed: Rendering component');

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <SparklesIcon className="h-6 w-6 text-yellow-500 mr-2" />
              Agent Orchestration Panel
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Design and deploy AI agent workflows with drag-and-drop simplicity
            </p>
          </div>
          
          {/* Use Case Dropdown */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <label className="text-sm font-medium text-gray-400 mr-2">Use Case:</label>
              <select
                value={selectedUseCase}
                onChange={(e) => setSelectedUseCase(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="custom">Custom/Global</option>
                {FALLBACK_USE_CASES.map(useCase => (
                  <option key={useCase.id} value={useCase.id}>
                    {useCase.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agent Library */}
        <div className="lg:col-span-1">
          <AgentLibrary onAddAgent={handleAddAgent} />
          
          {/* Controls */}
          <Card className="p-4 mt-4">
            <h3 className="text-sm font-semibold text-white mb-3">Controls</h3>
            <div className="space-y-2">
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => {
                  setAgents([]);
                  setConnections([]);
                  setSelectedAgent(null);
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear Canvas
              </Button>
            </div>
          </Card>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card className="relative h-[600px] overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-800"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            >
              {/* Render connections */}
              {renderConnections()}
              
              {/* Render agents */}
              {agents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent === agent.id}
                  onSelect={() => setSelectedAgent(agent.id)}
                  onDelete={() => handleDeleteAgent(agent.id)}
                  onToggleStatus={() => handleToggleStatus(agent.id)}
                />
              ))}
              
              {/* Empty state */}
              {agents.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <CubeTransparentIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">
                      Add agents from the library to start building your workflow
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Status Bar */}
          <Card className="mt-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-400">
                    Active: {agents.filter(a => a.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center">
                  <CogIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-400">
                    Total Agents: {agents.length}
                  </span>
                </div>
              </div>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeployWorkflow}
                disabled={isDeploying || agents.length === 0 || selectedUseCase === 'custom'}
              >
                {isDeploying ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Deploy Workflow
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentOrchestrationFixed;