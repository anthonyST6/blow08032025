import React, { useState, useCallback, useRef, useEffect, Component, ErrorInfo } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useUseCaseContext } from '../contexts/UseCaseContext';
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
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaseService } from '../services/usecase.service';
import { UseCase, AgentGraph, AgentNode as AgentNodeType, AgentConnection } from '../types/usecase.types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiWithCache.service';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Agent Orchestration Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-seraphim-black flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-6 text-center">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingState: React.FC = () => (
  <div className="min-h-screen bg-seraphim-black flex items-center justify-center">
    <div className="text-center">
      <ArrowPathIcon className="h-12 w-12 text-seraphim-gold animate-spin mx-auto mb-4" />
      <p className="text-gray-400">Loading Agent Orchestration...</p>
    </div>
  </div>
);

// Error State Component
const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="min-h-screen bg-seraphim-black flex items-center justify-center p-6">
    <Card className="max-w-md w-full p-6 text-center">
      <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">Unable to Load</h2>
      <p className="text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </Card>
  </div>
);

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

// Connection between agents
type Connection = AgentConnection;

// Agent Card Component
const AgentCard: React.FC<{
  agent: Agent;
  isSelected: boolean;
  isDragging?: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}> = ({ agent, isSelected, isDragging = false, onSelect, onDragStart, onDragEnd, onDelete, onToggleStatus }) => {
  const typeConfig = {
    coordinator: {
      icon: CubeTransparentIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/20',
    },
    security: {
      icon: ShieldCheckIcon,
      color: 'text-vanguard-blue',
      bgColor: 'bg-vanguard-blue/10',
      borderColor: 'border-vanguard-blue/30',
      glowColor: 'shadow-vanguard-blue/20',
    },
    integrity: {
      icon: ExclamationTriangleIcon,
      color: 'text-vanguard-red',
      bgColor: 'bg-vanguard-red/10',
      borderColor: 'border-vanguard-red/30',
      glowColor: 'shadow-vanguard-red/20',
    },
    accuracy: {
      icon: ChartBarIcon,
      color: 'text-vanguard-green',
      bgColor: 'bg-vanguard-green/10',
      borderColor: 'border-vanguard-green/30',
      glowColor: 'shadow-vanguard-green/20',
    },
    custom: {
      icon: BeakerIcon,
      color: 'text-seraphim-gold',
      bgColor: 'bg-seraphim-gold/10',
      borderColor: 'border-seraphim-gold/30',
      glowColor: 'shadow-seraphim-gold/20',
    },
  };

  const config = typeConfig[agent.type] || typeConfig.custom;
  const Icon = config.icon;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        position: 'absolute',
        left: agent.position.x,
        top: agent.position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        zIndex: isDragging ? 1000 : isSelected ? 10 : 1,
      }}
      className={`
        w-48 rounded-lg border-2 p-4 backdrop-blur-sm transition-all select-none
        ${config.bgColor} ${isSelected ? config.borderColor : 'border-gray-700'}
        ${isSelected ? config.glowColor : ''} shadow-lg hover:shadow-xl
        ${isSelected ? 'ring-2 ring-seraphim-gold ring-opacity-50' : ''}
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
            className={`p-1 rounded transition-colors ${
              agent.status === 'active' 
                ? 'text-vanguard-green hover:text-vanguard-green/80' 
                : 'text-gray-500 hover:text-gray-400'
            }`}
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

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs font-medium ${
          agent.status === 'active' ? 'text-vanguard-green' :
          agent.status === 'processing' ? 'text-yellow-500' :
          'text-gray-500'
        }`}>
          {agent.status === 'processing' ? (
            <span className="flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-1"
              >
                <CogIcon className="h-3 w-3" />
              </motion.div>
              Processing
            </span>
          ) : (
            agent.status.charAt(0).toUpperCase() + agent.status.slice(1)
          )}
        </span>
        <span className="text-xs text-gray-500">
          {agent.connections.length} connections
        </span>
      </div>
    </div>
  );
};

