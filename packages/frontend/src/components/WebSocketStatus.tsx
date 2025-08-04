/**
 * WebSocket Status Indicator
 * 
 * Shows real-time connection status and recent updates
 */

import React, { useEffect, useState } from 'react';
import { useWebSocket, WSEvent } from '../services/websocket.service';
import { Badge } from './Badge';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import {
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export const WebSocketStatus: React.FC = () => {
  const {
    isConnected,
    connectionError,
    lastMessage,
    messageHistory,
    connect,
    disconnect,
    clearHistory
  } = useWebSocket();

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track unread messages
  useEffect(() => {
    if (lastMessage && !showNotifications) {
      setUnreadCount(prev => prev + 1);
    }
  }, [lastMessage, showNotifications]);

  // Clear unread when notifications are shown
  useEffect(() => {
    if (showNotifications) {
      setUnreadCount(0);
    }
  }, [showNotifications]);

  // Get message type label
  const getMessageLabel = (event: WSEvent) => {
    switch (event) {
      case WSEvent.DATA_UPDATE:
        return 'Data Update';
      case WSEvent.DATA_INGESTED:
        return 'Data Ingested';
      case WSEvent.AGENT_STATUS_CHANGE:
        return 'Agent Status';
      case WSEvent.WORKFLOW_PROGRESS:
        return 'Workflow Progress';
      case WSEvent.METRIC_UPDATE:
        return 'Metric Update';
      default:
        return 'System Event';
    }
  };

  // Get message color
  const getMessageColor = (event: WSEvent) => {
    if (event.includes('error') || event.includes('failed')) return 'text-red-400';
    if (event.includes('complete') || event.includes('success')) return 'text-green-400';
    if (event.includes('progress') || event.includes('started')) return 'text-blue-400';
    return 'text-gray-400';
  };

  return (
    <>
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
          <WifiIcon className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-gray-500'}`} />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {connectionError && (
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <BellIcon className="w-5 h-5 text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Reconnect Button */}
        {!isConnected && (
          <Button
            variant="secondary"
            size="small"
            onClick={() => connect()}
            className="flex items-center gap-1"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Reconnect
          </Button>
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 z-50">
          <Card className="p-4 bg-gray-800 border-gray-700 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Real-time Updates</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={clearHistory}
                  className="text-xs"
                >
                  Clear
                </Button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded hover:bg-gray-700"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messageHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent updates
                </p>
              ) : (
                messageHistory.slice().reverse().map((msg, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${getMessageColor(msg.event)}`}>
                          {getMessageLabel(msg.event)}
                        </p>
                        {msg.data && (
                          <p className="text-xs text-gray-400 mt-1">
                            {typeof msg.data === 'string' 
                              ? msg.data 
                              : JSON.stringify(msg.data).substring(0, 100) + '...'}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

// Mini status indicator for embedding
export const WebSocketStatusMini: React.FC = () => {
  const { isConnected } = useWebSocket();
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`} />
      <span className="text-xs text-gray-400">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
};

export default WebSocketStatus;