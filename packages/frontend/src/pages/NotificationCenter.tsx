import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'workflow' | 'agent' | 'compliance' | 'security';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: {
    workflowId?: string;
    promptId?: string;
    agentId?: string;
    link?: string;
  };
}

interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
    categories: string[];
  };
  inApp: {
    enabled: boolean;
    categories: string[];
  };
  slack: {
    enabled: boolean;
    webhook?: string;
    categories: string[];
  };
  teams: {
    enabled: boolean;
    webhook?: string;
    categories: string[];
  };
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Fetch notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications', filterCategory, filterType, showUnreadOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterType) params.append('type', filterType);
      if (showUnreadOnly) params.append('unread', 'true');
      
      const response = await api.get(`/api/notifications?${params.toString()}`);
      return response.data as { notifications: Notification[]; unreadCount: number };
    }
  });

  // Fetch preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await api.get('/api/notifications/preferences');
      return response.data as NotificationPreferences;
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const response = await api.put('/api/notifications/preferences', updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    }
  });

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsReadMutation.mutateAsync(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotificationMutation.mutateAsync(notificationId);
  };

  const handlePreferenceChange = async (channel: keyof NotificationPreferences, field: string, value: any) => {
    if (!preferences) return;
    
    const updates = {
      [channel]: {
        ...preferences[channel],
        [field]: value
      }
    };
    
    await updatePreferencesMutation.mutateAsync(updates);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return (
          <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'workflow':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'agent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'compliance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (notificationsLoading || preferencesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Center</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your notifications and preferences
            </p>
          </div>
          {notificationsData && notificationsData.unreadCount > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {notificationsData.unreadCount} unread
              </span>
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              <option value="system">System</option>
              <option value="workflow">Workflow</option>
              <option value="agent">Agent</option>
              <option value="compliance">Compliance</option>
              <option value="security">Security</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Unread only
              </span>
            </label>
          </div>

          {/* Notification List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {notificationsData && notificationsData.notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notificationsData.notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      !notification.read ? 'bg-blue-50 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(notification.category)}`}>
                              {notification.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          {notification.metadata?.link && (
                            <a
                              href={notification.metadata.link}
                              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View Details
                            </a>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && preferences && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-8">
            {/* Email Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.email.enabled}
                    onChange={(e) => handlePreferenceChange('email', 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable email notifications
                  </span>
                </label>
                {preferences.email.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frequency
                      </label>
                      <select
                        value={preferences.email.frequency}
                        onChange={(e) => handlePreferenceChange('email', 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="hourly">Hourly Digest</option>
                        <option value="daily">Daily Digest</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categories
                      </label>
                      <div className="space-y-2">
                        {['system', 'workflow', 'agent', 'compliance', 'security'].map((category) => (
                          <label key={category} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.email.categories.includes(category)}
                              onChange={(e) => {
                                const newCategories = e.target.checked
                                  ? [...preferences.email.categories, category]
                                  : preferences.email.categories.filter(c => c !== category);
                                handlePreferenceChange('email', 'categories', newCategories);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* In-App Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">In-App Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.inApp.enabled}
                    onChange={(e) => handlePreferenceChange('inApp', 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable in-app notifications
                  </span>
                </label>
                {preferences.inApp.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categories
                    </label>
                    <div className="space-y-2">
                      {['system', 'workflow', 'agent', 'compliance', 'security'].map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.inApp.categories.includes(category)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...preferences.inApp.categories, category]
                                : preferences.inApp.categories.filter(c => c !== category);
                              handlePreferenceChange('inApp', 'categories', newCategories);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Slack Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Slack Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.slack.enabled}
                    onChange={(e) => handlePreferenceChange('slack', 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable Slack notifications
                  </span>
                </label>
                {preferences.slack.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="text"
                        value={preferences.slack.webhook || ''}
                        onChange={(e) => handlePreferenceChange('slack', 'webhook', e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categories
                      </label>
                      <div className="space-y-2">
                        {['system', 'workflow', 'agent', 'compliance', 'security'].map((category) => (
                          <label key={category} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.slack.categories.includes(category)}
                              onChange={(e) => {
                                const newCategories = e.target.checked
                                  ? [...preferences.slack.categories, category]
                                  : preferences.slack.categories.filter(c => c !== category);
                                handlePreferenceChange('slack', 'categories', newCategories);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Teams Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Microsoft Teams Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.teams.enabled}
                    onChange={(e) => handlePreferenceChange('teams', 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable Teams notifications
                  </span>
                </label>
                {preferences.teams.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="text"
                        value={preferences.teams.webhook || ''}
                        onChange={(e) => handlePreferenceChange('teams', 'webhook', e.target.value)}
                        placeholder="https://outlook.office.com/webhook/..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categories
                      </label>
                      <div className="space-y-2">
                        {['system', 'workflow', 'agent', 'compliance', 'security'].map((category) => (
                          <label key={category} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.teams.categories.includes(category)}
                              onChange={(e) => {
                                const newCategories = e.target.checked
                                  ? [...preferences.teams.categories, category]
                                  : preferences.teams.categories.filter(c => c !== category);
                                handlePreferenceChange('teams', 'categories', newCategories);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;