import React, { useState } from 'react';
import { 
  XIcon, 
  InformationCircleIcon, 
  ExclamationIcon, 
  XCircleIcon,
  CheckCircleIcon,
  BellIcon
} from '@heroicons/react/outline';
import { DashboardMessage, DashboardSource } from '../services/dashboard-integration.service';
import { useDashboardIntegration } from '../hooks/useDashboardIntegration';

interface DashboardNotificationsProps {
  source: DashboardSource;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
}

export const DashboardNotifications: React.FC<DashboardNotificationsProps> = ({
  source,
  position = 'top-right',
  maxVisible = 3
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { messages, unreadCount, markAsRead, clearMessages } = useDashboardIntegration({
    source,
    autoMarkRead: false
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
      case 'warning':
        return <ExclamationIcon className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      case 'action':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const handleAction = (message: DashboardMessage, action: string) => {
    // Mark as read
    markAsRead(message.id);
    
    // Handle the action
    switch (action) {
      case 'navigate_to_review':
        window.location.href = '/compliance/reviews';
        break;
      case 'approve':
        console.log('Approved:', message.data);
        break;
      case 'reject':
        console.log('Rejected:', message.data);
        break;
      case 'dismiss':
        // Already marked as read
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const visibleMessages = isExpanded ? messages : messages.slice(0, maxVisible);

  if (messages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Notification Bell */}
      {!isExpanded && unreadCount > 0 && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`fixed ${getPositionClasses()} z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors`}
        >
          <BellIcon className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        </button>
      )}

      {/* Notifications Panel */}
      {(isExpanded || messages.length > 0) && (
        <div className={`fixed ${getPositionClasses()} z-50 w-96 max-h-[600px] overflow-hidden`}>
          <div className="bg-white rounded-lg shadow-xl border border-gray-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Notifications {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">({unreadCount} unread)</span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="max-h-[500px] overflow-y-auto">
              {visibleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                    !message.id || message.id === 'unread' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getIcon(message.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {message.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {message.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          From: {message.from} • {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                        {message.actions && message.actions.length > 0 && (
                          <div className="flex items-center space-x-2">
                            {message.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => handleAction(message, action.action)}
                                className={`text-xs px-2 py-1 rounded ${
                                  action.primary
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {messages.length > maxVisible && !isExpanded && (
              <div className="px-4 py-3 bg-gray-50 text-center">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all {messages.length} notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Dashboard Integration Status Component
interface DashboardIntegrationStatusProps {
  source: DashboardSource;
}

export const DashboardIntegrationStatus: React.FC<DashboardIntegrationStatusProps> = ({ source }) => {
  const { messages, unreadCount } = useDashboardIntegration({ source });
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Integration Status</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Connected Dashboards</span>
          <span className="font-medium text-gray-900">4</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Active Messages</span>
          <span className="font-medium text-gray-900">{messages.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Unread</span>
          <span className="font-medium text-red-600">{unreadCount}</span>
        </div>
      </div>
    </div>
  );
};