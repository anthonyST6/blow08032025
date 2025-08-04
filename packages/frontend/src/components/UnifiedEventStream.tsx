import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PuzzlePieceIcon,
  DocumentMagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ServerIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Card } from './ui/Card';

interface EventStreamItem {
  id: string;
  timestamp: Date;
  type: 'integration' | 'audit' | 'system' | 'workflow';
  severity: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
  details?: Record<string, any>;
  workflowId?: string;
  agentId?: string;
}

interface UnifiedEventStreamProps {
  workflowId?: string;
  isActive: boolean;
  filter?: 'all' | 'integration' | 'audit' | 'system' | 'workflow';
}

const UnifiedEventStream: React.FC<UnifiedEventStreamProps> = ({
  workflowId,
  isActive,
  filter = 'all',
}) => {
  const [events, setEvents] = useState<EventStreamItem[]>([]);
  const [activeFilter, setActiveFilter] = useState(filter);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (isActive && workflowId) {
      setIsStreaming(true);
      simulateEventStream();
    }
    
    return () => {
      setIsStreaming(false);
    };
  }, [isActive, workflowId]);

  const simulateEventStream = () => {
    // Initial events
    const initialEvents: EventStreamItem[] = [
      {
        id: `event-${Date.now()}-1`,
        timestamp: new Date(),
        type: 'workflow',
        severity: 'info',
        source: 'Workflow Engine',
        message: 'Workflow execution started',
        workflowId,
      },
      {
        id: `event-${Date.now()}-2`,
        timestamp: new Date(),
        type: 'audit',
        severity: 'info',
        source: 'Audit Logger',
        message: 'User initiated Oilfield Land Lease workflow',
        details: { user: 'admin@seraphim.com', action: 'workflow.start' },
        workflowId,
      },
    ];
    
    setEvents(initialEvents);
    
    // Simulate ongoing events
    const eventTemplates = [
      {
        type: 'integration' as const,
        severity: 'success' as const,
        source: 'Data Ingestion API',
        messages: [
          'Successfully connected to data source',
          'Retrieved 847 lease records',
          'Data validation completed',
          'Data transformation pipeline initiated',
        ],
      },
      {
        type: 'audit' as const,
        severity: 'info' as const,
        source: 'Security Monitor',
        messages: [
          'Agent authentication successful',
          'Data access granted for lease analysis',
          'Compliance check initiated',
          'Regulatory validation in progress',
        ],
      },
      {
        type: 'system' as const,
        severity: 'info' as const,
        source: 'Resource Monitor',
        messages: [
          'CPU utilization: 45%',
          'Memory usage: 2.3GB',
          'Network latency: 23ms',
          'Storage I/O: Normal',
        ],
      },
      {
        type: 'workflow' as const,
        severity: 'success' as const,
        source: 'Agent Orchestrator',
        messages: [
          'Data Ingestion Agent completed successfully',
          'Analytics Agent processing started',
          'Compliance validation passed',
          'Report generation initiated',
        ],
      },
      {
        type: 'integration' as const,
        severity: 'warning' as const,
        source: 'External API',
        messages: [
          'Rate limit approaching (80% utilized)',
          'Retry attempt 1 of 3 for geocoding service',
          'Fallback to cached data for 3 records',
        ],
      },
    ];
    
    let eventCount = 0;
    const eventInterval = setInterval(() => {
      if (eventCount >= 20) {
        clearInterval(eventInterval);
        
        // Add completion event
        const completionEvent: EventStreamItem = {
          id: `event-${Date.now()}-complete`,
          timestamp: new Date(),
          type: 'workflow',
          severity: 'success',
          source: 'Workflow Engine',
          message: 'Workflow execution completed successfully',
          details: {
            duration: '3m 42s',
            recordsProcessed: 847,
            agentsExecuted: 6,
          },
          workflowId,
        };
        
        setEvents(prev => [completionEvent, ...prev]);
        return;
      }
      
      // Generate random event
      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const message = template.messages[Math.floor(Math.random() * template.messages.length)];
      
      const newEvent: EventStreamItem = {
        id: `event-${Date.now()}-${eventCount}`,
        timestamp: new Date(),
        type: template.type,
        severity: template.severity,
        source: template.source,
        message,
        workflowId,
      };
      
      setEvents(prev => [newEvent, ...prev]);
      eventCount++;
    }, 1500);
  };

  const getEventIcon = (type: EventStreamItem['type']) => {
    switch (type) {
      case 'integration':
        return PuzzlePieceIcon;
      case 'audit':
        return DocumentMagnifyingGlassIcon;
      case 'system':
        return ServerIcon;
      case 'workflow':
        return CodeBracketIcon;
    }
  };

  const getSeverityIcon = (severity: EventStreamItem['severity']) => {
    switch (severity) {
      case 'info':
        return <InformationCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-vanguard-green" />;
    }
  };

  const getSeverityColor = (severity: EventStreamItem['severity']) => {
    switch (severity) {
      case 'info':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      case 'success':
        return 'border-vanguard-green/30 bg-vanguard-green/5';
    }
  };

  const getTypeColor = (type: EventStreamItem['type']) => {
    switch (type) {
      case 'integration':
        return 'text-purple-400';
      case 'audit':
        return 'text-orange-400';
      case 'system':
        return 'text-cyan-400';
      case 'workflow':
        return 'text-seraphim-gold';
    }
  };

  const filteredEvents = activeFilter === 'all' 
    ? events 
    : events.filter(event => event.type === activeFilter);

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-4 w-4 text-gray-400" />
          <div className="flex space-x-1">
            {(['all', 'integration', 'audit', 'system', 'workflow'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setActiveFilter(filterType)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  activeFilter === filterType
                    ? 'bg-seraphim-gold text-black font-medium'
                    : 'bg-black/50 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {isStreaming && (
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <ArrowPathIcon className="h-3 w-3 animate-spin" />
            <span>Live streaming</span>
          </div>
        )}
      </div>

      {/* Event Stream */}
      <Card variant="glass-dark" effect="glow">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredEvents.slice(0, 50).map((event) => {
              const Icon = getEventIcon(event.type);
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded-lg border ${getSeverityColor(event.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {getSeverityIcon(event.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-4 w-4 ${getTypeColor(event.type)}`} />
                          <span className="text-xs font-medium text-gray-400">{event.source}</span>
                        </div>
                        <time className="text-xs text-gray-500">
                          {event.timestamp.toLocaleTimeString()}
                        </time>
                      </div>
                      <p className="text-sm text-white mt-1">{event.message}</p>
                      
                      {/* Event Details */}
                      {event.details && (
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(event.details).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: <span className="text-gray-400">{value}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events to display</p>
            </div>
          )}
        </div>
      </Card>

      {/* Event Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['integration', 'audit', 'system', 'workflow'] as const).map((type) => {
          const count = events.filter(e => e.type === type).length;
          const Icon = getEventIcon(type);
          
          return (
            <Card key={type} variant="glass" padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${getTypeColor(type)}`} />
                  <span className="text-xs text-gray-400 capitalize">{type}</span>
                </div>
                <span className="text-sm font-semibold text-white">{count}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedEventStream;