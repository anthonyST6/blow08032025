import React from 'react';
import { motion } from 'framer-motion';
import { AuditEvent, AuditEventType, AuditSeverity } from '../../types';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  DocumentMagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CogIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  UserIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface AuditPanelProps {
  events: AuditEvent[];
  onEventClick?: (event: AuditEvent) => void;
}

const eventTypeIcons: Record<AuditEventType, React.ComponentType<{ className?: string }>> = {
  access: EyeIcon,
  modification: PencilIcon,
  deletion: TrashIcon,
  export: ArrowDownTrayIcon,
  configuration: CogIcon,
};

const severityConfig: Record<AuditSeverity, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = {
  info: {
    icon: InformationCircleIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
  },
  error: {
    icon: XCircleIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-400',
  },
  critical: {
    icon: ExclamationTriangleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-600',
  },
};

interface AuditEventItemProps {
  event: AuditEvent;
  index: number;
  onClick?: () => void;
}

const AuditEventItem: React.FC<AuditEventItemProps> = ({ event, index, onClick }) => {
  const TypeIcon = eventTypeIcons[event.eventType];
  const severityConf = severityConfig[event.severity];
  const SeverityIcon = severityConf.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      whileHover={{ x: 4 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className={`p-3 rounded-lg hover:bg-white/5 transition-all duration-200 border-l-2 ${
        event.severity === 'critical' ? 'border-red-600' :
        event.severity === 'error' ? 'border-red-400' :
        event.severity === 'warning' ? 'border-yellow-400' :
        'border-transparent'
      }`}>
        <div className="flex items-start space-x-3">
          {/* Event Type Icon */}
          <div className={`p-1.5 rounded ${severityConf.bgColor}/20 ${severityConf.color}`}>
            <TypeIcon className="h-4 w-4" />
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-seraphim-text">
                    {event.action} {event.resource}
                  </h4>
                  {!event.success && (
                    <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                      Failed
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1 text-xs text-seraphim-text-dim">
                    <UserIcon className="h-3 w-3" />
                    <span>{event.userName}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-seraphim-text-dim">
                    <GlobeAltIcon className="h-3 w-3" />
                    <span>{event.ipAddress}</span>
                  </div>
                </div>
                {event.details?.reason && (
                  <p className="text-xs text-red-400 mt-1">{event.details.reason}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <div className={`flex items-center space-x-1 ${severityConf.color}`}>
                  <SeverityIcon className="h-4 w-4" />
                  <span className="text-xs capitalize">{event.severity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-right">
            <p className="text-xs text-seraphim-text-dim">
              {formatTime(event.timestamp)}
            </p>
            <p className="text-xs text-seraphim-text-dim">
              {formatDate(event.timestamp)}
            </p>
          </div>
        </div>

        {/* Additional Details on Hover */}
        {event.details && Object.keys(event.details).length > 1 && (
          <div className="mt-2 ml-9 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="text-xs text-seraphim-text-dim space-y-1">
              {event.details.resourceId && (
                <div>Resource ID: <span className="text-seraphim-text">{event.details.resourceId}</span></div>
              )}
              {event.details.changes && (
                <div>
                  Changes: 
                  <span className="text-red-400"> {event.details.changes.before}</span>
                  <span className="text-seraphim-text-dim"> → </span>
                  <span className="text-green-400">{event.details.changes.after}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const AuditPanel: React.FC<AuditPanelProps> = ({
  events,
  onEventClick,
}) => {
  const criticalCount = events.filter(e => e.severity === 'critical').length;
  const errorCount = events.filter(e => e.severity === 'error').length;
  const failedCount = events.filter(e => !e.success).length;

  // Group events by severity for summary
  const eventsBySeverity = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<AuditSeverity, number>);

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="flex items-center flex-1">
            <DocumentMagnifyingGlassIcon className="h-5 w-5 text-seraphim-gold mr-2" />
            Audit Trail
          </div>
          {(criticalCount > 0 || errorCount > 0) && (
            <div className="flex items-center space-x-3 text-sm font-normal">
              {criticalCount > 0 && <span className="text-red-600">{criticalCount} critical</span>}
              {errorCount > 0 && <span className="text-red-400">{errorCount} errors</span>}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Severity Summary */}
        <div className="px-6 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {Object.entries(eventsBySeverity).map(([severity, count]) => {
                const conf = severityConfig[severity as AuditSeverity];
                return (
                  <div key={severity} className="flex items-center space-x-1">
                    <conf.icon className={`h-4 w-4 ${conf.color}`} />
                    <span className="text-xs text-seraphim-text-dim">
                      {count} {severity}
                    </span>
                  </div>
                );
              })}
            </div>
            {failedCount > 0 && (
              <span className="text-xs text-red-400">
                {failedCount} failed operations
              </span>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="h-[550px] overflow-y-auto custom-scrollbar">
          <div className="divide-y divide-white/5">
            {events.map((event, index) => (
              <AuditEventItem
                key={event.id}
                event={event}
                index={index}
                onClick={() => onEventClick?.(event)}
              />
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-seraphim-gold">{events.length}</p>
              <p className="text-xs text-seraphim-text-dim">Total Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {events.filter(e => e.success).length}
              </p>
              <p className="text-xs text-seraphim-text-dim">Successful</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{failedCount}</p>
              <p className="text-xs text-seraphim-text-dim">Failed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-seraphim-text">
                {new Set(events.map(e => e.userId)).size}
              </p>
              <p className="text-xs text-seraphim-text-dim">Unique Users</p>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default AuditPanel;