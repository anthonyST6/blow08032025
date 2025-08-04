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
  DocumentChartBarIcon,
  ServerStackIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Agent types
interface Agent {
  id: string;
  name: string;
  type: 'coordinator' | 'security' | 'integrity' | 'accuracy' | 'custom' | 'data' | 'analytics' | 'compliance' | 'report';
  role?: string;
  description?: string;
  status: 'active' | 'inactive' | 'processing';
  position: { x: number; y: number };
  config?: Record<string, any>;
  connections: string[];
  stats?: {
    tasks: number;
    avgTime: number;
    successRate: number;
  };
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

// Branded Agent Card Component
const BrandedAgentCard: React.FC<{
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}> = ({ agent, isSelected, onSelect, onDelete, onToggleStatus }) => {
  const typeConfig = {
    coordinator: {
      icon: CubeTransparentIcon,
      color: 'text-seraphim-gold',
      borderColor: '#FFD700',
      bgColor: 'rgba(255, 215, 0, 0.08)',
    },
    security: {
      icon: ShieldCheckIcon,
      color: 'text-vanguard-security',
      borderColor: '#3A7BD5',
      bgColor: 'rgba(58, 123, 213, 0.08)',
    },
    integrity: {
      icon: ExclamationTriangleIcon,
      color: 'text-vanguard-integrity',
      borderColor: '#D94A4A',
      bgColor: 'rgba(217, 74, 74, 0.08)',
    },
    accuracy: {
      icon: ChartBarIcon,
      color: 'text-vanguard-accuracy',
      borderColor: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.08)',
    },
    data: {
      icon: CircleStackIcon,
      color: 'text-vanguard-security',
      borderColor: '#3A7BD5',
      bgColor: 'rgba(58, 123, 213, 0.08)',
    },
    analytics: {
      icon: ChartBarIcon,
      color: 'text-vanguard-accuracy',
      borderColor: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.08)',
    },
    compliance: {
      icon: ShieldCheckIcon,
      color: 'text-vanguard-integrity',
      borderColor: '#D94A4A',
      bgColor: 'rgba(217, 74, 74, 0.08)',
    },
    report: {
      icon: DocumentChartBarIcon,
      color: 'text-seraphim-gold',
      borderColor: '#FFD700',
      bgColor: 'rgba(255, 215, 0, 0.08)',
    },
    custom: {
      icon: BeakerIcon,
      color: 'text-seraphim-gold',
      borderColor: '#FFD700',
      bgColor: 'rgba(255, 215, 0, 0.08)',
    },
  };

  const config = typeConfig[agent.type] || typeConfig.custom;
  const Icon = config.icon;

  // Default stats if not provided
  const stats = agent.stats || {
    tasks: Math.floor(Math.random() * 300) + 50,
    avgTime: Math.random() * 5 + 1,
    successRate: Math.random() * 10 + 90,
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: agent.position.x,
        top: agent.position.y,
      }}
      className={`
        w-56 rounded-lg backdrop-blur-sm transition-all cursor-pointer
        shadow-lg hover:shadow-xl transform hover:scale-[1.02]
        ${isSelected ? 'ring-2 ring-seraphim-gold ring-opacity-50' : ''}
      `}
      onClick={onSelect}
      whileHover={{ 
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {/* Card with gradient background and gold border */}
      <div 
        className="relative h-full rounded-lg border border-seraphim-gold/30 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)`,
        }}
      >
        {/* Colored top border stripe */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: config.borderColor }}
        />

        {/* Card content */}
        <div className="p-4 pt-5">
          {/* Header with icon and controls */}
          <div className="flex items-start justify-between mb-3">
            <div 
              className={`p-2 rounded-lg border`}
              style={{ 
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
              }}
            >
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus();
                }}
                className="p-1 rounded transition-all text-gray-400 hover:text-white hover:bg-white/10"
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
                className="p-1 rounded text-vanguard-integrity hover:text-white hover:bg-vanguard-integrity/20 transition-all"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Agent name and type */}
          <h3 className="text-base font-bold text-white mb-1">{agent.name}</h3>
          <p className="text-xs text-gray-400 capitalize mb-3">{agent.type} Agent</p>

          {/* Stats section with pill badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tasks badge */}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600">
              Tasks: {stats.tasks}
            </span>
            
            {/* Avg time badge */}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-transparent text-seraphim-gold border border-seraphim-gold/50">
              Avg: {stats.avgTime.toFixed(1)}s
            </span>
            
            {/* Success rate badge */}
            <span 
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                stats.successRate >= 95 
                  ? 'bg-vanguard-accuracy/20 text-vanguard-accuracy border border-vanguard-accuracy/50' 
                  : 'bg-vanguard-integrity/20 text-vanguard-integrity border border-vanguard-integrity/50'
              }`}
            >
              {stats.successRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Agent Library Panel with Branding
const BrandedAgentLibrary: React.FC<{
  onAddAgent: (type: Agent['type']) => void;
}> = ({ onAddAgent }) => {
  const agentTypes = [
    {
      type: 'data' as const,
      name: 'Data Agent',
      description: 'Ingests and processes data',
      icon: CircleStackIcon,
      color: 'text-vanguard-security',
      bgColor: 'rgba(58, 123, 213, 0.08)',
      borderColor: '#3A7BD5',
    },
    {
      type: 'analytics' as const,
      name: 'Analytics Agent',
      description: 'Analyzes and transforms data',
      icon: ChartBarIcon,
      color: 'text-vanguard-accuracy',
      bgColor: 'rgba(76, 175, 80, 0.08)',
      borderColor: '#4CAF50',
    },
    {
      type: 'compliance' as const,
      name: 'Compliance Validator',
      description: 'Validates compliance rules',
      icon: ShieldCheckIcon,
      color: 'text-vanguard-integrity',
      bgColor: 'rgba(217, 74, 74, 0.08)',
      borderColor: '#D94A4A',
    },
    {
      type: 'report' as const,
      name: 'Report Generator',
      description: 'Generates reports and insights',
      icon: DocumentChartBarIcon,
      color: 'text-seraphim-gold',
      bgColor: 'rgba(255, 215, 0, 0.08)',
      borderColor: '#FFD700',
    },
  ];

  return (
    <div 
      className="rounded-lg border border-seraphim-gold/20 p-4"
      style={{
        background: `linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)`,
      }}
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <CubeTransparentIcon className="h-5 w-5 text-seraphim-gold mr-2" />
        Agent Library
      </h3>
      
      <div className="space-y-3">
        {agentTypes.map((agentType) => (
          <motion.button
            key={agentType.type}
            onClick={() => onAddAgent(agentType.type)}
            className={`
              w-full p-3 rounded-lg border text-left transition-all
              hover:shadow-lg transform hover:scale-[1.02]
            `}
            style={{
              backgroundColor: agentType.bgColor,
              borderColor: `${agentType.borderColor}66`,
            }}
            whileHover={{ 
              borderColor: agentType.borderColor,
              boxShadow: `0 0 15px ${agentType.borderColor}40`,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-3">
              <agentType.icon className={`h-5 w-5 ${agentType.color} mt-0.5`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{agentType.name}</p>
                <p className="text-xs text-gray-400 mt-1">{agentType.description}</p>
              </div>
              <PlusIcon className="h-4 w-4 text-gray-400" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Preconfigured Oilfield Land Lease data
const getOilfieldLandLeaseAgents = (): Agent[] => [
  {
    id: 'orchestrator',
    name: 'Oilfield Lease Orchestrator',
    type: 'coordinator',
    role: 'Coordinator',
    description: 'Coordinates the entire lease analysis workflow',
    status: 'inactive',
    position: { x: 400, y: 50 },
    connections: ['ingest', 'risk', 'forecast', 'compliance'],
    stats: { tasks: 156, avgTime: 2.3, successRate: 98.5 },
  },
  {
    id: 'ingest',
    name: 'Data Ingestion Agent',
    type: 'data',
    role: 'Data Processing',
    description: 'Ingests and validates lease data from various sources',
    status: 'inactive',
    position: { x: 100, y: 200 },
    connections: ['orchestrator'],
    stats: { tasks: 234, avgTime: 3.1, successRate: 99.8 },
  },
  {
    id: 'transform',
    name: 'Data Transformation Agent',
    type: 'data',
    role: 'Data Processing',
    description: 'Transforms and normalizes lease data',
    status: 'inactive',
    position: { x: 250, y: 200 },
    connections: ['orchestrator'],
    stats: { tasks: 142, avgTime: 1.8, successRate: 99.2 },
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    type: 'analytics',
    role: 'Analysis',
    description: 'Performs statistical analysis and trend detection',
    status: 'inactive',
    position: { x: 550, y: 200 },
    connections: ['orchestrator'],
    stats: { tasks: 89, avgTime: 4.5, successRate: 96.7 },
  },
  {
    id: 'compliance',
    name: 'Compliance Validator',
    type: 'compliance',
    role: 'Compliance',
    description: 'Checks lease agreements for regulatory compliance',
    status: 'inactive',
    position: { x: 400, y: 350 },
    connections: ['docgen'],
    stats: { tasks: 234, avgTime: 3.1, successRate: 99.8 },
  },
  {
    id: 'docgen',
    name: 'Report Generator',
    type: 'report',
    role: 'Documentation',
    description: 'Generates compliance reports and renewal recommendations',
    status: 'inactive',
    position: { x: 400, y: 500 },
    connections: [],
    stats: { tasks: 67, avgTime: 5.2, successRate: 97.3 },
  },
];

const getOilfieldLandLeaseConnections = (): Connection[] => [
  { id: 'conn-1', from: 'ingest', to: 'orchestrator', type: 'data' },
  { id: 'conn-2', from: 'transform', to: 'orchestrator', type: 'data' },
  { id: 'conn-3', from: 'orchestrator', to: 'analytics', type: 'control' },
  { id: 'conn-4', from: 'orchestrator', to: 'compliance', type: 'control' },
  { id: 'conn-5', from: 'analytics', to: 'docgen', type: 'data' },
  { id: 'conn-6', from: 'compliance', to: 'docgen', type: 'data' },
];

// Main Component with Branding
const AgentOrchestrationBranded: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState('oilfield-land-lease');
  const [isDeploying, setIsDeploying] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  
  // Load preconfigured data for Oilfield Land Lease
  useEffect(() => {
    if (selectedUseCase === 'oilfield-land-lease' && !hasLoadedInitialData) {
      const preconfiguredAgents = getOilfieldLandLeaseAgents();
      const preconfiguredConnections = getOilfieldLandLeaseConnections();
      
      setAgents(preconfiguredAgents);
      setConnections(preconfiguredConnections);
      setHasLoadedInitialData(true);
      
      toast.success('Loaded Oilfield Land Lease configuration');
    } else if (selectedUseCase === 'custom') {
      setAgents([]);
      setConnections([]);
      setHasLoadedInitialData(false);
    }
  }, [selectedUseCase, hasLoadedInitialData]);

  // Add new agent
  const handleAddAgent = useCallback((type: Agent['type']) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Agent ${agents.length + 1}`,
      type,
      status: 'inactive',
      position: { x: 50 + (agents.length % 3) * 250, y: 50 + Math.floor(agents.length / 3) * 150 },
      connections: [],
      stats: {
        tasks: Math.floor(Math.random() * 300) + 50,
        avgTime: Math.random() * 5 + 1,
        successRate: Math.random() * 10 + 90,
      },
    };
    setAgents([...agents, newAgent]);
    toast.success(`Added ${newAgent.name}`);
  }, [agents]);

  // Delete agent
  const handleDeleteAgent = useCallback((agentId: string) => {
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
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
        : agent
    ));
  }, [agents]);

  // Deploy workflow
  const handleDeployWorkflow = async () => {
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
      
      const x1 = fromAgent.position.x + 112; // Center of agent card
      const y1 = fromAgent.position.y + 60;
      const x2 = toAgent.position.x + 112;
      const y2 = toAgent.position.y + 60;
      
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
                fill="#FFD700"
              />
            </marker>
          </defs>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#FFD700"
            strokeWidth="2"
            markerEnd={`url(#arrowhead-${connection.id})`}
            className="opacity-50"
          />
        </svg>
      );
    });
  };

  return (
    <div
      className="p-6"
      style={{
        background: 'linear-gradient(180deg, #0E0E0E 0%, #1A1A1A 100%)',
      }}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <SparklesIcon className="h-8 w-8 text-seraphim-gold mr-3" />
              Agent Orchestration
            </h1>
            <p className="text-sm text-gray-400 mt-2">
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
                className="px-4 py-2 bg-background-secondary border border-seraphim-gold/30 rounded-lg text-white focus:outline-none focus:border-seraphim-gold/60 hover:border-seraphim-gold/40 transition-colors"
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
          <BrandedAgentLibrary onAddAgent={handleAddAgent} />
          
          {/* Controls */}
          <div
            className="p-4 mt-4 rounded-lg border border-seraphim-gold/20"
            style={{
              background: `linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)`,
            }}
          >
            <h3 className="text-sm font-semibold text-white mb-3">Controls</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Activate all agents
                  setAgents(agents.map(agent => ({ ...agent, status: 'active' })));
                  toast.success('All agents activated');
                }}
                disabled={agents.length === 0}
                className={`w-full px-4 py-2 rounded-full transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center ${
                  agents.length === 0
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-vanguard-accuracy text-white hover:bg-vanguard-accuracy-dark'
                }`}
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Activate All
              </button>
              <button
                onClick={() => {
                  setAgents([]);
                  setConnections([]);
                  setSelectedAgent(null);
                }}
                className="w-full px-4 py-2 rounded-full bg-vanguard-integrity text-white hover:bg-vanguard-integrity-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear Canvas
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <div 
            className="relative h-[600px] overflow-hidden rounded-lg border border-seraphim-gold/20"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(14, 14, 14, 0.8) 100%)',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 215, 0, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 215, 0, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            >
              {/* Render connections */}
              {renderConnections()}
              
              {/* Render agents */}
              <AnimatePresence>
                {agents.map(agent => (
                  <BrandedAgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgent === agent.id}
                    onSelect={() => setSelectedAgent(agent.id)}
                    onDelete={() => handleDeleteAgent(agent.id)}
                    onToggleStatus={() => handleToggleStatus(agent.id)}
                  />
                ))}
              </AnimatePresence>
              
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
          </div>
          
          {/* Status Bar */}
          <div 
            className="mt-4 p-4 rounded-lg border border-seraphim-gold/20"
            style={{
              background: `linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-vanguard-accuracy mr-2" />
                  <span className="text-sm text-gray-300">
                    Active: {agents.filter(a => a.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center">
                  <CogIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-300">
                    Total Agents: {agents.length}
                  </span>
                </div>
              </div>
              
              {/* Branded Deploy Button */}
              <button
                onClick={handleDeployWorkflow}
                disabled={isDeploying || agents.length === 0 || selectedUseCase === 'custom'}
                className={`
                  px-6 py-2 rounded-full font-medium transition-all transform
                  ${isDeploying || agents.length === 0 || selectedUseCase === 'custom'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-seraphim-black text-seraphim-gold border border-seraphim-gold hover:bg-seraphim-gold hover:text-seraphim-black active:scale-[0.98]'
                  }
                  flex items-center
                `}
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOrchestrationBranded;