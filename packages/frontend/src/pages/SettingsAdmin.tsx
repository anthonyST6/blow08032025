import React, { useState } from 'react';
import {
  CogIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  ServerIcon,
  KeyIcon,
  UserGroupIcon,
  ChartBarIcon,
  PaintBrushIcon,
  BeakerIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
  TagIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  settings: Setting[];
}

interface Setting {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'text' | 'number' | 'select' | 'multiselect' | 'color' | 'json';
  value: any;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
  riskLevel?: 'low' | 'medium' | 'high';
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'workflow' | 'prompt' | 'agent' | 'compliance' | 'integration';
  icon: React.ComponentType<any>;
  tags: string[];
  version: string;
  author: string;
  lastModified: Date;
  usageCount: number;
  isPublic: boolean;
  config: any;
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
}

const settingSections: SettingSection[] = [
  {
    id: 'general',
    title: 'General Settings',
    icon: CogIcon,
    description: 'Basic system configuration and preferences',
    settings: [
      {
        id: 'system-name',
        label: 'System Name',
        description: 'Display name for the platform',
        type: 'text',
        value: 'Seraphim Vanguards',
        validation: { required: true },
      },
      {
        id: 'timezone',
        label: 'Default Timezone',
        description: 'System-wide default timezone',
        type: 'select',
        value: 'UTC',
        options: [
          { value: 'UTC', label: 'UTC' },
          { value: 'America/New_York', label: 'Eastern Time' },
          { value: 'America/Chicago', label: 'Central Time' },
          { value: 'America/Los_Angeles', label: 'Pacific Time' },
        ],
      },
      {
        id: 'language',
        label: 'Default Language',
        description: 'Primary language for the interface',
        type: 'select',
        value: 'en',
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
        ],
      },
      {
        id: 'maintenance-mode',
        label: 'Maintenance Mode',
        description: 'Enable maintenance mode to restrict access',
        type: 'toggle',
        value: false,
        riskLevel: 'high',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Authentication',
    icon: ShieldCheckIcon,
    description: 'Security policies and authentication settings',
    settings: [
      {
        id: 'mfa-required',
        label: 'Require MFA',
        description: 'Enforce multi-factor authentication for all users',
        type: 'toggle',
        value: true,
        riskLevel: 'high',
      },
      {
        id: 'session-timeout',
        label: 'Session Timeout (minutes)',
        description: 'Automatic logout after inactivity',
        type: 'number',
        value: 30,
        validation: { min: 5, max: 1440 },
      },
      {
        id: 'password-policy',
        label: 'Password Policy',
        description: 'Minimum password requirements',
        type: 'multiselect',
        value: ['uppercase', 'lowercase', 'numbers', 'special'],
        options: [
          { value: 'uppercase', label: 'Uppercase letters' },
          { value: 'lowercase', label: 'Lowercase letters' },
          { value: 'numbers', label: 'Numbers' },
          { value: 'special', label: 'Special characters' },
        ],
      },
      {
        id: 'ip-whitelist',
        label: 'IP Whitelist',
        description: 'Restrict access to specific IP addresses',
        type: 'json',
        value: [],
        riskLevel: 'medium',
      },
    ],
  },
  {
    id: 'ai-models',
    title: 'AI Model Configuration',
    icon: CpuChipIcon,
    description: 'Configure AI models and inference settings',
    settings: [
      {
        id: 'default-model',
        label: 'Default AI Model',
        description: 'Primary model for AI operations',
        type: 'select',
        value: 'gpt-4',
        options: [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
          { value: 'claude-2', label: 'Claude 2' },
          { value: 'llama-2', label: 'Llama 2' },
        ],
      },
      {
        id: 'temperature',
        label: 'Default Temperature',
        description: 'Model creativity/randomness (0-1)',
        type: 'number',
        value: 0.7,
        validation: { min: 0, max: 1 },
      },
      {
        id: 'max-tokens',
        label: 'Max Tokens',
        description: 'Maximum response length',
        type: 'number',
        value: 2048,
        validation: { min: 100, max: 8192 },
      },
      {
        id: 'rate-limit',
        label: 'API Rate Limit (per minute)',
        description: 'Maximum API calls per minute',
        type: 'number',
        value: 60,
        validation: { min: 1, max: 1000 },
        riskLevel: 'medium',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance & Governance',
    icon: ClipboardDocumentCheckIcon,
    description: 'Regulatory compliance and governance settings',
    settings: [
      {
        id: 'data-retention',
        label: 'Data Retention (days)',
        description: 'How long to retain audit logs',
        type: 'number',
        value: 365,
        validation: { min: 30, max: 3650 },
        riskLevel: 'high',
      },
      {
        id: 'pii-detection',
        label: 'PII Detection',
        description: 'Automatically detect and flag PII',
        type: 'toggle',
        value: true,
      },
      {
        id: 'compliance-frameworks',
        label: 'Active Frameworks',
        description: 'Enabled compliance frameworks',
        type: 'multiselect',
        value: ['gdpr', 'hipaa', 'sox'],
        options: [
          { value: 'gdpr', label: 'GDPR' },
          { value: 'hipaa', label: 'HIPAA' },
          { value: 'sox', label: 'SOX' },
          { value: 'pci-dss', label: 'PCI-DSS' },
          { value: 'iso27001', label: 'ISO 27001' },
        ],
      },
      {
        id: 'audit-level',
        label: 'Audit Level',
        description: 'Granularity of audit logging',
        type: 'select',
        value: 'detailed',
        options: [
          { value: 'minimal', label: 'Minimal' },
          { value: 'standard', label: 'Standard' },
          { value: 'detailed', label: 'Detailed' },
          { value: 'verbose', label: 'Verbose' },
        ],
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications & Alerts',
    icon: BellIcon,
    description: 'Configure system notifications and alerts',
    settings: [
      {
        id: 'email-notifications',
        label: 'Email Notifications',
        description: 'Send email alerts for critical events',
        type: 'toggle',
        value: true,
      },
      {
        id: 'slack-integration',
        label: 'Slack Integration',
        description: 'Send alerts to Slack channels',
        type: 'toggle',
        value: false,
      },
      {
        id: 'alert-threshold',
        label: 'Alert Threshold',
        description: 'Minimum severity for alerts',
        type: 'select',
        value: 'warning',
        options: [
          { value: 'info', label: 'Info' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' },
          { value: 'critical', label: 'Critical' },
        ],
      },
      {
        id: 'notification-channels',
        label: 'Notification Channels',
        description: 'Active notification channels',
        type: 'json',
        value: {
          email: ['admin@company.com'],
          slack: ['#alerts'],
          webhook: [],
        },
      },
    ],
  },
  {
    id: 'appearance',
    title: 'Appearance & Branding',
    icon: PaintBrushIcon,
    description: 'Customize the look and feel',
    settings: [
      {
        id: 'theme',
        label: 'Theme',
        description: 'Visual theme for the interface',
        type: 'select',
        value: 'seraphim-dark',
        options: [
          { value: 'seraphim-dark', label: 'Seraphim Dark' },
          { value: 'seraphim-light', label: 'Seraphim Light' },
          { value: 'vanguard-blue', label: 'Vanguard Blue' },
          { value: 'custom', label: 'Custom' },
        ],
      },
      {
        id: 'primary-color',
        label: 'Primary Color',
        description: 'Main brand color',
        type: 'color',
        value: '#D4AF37',
      },
      {
        id: 'logo-url',
        label: 'Logo URL',
        description: 'Custom logo image URL',
        type: 'text',
        value: '/logo.png',
      },
      {
        id: 'enable-animations',
        label: 'Enable Animations',
        description: 'Show UI animations and transitions',
        type: 'toggle',
        value: true,
      },
    ],
  },
];

const mockTemplates: Template[] = [
  {
    id: 'template-001',
    name: 'Financial Risk Assessment',
    description: 'Complete workflow for assessing financial risks in trading operations',
    category: 'workflow',
    icon: ChartBarIcon,
    tags: ['finance', 'risk', 'trading', 'compliance'],
    version: '2.1.0',
    author: 'Risk Team',
    lastModified: new Date('2024-01-15'),
    usageCount: 156,
    isPublic: true,
    config: {
      steps: 5,
      agents: ['risk-analyzer', 'compliance-checker'],
      estimatedTime: '15 minutes',
    },
    siaScores: {
      security: 95,
      integrity: 92,
      accuracy: 88,
    },
  },
  {
    id: 'template-002',
    name: 'GDPR Compliance Check',
    description: 'Automated GDPR compliance verification for data processing',
    category: 'compliance',
    icon: ShieldCheckIcon,
    tags: ['gdpr', 'privacy', 'compliance', 'data'],
    version: '1.3.0',
    author: 'Compliance Team',
    lastModified: new Date('2024-01-20'),
    usageCount: 89,
    isPublic: true,
    config: {
      checks: 12,
      reportFormat: 'pdf',
      autoRemediation: true,
    },
    siaScores: {
      security: 98,
      integrity: 96,
      accuracy: 94,
    },
  },
  {
    id: 'template-003',
    name: 'Customer Support Agent',
    description: 'AI agent template for customer support interactions',
    category: 'agent',
    icon: UserGroupIcon,
    tags: ['support', 'customer', 'agent', 'chat'],
    version: '3.0.0',
    author: 'AI Team',
    lastModified: new Date('2024-01-18'),
    usageCount: 234,
    isPublic: false,
    config: {
      personality: 'helpful',
      responseTime: 'fast',
      knowledgeBase: 'customer-support-v3',
    },
    siaScores: {
      security: 85,
      integrity: 90,
      accuracy: 92,
    },
  },
  {
    id: 'template-004',
    name: 'Code Review Prompt',
    description: 'Structured prompt for AI-assisted code reviews',
    category: 'prompt',
    icon: CodeBracketIcon,
    tags: ['code', 'review', 'development', 'quality'],
    version: '1.5.0',
    author: 'Dev Team',
    lastModified: new Date('2024-01-22'),
    usageCount: 178,
    isPublic: true,
    config: {
      languages: ['python', 'javascript', 'java'],
      checkTypes: ['security', 'performance', 'style'],
    },
    siaScores: {
      security: 90,
      integrity: 88,
      accuracy: 91,
    },
  },
];

interface SettingItemProps {
  setting: Setting;
  onUpdate: (id: string, value: any) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ setting, onUpdate }) => {
  const renderControl = () => {
    switch (setting.type) {
      case 'toggle':
        return (
          <button
            onClick={() => onUpdate(setting.id, !setting.value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              setting.value ? 'bg-seraphim-gold' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                setting.value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'text':
        return (
          <Input
            value={setting.value}
            onChange={(e) => onUpdate(setting.id, e.target.value)}
            className="max-w-xs"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => onUpdate(setting.id, Number(e.target.value))}
            min={setting.validation?.min}
            max={setting.validation?.max}
            className="max-w-xs"
          />
        );

      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => onUpdate(setting.id, e.target.value)}
            className="px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none max-w-xs"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2 max-w-xs">
            {setting.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={setting.value.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdate(setting.id, [...setting.value, option.value]);
                    } else {
                      onUpdate(setting.id, setting.value.filter((v: string) => v !== option.value));
                    }
                  }}
                  className="rounded border-gray-700 bg-black/50 text-seraphim-gold focus:ring-seraphim-gold"
                />
                <span className="text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={setting.value}
              onChange={(e) => onUpdate(setting.id, e.target.value)}
              className="h-10 w-20 rounded border border-gray-700 bg-black/50"
            />
            <span className="text-sm text-gray-400">{setting.value}</span>
          </div>
        );

      case 'json':
        return (
          <textarea
            value={JSON.stringify(setting.value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onUpdate(setting.id, parsed);
              } catch {
                // Invalid JSON, don't update
              }
            }}
            className="w-full max-w-lg px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-seraphim-gold focus:outline-none"
            rows={6}
          />
        );

      default:
        return null;
    }
  };

  const riskColors = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
  };

  return (
    <div className="py-4 border-b border-gray-800 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-white">{setting.label}</h4>
            {setting.validation?.required && (
              <span className="text-xs text-red-500">*</span>
            )}
            {setting.riskLevel && (
              <span className={`text-xs ${riskColors[setting.riskLevel]}`}>
                {setting.riskLevel.toUpperCase()} RISK
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{setting.description}</p>
        </div>
      </div>
      <div className="mt-3">{renderControl()}</div>
    </div>
  );
};

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onDuplicate: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit, onDelete, onDuplicate }) => {
  const categoryColors = {
    workflow: 'bg-blue-500',
    prompt: 'bg-purple-500',
    agent: 'bg-green-500',
    compliance: 'bg-red-500',
    integration: 'bg-yellow-500',
  };

  const Icon = template.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${categoryColors[template.category]}/20`}>
              <Icon className={`w-5 h-5 ${categoryColors[template.category].replace('bg-', 'text-')}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{template.name}</h3>
              <p className="text-xs text-gray-400">v{template.version} by {template.author}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {template.isPublic ? (
              <GlobeAltIcon className="w-4 h-4 text-green-500" />
            ) : (
              <LockClosedIcon className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-4">{template.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* SIA Scores */}
        <div className="flex items-center justify-between mb-4 p-3 bg-black/30 rounded-lg">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-vanguard-blue rounded-full" />
            <span className="text-xs text-gray-300">S: {template.siaScores.security}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-vanguard-red rounded-full" />
            <span className="text-xs text-gray-300">I: {template.siaScores.integrity}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-vanguard-green rounded-full" />
            <span className="text-xs text-gray-300">A: {template.siaScores.accuracy}%</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <FireIcon className="w-3 h-3" />
            <span>{template.usageCount} uses</span>
          </div>
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-3 h-3" />
            <span>{template.lastModified.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onDuplicate(template)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Duplicate"
          >
            <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => onEdit(template)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <PencilIcon className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(template)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </Card>
  );
};

const SettingsAdmin: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'settings' | 'templates'>('settings');
  const [selectedSection, setSelectedSection] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSettingUpdate = (sectionId: string, settingId: string, value: any) => {
    console.log('Update setting:', sectionId, settingId, value);
    setHasUnsavedChanges(true);
    // TODO: Implement setting update
  };

  const handleSaveSettings = () => {
    console.log('Save settings');
    setHasUnsavedChanges(false);
    // TODO: Implement save functionality
  };

  const handleEditTemplate = (template: Template) => {
    console.log('Edit template:', template);
    // TODO: Implement edit functionality
  };

  const handleDeleteTemplate = (template: Template) => {
    console.log('Delete template:', template);
    // TODO: Implement delete functionality
  };

  const handleDuplicateTemplate = (template: Template) => {
    console.log('Duplicate template:', template);
    // TODO: Implement duplicate functionality
  };

  const filteredTemplates = mockTemplates.filter((template) => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !template.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedSectionData = settingSections.find(s => s.id === selectedSection);

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <CogIcon className="w-8 h-8 mr-3 text-seraphim-gold" />
          Settings & Template Admin
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure system settings and manage reusable templates
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setSelectedTab('settings')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'settings'
              ? 'bg-seraphim-gold/20 text-seraphim-gold'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <CogIcon className="w-4 h-4 inline mr-2" />
          System Settings
        </button>
        <button
          onClick={() => setSelectedTab('templates')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTab === 'templates'
              ? 'bg-seraphim-gold/20 text-seraphim-gold'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <DocumentDuplicateIcon className="w-4 h-4 inline mr-2" />
          Templates
        </button>
      </div>

      <AnimatePresence mode="wait">
        {selectedTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Settings Categories</h3>
                <nav className="space-y-1">
                  {settingSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedSection === section.id
                            ? 'bg-seraphim-gold/20 text-seraphim-gold'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>

              {/* Save Button */}
              {hasUnsavedChanges && (
                <Card className="p-4 mt-4 border-yellow-500/50">
                  <div className="flex items-center space-x-2 text-yellow-500 mb-3">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Unsaved Changes</span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleSaveSettings}
                    className="w-full"
                  >
                    Save Changes
                  </Button>
                </Card>
              )}
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {selectedSectionData && (
                <Card className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">{selectedSectionData.title}</h2>
                    <p className="text-sm text-gray-400">{selectedSectionData.description}</p>
                  </div>
                  <div className="space-y-1">
                    {selectedSectionData.settings.map((setting) => (
                      <SettingItem
                        key={setting.id}
                        setting={setting}
                        onUpdate={(id, value) => handleSettingUpdate(selectedSection, id, value)}
                      />
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {selectedTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Template Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                  className="w-64"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-seraphim-gold focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="workflow">Workflows</option>
                  <option value="prompt">Prompts</option>
                  <option value="agent">Agents</option>
                  <option value="compliance">Compliance</option>
                  <option value="integration">Integrations</option>
                </select>
              </div>
              <Button variant="primary">
                <PlusIcon className="w-4 h-4 mr-1" />
                Create Template
              </Button>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onDuplicate={handleDuplicateTemplate}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <Card className="p-12 text-center">
                <DocumentDuplicateIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No templates found matching your criteria</p>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsAdmin;