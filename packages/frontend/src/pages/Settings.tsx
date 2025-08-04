import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface SystemSettings {
  general: {
    systemName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
  };
  security: {
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireMFA: boolean;
    allowedDomains: string[];
  };
  llm: {
    defaultProvider: string;
    defaultModel: string;
    maxTokens: number;
    temperature: number;
    timeout: number; // seconds
    retryAttempts: number;
  };
  agents: {
    enabledAgents: string[];
    defaultThresholds: {
      accuracy: number;
      bias: number;
      toxicity: number;
      hallucination: number;
      pii: number;
    };
    autoAnalyze: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    slackWebhook?: string;
    teamsEnabled: boolean;
    teamsWebhook?: string;
    criticalAlertChannels: string[];
  };
  export: {
    maxExportSize: number; // MB
    allowedFormats: string[];
    includeMetadata: boolean;
    watermarkEnabled: boolean;
  };
}

const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'llm' | 'agents' | 'notifications' | 'export'>('general');
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/api/settings');
      return response.data as SystemSettings;
    }
  });

  const [formData, setFormData] = useState<SystemSettings | null>(null);

  React.useEffect(() => {
    if (settings && !formData) {
      setFormData(settings);
    }
  }, [settings, formData]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SystemSettings>) => {
      const response = await api.put('/api/settings', updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setHasChanges(false);
    }
  });

  const handleSave = async () => {
    if (!formData) return;
    await updateSettingsMutation.mutateAsync(formData);
  };

  const handleInputChange = (section: keyof SystemSettings, field: string, value: any) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
    setHasChanges(true);
  };

  const handleArrayChange = (section: keyof SystemSettings, field: string, index: number, value: string) => {
    if (!formData) return;
    
    const newArray = [...(formData[section] as any)[field]];
    newArray[index] = value;
    
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: newArray
      }
    });
    setHasChanges(true);
  };

  const handleArrayAdd = (section: keyof SystemSettings, field: string) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: [...(formData[section] as any)[field], '']
      }
    });
    setHasChanges(true);
  };

  const handleArrayRemove = (section: keyof SystemSettings, field: string, index: number) => {
    if (!formData) return;
    
    const newArray = [...(formData[section] as any)[field]];
    newArray.splice(index, 1);
    
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: newArray
      }
    });
    setHasChanges(true);
  };

  if (isLoading || !formData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure system settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['general', 'security', 'llm', 'agents', 'notifications', 'export'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System Name
              </label>
              <input
                type="text"
                value={formData.general.systemName}
                onChange={(e) => handleInputChange('general', 'systemName', e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={formData.general.supportEmail}
                onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.general.maintenanceMode}
                  onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maintenance Mode
                </span>
              </label>
            </div>
            {formData.general.maintenanceMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maintenance Message
                </label>
                <textarea
                  value={formData.general.maintenanceMessage || ''}
                  onChange={(e) => handleInputChange('general', 'maintenanceMessage', e.target.value)}
                  disabled={!isAdmin}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
            )}
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={formData.security.sessionTimeout}
                onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                disabled={!isAdmin}
                min={5}
                max={1440}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={formData.security.maxLoginAttempts}
                onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                disabled={!isAdmin}
                min={3}
                max={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={formData.security.passwordMinLength}
                onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                disabled={!isAdmin}
                min={6}
                max={32}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.security.requireMFA}
                  onChange={(e) => handleInputChange('security', 'requireMFA', e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Require Multi-Factor Authentication
                </span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Allowed Email Domains
              </label>
              <div className="space-y-2">
                {formData.security.allowedDomains.map((domain, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => handleArrayChange('security', 'allowedDomains', index, e.target.value)}
                      disabled={!isAdmin}
                      placeholder="example.com"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                    {isAdmin && (
                      <button
                        onClick={() => handleArrayRemove('security', 'allowedDomains', index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => handleArrayAdd('security', 'allowedDomains')}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    + Add Domain
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LLM Settings */}
        {activeTab === 'llm' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Provider
              </label>
              <select
                value={formData.llm.defaultProvider}
                onChange={(e) => handleInputChange('llm', 'defaultProvider', e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="azure">Azure OpenAI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Model
              </label>
              <input
                type="text"
                value={formData.llm.defaultModel}
                onChange={(e) => handleInputChange('llm', 'defaultModel', e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                value={formData.llm.maxTokens}
                onChange={(e) => handleInputChange('llm', 'maxTokens', parseInt(e.target.value))}
                disabled={!isAdmin}
                min={100}
                max={32000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature
              </label>
              <input
                type="number"
                value={formData.llm.temperature}
                onChange={(e) => handleInputChange('llm', 'temperature', parseFloat(e.target.value))}
                disabled={!isAdmin}
                min={0}
                max={2}
                step={0.1}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (seconds)
              </label>
              <input
                type="number"
                value={formData.llm.timeout}
                onChange={(e) => handleInputChange('llm', 'timeout', parseInt(e.target.value))}
                disabled={!isAdmin}
                min={10}
                max={300}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retry Attempts
              </label>
              <input
                type="number"
                value={formData.llm.retryAttempts}
                onChange={(e) => handleInputChange('llm', 'retryAttempts', parseInt(e.target.value))}
                disabled={!isAdmin}
                min={0}
                max={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>
        )}

        {/* Agent Settings */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enabled Agents
              </label>
              <div className="space-y-2">
                {['accuracy', 'bias', 'toxicity', 'hallucination', 'pii', 'explainability', 'source_verifier', 'decision_tree', 'ethical_alignment'].map((agent) => (
                  <label key={agent} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.agents.enabledAgents.includes(agent)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('agents', 'enabledAgents', [...formData.agents.enabledAgents, agent]);
                        } else {
                          handleInputChange('agents', 'enabledAgents', formData.agents.enabledAgents.filter(a => a !== agent));
                        }
                      }}
                      disabled={!isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {agent.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Thresholds
              </label>
              <div className="space-y-3">
                {Object.entries(formData.agents.defaultThresholds).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
                      {key} (0-100)
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleInputChange('agents', 'defaultThresholds', {
                        ...formData.agents.defaultThresholds,
                        [key]: parseInt(e.target.value)
                      })}
                      disabled={!isAdmin}
                      min={0}
                      max={100}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.agents.autoAnalyze}
                  onChange={(e) => handleInputChange('agents', 'autoAnalyze', e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-analyze new prompts
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.emailEnabled}
                  onChange={(e) => handleInputChange('notifications', 'emailEnabled', e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Email Notifications
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.slackEnabled}
                  onChange={(e) => handleInputChange('notifications', 'slackEnabled', e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Slack Notifications
                </span>
              </label>
              {formData.notifications.slackEnabled && (
                <input
                  type="text"
                  value={formData.notifications.slackWebhook || ''}
                  onChange={(e) => handleInputChange('notifications', 'slackWebhook', e.target.value)}
                  disabled={!isAdmin}
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              )}
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifications.teamsEnabled}
                  onChange={(e) => handleInputChange('notifications', 'teamsEnabled', e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Microsoft Teams Notifications
                </span>
              </label>
              {formData.notifications.teamsEnabled && (
                <input
                  type="text"
                  value={formData.notifications.teamsWebhook || ''}
                  onChange={(e) => handleInputChange('notifications', 'teamsWebhook', e.target.value)}
                  disabled={!isAdmin}
                  placeholder="https://outlook.office.com/webhook/..."
                  className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Critical Alert Channels
              </label>
              <div className="space-y-2">
                {['email', 'slack', 'teams', 'sms'].map((channel) => (
                  <label key={channel} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notifications.criticalAlertChannels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('notifications', 'criticalAlertChannels', [...formData.notifications.criticalAlertChannels, channel]);
                        } else {
                          handleInputChange('notifications', 'criticalAlertChannels', formData.notifications.criticalAlertChannels.filter(c => c !== channel));
                        }
                      }}
                      disabled={!isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {channel}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export Settings */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Export Size (MB)
              </label>
              <input
                type="number"
                value={formData.export.maxExportSize}
                onChange={(e) => handleInputChange('export', 'maxExportSize', parseInt(e.target.value))}
                disabled={!isAdmin}
                min={1}
                max={1000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Allowed Export Formats
              </label>
              <div className="space-y-2">
                {['csv', 'pdf', 'json', 'xlsx'].map((format) => (
                  <label key={format} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.export.allowedFormats.includes(format)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('export', 'allowedFormats', [...formData.export.allowedFormats, format]);
                        } else {
                          handleInputChange('export', 'allowedFormats', formData.export.allowedFormats.filter(f => f !== format));
                        }
                      }}
                      disabled={!isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 uppercase">
                      {format}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.export.includeMetadata}
                  onChange={(e) => handleInputChange('export', 'includeMetadata', e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include Metadata in Exports
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.export.watermarkEnabled}
                  onChange={(e) => handleInputChange('export', 'watermarkEnabled', e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Add Watermark to Exports
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {isAdmin && hasChanges && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;