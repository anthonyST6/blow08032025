import React, { useState } from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  agent: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

interface RealTimeAlertsProps {
  alerts: Alert[];
}

const RealTimeAlerts: React.FC<RealTimeAlertsProps> = ({ alerts = [] }) => {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const toggleAlert = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Mock alerts if none provided
  const displayAlerts = alerts.length > 0 ? alerts : [
    {
      id: '1',
      type: 'warning' as const,
      priority: 'high' as const,
      title: 'Lease Expiration Alert',
      message: 'Lease #A-123 expires in 30 days. Negotiation agent recommends renewal.',
      agent: 'Negotiation Agent',
      timestamp: new Date().toISOString(),
      actions: [
        { label: 'Start Renewal', action: 'start_renewal' },
        { label: 'View Details', action: 'view_details' }
      ]
    },
    {
      id: '2',
      type: 'error' as const,
      priority: 'critical' as const,
      title: 'Security Violation Detected',
      message: 'Unauthorized access attempt on Document #456. Security agent has blocked access.',
      agent: 'Security Agent',
      timestamp: new Date().toISOString()
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Real-Time Alerts</h3>
        <span className="text-sm text-gray-500">{displayAlerts.length} active</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayAlerts.map((alert) => (
          <div key={alert.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleAlert(alert.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span>{alert.agent}</span>
                      <span>•</span>
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-2">
                  {expandedAlerts.has(alert.id) ? (
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {expandedAlerts.has(alert.id) && alert.actions && (
              <div className="px-4 pb-4 pt-0">
                <div className="flex gap-2">
                  {alert.actions.map((action, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeAlerts;