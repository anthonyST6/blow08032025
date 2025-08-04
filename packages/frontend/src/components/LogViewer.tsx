import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../contexts/WebSocketContext';
import { WebSocketMessage, LogPayload } from '../services/websocket';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';

interface LogEntryProps {
  log: WebSocketMessage;
  searchTerm: string;
}

const LogEntry: React.FC<LogEntryProps> = ({ log, searchTerm }) => {
  const payload = log.payload as LogPayload;
  
  const levelConfig = {
    debug: {
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30',
    },
    info: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    warn: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    error: {
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
  };

  const config = levelConfig[payload.level];

  // Highlight search term
  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-seraphim-gold/30 text-seraphim-gold font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor} font-mono text-sm`}
    >
      <div className="flex items-start space-x-3">
        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold uppercase ${config.color} ${config.bgColor}`}>
          {payload.level}
        </span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-gray-500 text-xs">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span className="text-seraphim-gold text-xs ml-2">
                {payload.source}
              </span>
              <div className="text-gray-300 mt-1 break-all">
                {highlightText(payload.message)}
              </div>
              
              {payload.metadata && Object.keys(payload.metadata).length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {Object.entries(payload.metadata).map(([key, value]) => (
                    <div key={key} className="ml-4">
                      <span className="text-gray-400">{key}:</span>{' '}
                      <span className="text-gray-300">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {payload.stackTrace && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                    Stack Trace
                  </summary>
                  <pre className="mt-1 text-xs text-gray-500 overflow-x-auto">
                    {payload.stackTrace}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const LogViewer: React.FC = () => {
  const { logs, clearLogs, isConnected } = useWebSocket();
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Filter logs
  const filteredLogs = logs.filter(log => {
    const payload = log.payload as LogPayload;
    
    // Level filter
    if (selectedLevel !== 'all' && payload.level !== selectedLevel) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        payload.message.toLowerCase().includes(searchLower) ||
        payload.source.toLowerCase().includes(searchLower) ||
        JSON.stringify(payload.metadata || {}).toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && !isPaused && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll, isPaused]);

  const handleExport = () => {
    const logData = filteredLogs.map(log => {
      const payload = log.payload as LogPayload;
      return {
        timestamp: log.timestamp,
        level: payload.level,
        source: payload.source,
        message: payload.message,
        metadata: payload.metadata,
        stackTrace: payload.stackTrace,
      };
    });
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
            Real-Time Logs
            <span className={`ml-2 w-2 h-2 rounded-full ${
              isConnected ? 'bg-vanguard-green' : 'bg-red-500'
            }`} />
          </h2>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center"
            >
              {isPaused ? (
                <>
                  <PlayIcon className="w-4 h-4 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <PauseIcon className="w-4 h-4 mr-1" />
                  Pause
                </>
              )}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              className="flex items-center"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Export
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={clearLogs}
              className="flex items-center text-red-400 hover:text-red-300"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
              size="sm"
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-1.5 bg-black/50 border border-gray-700 rounded-lg text-sm text-white focus:border-seraphim-gold focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
          
          <label className="flex items-center text-sm text-gray-400">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="mr-2 rounded border-gray-600 bg-black/50 text-seraphim-gold focus:ring-seraphim-gold"
            />
            Auto-scroll
          </label>
        </div>
      </div>
      
      {/* Log Entries */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        {filteredLogs.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {(isPaused ? filteredLogs : filteredLogs).map(log => (
              <LogEntry
                key={log.id}
                log={log}
                searchTerm={searchTerm}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No logs to display</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm ? 'Try adjusting your search' : 'Waiting for log entries...'}
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Showing {filteredLogs.length} of {logs.length} logs
          </span>
          <span>
            {isPaused && (
              <span className="text-yellow-400 mr-2">
                <PauseIcon className="w-4 h-4 inline mr-1" />
                Paused
              </span>
            )}
            Last update: {logs[0] ? new Date(logs[0].timestamp).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
      </div>
    </Card>
  );
};