// Agent Library Panel
const AgentLibrary: React.FC<{
  onAddAgent: (type: Agent['type']) => void;
}> = ({ onAddAgent }) => {
  const agentTypes = [
    {
      type: 'security' as const,
      name: 'Security Agent',
      description: 'Monitors security compliance',
      icon: ShieldCheckIcon,
      color: 'text-vanguard-blue',
      bgColor: 'bg-vanguard-blue/10',
      borderColor: 'border-vanguard-blue/30',
    },
    {
      type: 'integrity' as const,
      name: 'Integrity Agent',
      description: 'Validates data integrity',
      icon: ExclamationTriangleIcon,
      color: 'text-vanguard-red',
      bgColor: 'bg-vanguard-red/10',
      borderColor: 'border-vanguard-red/30',
    },
    {
      type: 'accuracy' as const,
      name: 'Accuracy Agent',
      description: 'Ensures output accuracy',
      icon: ChartBarIcon,
      color: 'text-vanguard-green',
      bgColor: 'bg-vanguard-green/10',
      borderColor: 'border-vanguard-green/30',
    },
    {
      type: 'custom' as const,
      name: 'Custom Agent',
      description: 'Configure custom logic',
      icon: BeakerIcon,
      color: 'text-seraphim-gold',
      bgColor: 'bg-seraphim-gold/10',
      borderColor: 'border-seraphim-gold/30',
    },
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <CubeTransparentIcon className="h-5 w-5 text-seraphim-gold mr-2" />
        Agent Library
      </h3>
      
      <div className="space-y-3">
        {agentTypes.map((agentType) => (
          <motion.button
            key={agentType.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddAgent(agentType.type)}
            className={`
              w-full p-3 rounded-lg border text-left transition-all
              ${agentType.bgColor} ${agentType.borderColor}
              hover:border-seraphim-gold/50
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
          </motion.button>
        ))}
      </div>
    </Card>
  );
};

// Main Agent Orchestration Component
const AgentOrchestrationContent: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingAgentId, setDraggingAgentId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Safely get context with fallback
  const [localUseCases, setLocalUseCases] = useState<UseCase[]>([
    {
      id: 'oilfield-land-lease',
      name: 'Oilfield Land Lease',
      description: 'Automated workflow for processing and analyzing land lease agreements',
      category: 'Real Estate',
      vertical: 'Energy',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  const [localSelectedUseCase, setLocalSelectedUseCase] = useState('custom');
  
  let useCases = localUseCases;
  let selectedUseCase = localSelectedUseCase;
  let setSelectedUseCase = (value: string) => setLocalSelectedUseCase(value);
  
  // Try to use context if available
  try {
    const context = useUseCaseContext();
    useCases = context.useCases || localUseCases;
    selectedUseCase = context.selectedUseCase || localSelectedUseCase;
    setSelectedUseCase = context.setSelectedUseCase || ((value: string) => setLocalSelectedUseCase(value));
  } catch (err) {
    console.warn('UseCaseContext not available, using local state');
  }
  
  // Initialize with loading state
  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Load agent graph when use case changes
  useEffect(() => {
    if (selectedUseCase && selectedUseCase !== 'custom') {
      loadAgentGraph(selectedUseCase);
    } else if (selectedUseCase === 'custom') {
      // Clear the canvas for custom mode
      setAgents([]);
      setConnections([]);
      setHasUnsavedChanges(false);
    }
  }, [selectedUseCase]);
  
  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Show error state
  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const loadAgentGraph = async (useCaseId: string) => {
    try {
      const graph = await useCaseService.getAgentGraph(useCaseId);
      if (graph) {
        // Convert graph agents to our Agent type
        const convertedAgents: Agent[] = graph.agents.map(agent => ({
          ...agent,
          status: 'inactive' as const,
          position: agent.position || { x: 100, y: 100 },
        }));
        setAgents(convertedAgents);
        setConnections(graph.connections);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to load agent graph:', error);
      toast.error('Failed to load agent configuration');
    }
  };

  const saveAgentGraph = async () => {
    if (selectedUseCase === 'custom') {
      toast.error('Cannot save custom configurations. Please select a use case.');
      return;
    }

    setIsSaving(true);
    try {
      await useCaseService.saveAgentGraph(selectedUseCase, {
        agents: agents.map(({ status, ...agent }) => agent), // Remove status before saving
        connections,
      });
      setHasUnsavedChanges(false);
      toast.success('Agent configuration saved successfully');
    } catch (error) {
      console.error('Failed to save agent graph:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new agent
  const handleAddAgent = useCallback((type: Agent['type']) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Agent ${agents.length + 1}`,
      type,
      status: 'inactive',
      position: { x: 50 + (agents.length % 3) * 250, y: 50 + Math.floor(agents.length / 3) * 150 },
      connections: [],
    };
    setAgents([...agents, newAgent]);
    setHasUnsavedChanges(true);
  }, [agents]);

  // Handle drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, agentId: string) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', agentId); // Use text/plain for better compatibility
    
    // Calculate offset from mouse position to agent position
    const agent = agents.find(a => a.id === agentId);
    if (agent && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const agentElement = e.currentTarget as HTMLElement;
      const agentRect = agentElement.getBoundingClientRect();
      const offsetX = e.clientX - agentRect.left;
      const offsetY = e.clientY - agentRect.top;
      setDragOffset({ x: offsetX, y: offsetY });
    }
    
    // Create a drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.5';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, dragOffset.x, dragOffset.y);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, [agents, dragOffset]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const agentId = e.dataTransfer.getData('text/plain');
    const canvas = canvasRef.current;
    
    if (canvas && agentId) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;
      
      // Ensure the agent stays within canvas bounds
      const maxX = rect.width - 192; // Agent card width
      const maxY = rect.height - 120; // Approximate agent card height
      
      setAgents(prevAgents => prevAgents.map(agent =>
        agent.id === agentId
          ? {
              ...agent,
              position: {
                x: Math.max(10, Math.min(x, maxX)),
                y: Math.max(10, Math.min(y, maxY))
              }
            }
          : agent
      ));
    }
  }, [dragOffset]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Toggle agent status
  const handleToggleStatus = useCallback((agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            status: agent.status === 'active' ? 'inactive' : 
                   agent.status === 'inactive' ? 'processing' : 'active'
          }
        : agent
    ));
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
    setHasUnsavedChanges(true);
  }, [agents, connections, selectedAgent]);

  // Handle connections
  const handleAgentClick = useCallback((agentId: string) => {
    if (isConnecting && connectingFrom && connectingFrom !== agentId) {
      // Create connection
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectingFrom,
        to: agentId,
        type: 'data',
      };
      setConnections([...connections, newConnection]);
      
      // Update agent connections
      setAgents(agents.map(agent => {
        if (agent.id === connectingFrom) {
          return { ...agent, connections: [...agent.connections, agentId] };
        }
        return agent;
      }));
      
      setIsConnecting(false);
      setConnectingFrom(null);
      setHasUnsavedChanges(true);
    } else {
      setSelectedAgent(agentId);
    }
  }, [isConnecting, connectingFrom, connections, agents]);

  // Start connection mode
  const handleStartConnection = useCallback(() => {
    if (selectedAgent) {
      setIsConnecting(true);
      setConnectingFrom(selectedAgent);
    }
  }, [selectedAgent]);

  // Deploy workflow
  const handleDeployWorkflow = async () => {
    // Validate orchestration
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
      // Save the orchestration first
      await saveAgentGraph();
      
      // Prepare deployment data
      const deploymentData = {
        useCaseId: selectedUseCase,
        agents: agents.map(({ status, ...agent }) => agent),
        connections: connections,
      };

      // Call deployment API (with fallback for development)
      try {
        await api.post('/deployment/start', deploymentData);
      } catch (error) {
        console.log('Using mock deployment for development');
      }

      // Show success notification
      toast.success(`Deployment initiated for ${useCases.find(uc => uc.id === selectedUseCase)?.name || selectedUseCase}`);
      
      // Navigate to deployment page with state to trigger auto-start
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
      
      const x1 = (fromAgent.position?.x || 0) + 96; // Center of agent card
      const y1 = (fromAgent.position?.y || 0) + 40;
      const x2 = (toAgent.position?.x || 0) + 96;
      const y2 = (toAgent.position?.y || 0) + 40;
      
      return (
        <svg
          key={connection.id}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#D4AF37"
              />
            </marker>
          </defs>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#D4AF37"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            className="opacity-50"
          />
        </svg>
      );
    });
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <SparklesIcon className="h-6 w-6 text-seraphim-gold mr-2" />
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
                disabled={false}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-seraphim-gold appearance-none pr-10"
              >
                <option value="custom">Custom/Global</option>
                {useCases.map(useCase => (
                  <option key={useCase.id} value={useCase.id}>
                    {useCase.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            
            {selectedUseCase !== 'custom' && (
              <Button
                variant="primary"
                size="sm"
                onClick={saveAgentGraph}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
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
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleStartConnection}
                disabled={!selectedAgent || isConnecting}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                {isConnecting ? 'Select Target Agent' : 'Create Connection'}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  setAgents(agents.map(a => ({ ...a, status: 'active' as const })));
                }}
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Activate All
              </Button>
              
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
              ref={canvasRef}
              className={`absolute inset-0 bg-grid-pattern transition-opacity ${
                isDragging ? 'bg-seraphim-gold/5' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                backgroundImage: `
                  linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            >
              {/* Render connections */}
              {renderConnections()}
              
              {/* Render agents */}
              <AnimatePresence>
                {agents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgent === agent.id}
                    isDragging={draggingAgentId === agent.id}
                    onSelect={() => handleAgentClick(agent.id)}
                    onDragStart={(e) => {
                      setDraggingAgentId(agent.id);
                      handleDragStart(e, agent.id);
                    }}
                    onDragEnd={() => {
                      setDraggingAgentId(null);
                      handleDragEnd();
                    }}
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
          </Card>
          
          {/* Status Bar */}
          <Card className="mt-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-vanguard-green mr-2" />
                  <span className="text-sm text-gray-400">
                    Active: {agents.filter(a => a.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center">
                  <CogIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-400">
                    Processing: {agents.filter(a => a.status === 'processing').length}
                  </span>
                </div>
                <div className="flex items-center">
                  <LinkIcon className="h-5 w-5 text-seraphim-gold mr-2" />
                  <span className="text-sm text-gray-400">
                    Connections: {connections.length}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {hasUnsavedChanges && (
                  <span className="text-xs text-yellow-500">Unsaved changes</span>
                )}
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Wrapper component with error boundary
const AgentOrchestration: React.FC = () => {
  return (
    <ErrorBoundary>
      <AgentOrchestrationContent />
    </ErrorBoundary>
  );
};

export default AgentOrchestration;