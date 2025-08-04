import React from 'react';
import { motion } from 'framer-motion';
import { Integration, IntegrationStatus, IntegrationType } from '../../types';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  WrenchScrewdriverIcon,
  CloudIcon,
  CircleStackIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  ChartBarIcon as ChartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

interface ToolsIntegrationsPanelProps {
  integrations: Integration[];
  onIntegrationClick?: (integration: Integration) => void;
}

const statusConfig: Record<IntegrationStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  pulseClass?: string;
}> = {
  connected: {
    icon: CheckCircleIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-400',
  },
  disconnected: {
    icon: XCircleIcon,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400',
  },
  error: {
    icon: ExclamationTriangleIcon,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    pulseClass: 'animate-pulse',
  },
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
  },
};

const typeIcons: Record<IntegrationType, React.ComponentType<{ className?: string }>> = {
  api: CloudIcon,
  database: CircleStackIcon,
  messaging: ChatBubbleLeftRightIcon,
  storage: FolderIcon,
  analytics: ChartIcon,
};

interface IntegrationItemProps {
  integration: Integration;
  index: number;
  onClick?: () => void;
}

const IntegrationItem: React.FC<IntegrationItemProps> = ({ integration, index, onClick }) => {
  const statusConf = statusConfig[integration.status];
  const StatusIcon = statusConf.icon;
  const TypeIcon = typeIcons[integration.type];
  const isConnected = integration.status === 'connected';
  const hasError = integration.status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className={`p-4 rounded-lg bg-white/5 hover:bg-white/10 border ${
        hasError ? 'border-red-500/50' : 'border-white/10'
      } hover:border-seraphim-gold/50 transition-all duration-200`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${statusConf.bgColor}/20 ${statusConf.color} ${statusConf.pulseClass || ''}`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-seraphim-text">{integration.name}</h4>
              <p className="text-xs text-seraphim-text-dim mt-0.5">{integration.provider}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${statusConf.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs capitalize">{integration.status}</span>
          </div>
        </div>

        {/* Configuration Info */}
        {integration.configuration.endpoint && (
          <div className="mb-3">
            <p className="text-xs text-seraphim-text-dim mb-1">Endpoint</p>
            <p className="text-xs font-mono text-seraphim-text truncate">{integration.configuration.endpoint}</p>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-seraphim-text-dim">Data Transferred</p>
            <p className="text-sm font-medium text-seraphim-text">
              {isConnected ? `${integration.dataTransferred} MB` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-seraphim-text-dim">Error Rate</p>
            <p className={`text-sm font-medium ${
              integration.errorRate > 10 ? 'text-red-400' : 'text-seraphim-text'
            }`}>
              {integration.errorRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Rate Limit (for APIs) */}
        {integration.type === 'api' && integration.configuration.rateLimit && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-seraphim-text-dim">Rate Limit</span>
              <span className="text-xs text-seraphim-text">
                {integration.configuration.rateLimit} req/min
              </span>
            </div>
            <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-seraphim-gold to-yellow-400 w-3/4" />
            </div>
          </div>
        )}

        {/* Last Sync */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center space-x-1 text-xs text-seraphim-text-dim">
            <ArrowsRightLeftIcon className="h-3 w-3" />
            <span>Last sync</span>
          </div>
          <span className="text-xs text-seraphim-text">
            {getTimeAgo(integration.lastSync)}
          </span>
        </div>

        {/* Authentication Status */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-seraphim-text-dim">Authentication</span>
          <span className={`text-xs ${
            integration.configuration.authenticated ? 'text-green-400' : 'text-red-400'
          }`}>
            {integration.configuration.authenticated ? 'Valid' : 'Invalid'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const ToolsIntegrationsPanel: React.FC<ToolsIntegrationsPanelProps> = ({
  integrations,
  onIntegrationClick,
}) => {
  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;
  const totalDataTransferred = integrations
    .filter(i => i.status === 'connected')
    .reduce((sum, i) => sum + i.dataTransferred, 0);

  // Group integrations by type
  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.type]) {
      acc[integration.type] = [];
    }
    acc[integration.type].push(integration);
    return acc;
  }, {} as Record<IntegrationType, Integration[]>);

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="flex items-center flex-1">
            <WrenchScrewdriverIcon className="h-5 w-5 text-seraphim-gold mr-2 animate-pulse" />
            Tools & Integrations
          </div>
          <div className="flex items-center space-x-3 text-sm font-normal">
            <span className="text-green-400">{connectedCount} connected</span>
            {errorCount > 0 && <span className="text-red-400">{errorCount} errors</span>}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[600px] overflow-y-auto custom-scrollbar px-6 py-4">
          {Object.entries(groupedIntegrations).map(([type, items]) => (
            <div key={type} className="mb-6">
              <h3 className="text-sm font-medium text-seraphim-text-dim mb-3 capitalize">
                {type} Integrations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((integration, index) => (
                  <IntegrationItem
                    key={integration.id}
                    integration={integration}
                    index={index}
                    onClick={() => onIntegrationClick?.(integration)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary Stats */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-seraphim-gold">{integrations.length}</p>
              <p className="text-xs text-seraphim-text-dim">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{connectedCount}</p>
              <p className="text-xs text-seraphim-text-dim">Connected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-seraphim-text">
                {totalDataTransferred.toLocaleString()}
              </p>
              <p className="text-xs text-seraphim-text-dim">MB Transferred</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-seraphim-text">
                {integrations.filter(i => i.configuration.authenticated).length}
              </p>
              <p className="text-xs text-seraphim-text-dim">Authenticated</p>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default ToolsIntegrationsPanel;