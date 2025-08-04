import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../contexts/WebSocketContext';
import { WebSocketMessage, NotificationPayload } from '../services/websocket';
import { Card } from './Card';
import { Button } from './Button';

interface NotificationItemProps {
  notification: WebSocketMessage;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const payload = notification.payload as NotificationPayload;
  
  const severityConfig = {
    info: {
      icon: InformationCircleIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    success: {
      icon: CheckCircleIcon,
      color: 'text-vanguard-green',
      bgColor: 'bg-vanguard-green/10',
      borderColor: 'border-vanguard-green/30',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    error: {
      icon: ExclamationCircleIcon,
      color: 'text-vanguard-red',
      bgColor: 'bg-vanguard-red/10',
      borderColor: 'border-vanguard-red/30',
    },
  };

  const config = severityConfig[payload.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
      className={`relative p-4 rounded-lg border ${config.borderColor} ${config.bgColor} backdrop-blur-sm`}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">{payload.title}</h4>
              <p className="text-sm text-gray-300 mt-1">{payload.message}</p>
              
              {payload.source && (
                <p className="text-xs text-gray-500 mt-2">Source: {payload.source}</p>
              )}
            </div>
            
            <button
              onClick={() => onDismiss(notification.id)}
              className="ml-4 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <time className="text-xs text-gray-500 flex items-center">
              <ClockIcon className="w-3 h-3 mr-1" />
              {new Date(notification.timestamp).toLocaleTimeString()}
            </time>
            
            {payload.actionUrl && (
              <a
                href={payload.actionUrl}
                className={`text-xs ${config.color} hover:underline`}
              >
                View Details →
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, clearNotifications, isConnected } = useWebSocket();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  
  // Filter out dismissed notifications
  const activeNotifications = notifications.filter(n => !dismissedIds.has(n.id));

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const handleClearAll = () => {
    clearNotifications();
    setDismissedIds(new Set());
  };

  // Auto-hide old notifications
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      
      setDismissedIds(prev => {
        const newSet = new Set(prev);
        notifications.forEach(n => {
          if (n.timestamp.getTime() < fiveMinutesAgo) {
            newSet.add(n.id);
          }
        });
        return newSet;
      });
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [notifications]);

  return (
    <AnimatePresence>
      {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <BellIcon className="w-5 h-5 mr-2 text-seraphim-gold" />
                      Notifications
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {isConnected ? 'Real-time updates' : 'Disconnected'}
                    </p>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                {/* Actions */}
                {activeNotifications.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {activeNotifications.length} new notification{activeNotifications.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-red-400 hover:text-red-300 flex items-center"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Clear All
                    </button>
                  </div>
                )}
              </div>
              
              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeNotifications.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {activeNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={handleDismiss}
                      />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-12">
                    <BellIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No new notifications</p>
                    <p className="text-sm text-gray-500 mt-2">
                      You're all caught up!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  );
};