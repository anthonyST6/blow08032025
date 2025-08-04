import React from 'react';
import { motion } from 'framer-motion';
import { Alert, AlertSeverity } from '../../types';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  CircleStackIcon,
  ServerStackIcon,
  BellAlertIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface AlertsPanelProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  onViewAllClick?: () => void;
}

const severityConfig: Record<AlertSeverity, {
  color: string;
  bgColor: string;
  borderColor: string;
  pulseClass?: string;
}> = {
  critical: {
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    pulseClass: 'animate-pulse-red',
  },
  high: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
  },
  medium: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
  },
  low: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
  },
};

const alertTypeIcons = {
  security: ShieldExclamationIcon,
  performance: ExclamationTriangleIcon,
  'data-sync': CircleStackIcon,
  'agent-health': ServerStackIcon,
};

interface AlertItemProps {
  alert: Alert;
  index: number;
  onClick?: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, index, onClick }) => {
  const config = severityConfig[alert.severity];
  const Icon = alertTypeIcons[alert.type];
  const timeAgo = getTimeAgo(alert.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: -4 }}
      className={`group cursor-pointer ${alert.severity === 'critical' ? config.pulseClass : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-200">
        <div className={`p-2 rounded-lg ${config.bgColor}/20 ${config.color} group-hover:scale-110 transition-transform`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-seraphim-text truncate pr-2">
              {alert.title}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor}/20 ${config.color} ${config.borderColor} border`}>
              {alert.severity}
            </span>
          </div>
          
          <p className="text-xs text-seraphim-text-dim line-clamp-2">
            {alert.description}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {timeAgo}
            </span>
            <span className="text-xs text-seraphim-text-dim">
              {alert.source}
            </span>
          </div>
        </div>
        
        <ChevronRightIcon className="h-4 w-4 text-seraphim-text-dim opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      </div>
    </motion.div>
  );
};

const SeveritySummary: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const severityCounts = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {} as Record<AlertSeverity, number>);

  const severities: AlertSeverity[] = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
      {severities.map((severity) => {
        const count = severityCounts[severity] || 0;
        const config = severityConfig[severity];
        
        if (count === 0) return null;
        
        return (
          <motion.div
            key={severity}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-1"
          >
            <div className={`w-2 h-2 rounded-full ${config.bgColor} ${severity === 'critical' ? 'animate-pulse' : ''}`} />
            <span className={`text-xs ${config.color}`}>
              {count} {severity}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAlertClick,
  onViewAllClick,
}) => {
  // Sort alerts by severity and timestamp
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="flex items-center flex-1">
            <BellAlertIcon className="h-5 w-5 text-seraphim-gold mr-2" />
            Alerts
          </div>
          {unacknowledgedCount > 0 && (
            <span className="text-sm font-normal text-red-400">
              {unacknowledgedCount} new
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <SeveritySummary alerts={alerts} />
        
        <div className="h-[450px] overflow-y-auto custom-scrollbar px-6 py-4">
          <div className="space-y-1">
            {sortedAlerts.map((alert, index) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                index={index}
                onClick={() => onAlertClick?.(alert)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default AlertsPanel;