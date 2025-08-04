import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { websocketService } from '../services/websocket';

export const WebSocketTest: React.FC = () => {
  const { isConnected, notifications, logs, alerts, metrics } = useWebSocket();
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    // Request notification permissions on mount
    websocketService.requestNotificationPermission();
  }, []);

  const sendTestNotification = () => {
    websocketService.send({
      type: 'notification',
      payload: {
        title: 'Test Notification',
        message: `This is test notification #${testCount + 1}`,
        severity: 'info',
        source: 'WebSocket Test Page'
      }
    });
    setTestCount(testCount + 1);
  };

  const sendTestLog = () => {
    websocketService.send({
      type: 'log',
      payload: {
        level: 'info',
        message: `Test log message #${testCount + 1}`,
        source: 'WebSocket Test Page'
      }
    });
    setTestCount(testCount + 1);
  };

  const sendTestAlert = () => {
    websocketService.send({
      type: 'alert',
      payload: {
        type: 'security',
        severity: 'high',
        title: 'Test Security Alert',
        description: `This is test alert #${testCount + 1}`,
        affectedResources: ['test-resource-1', 'test-resource-2']
      }
    });
    setTestCount(testCount + 1);
  };

  const sendTestMetric = () => {
    websocketService.send({
      type: 'metric',
      payload: {
        metricType: 'sia',
        metricName: 'security_score',
        value: Math.random() * 100,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }
    });
    setTestCount(testCount + 1);
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-seraphim-gold mb-4">
            WebSocket Test Page
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-vanguard-green' : 'bg-vanguard-red'} animate-pulse`} />
            <span className="text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Test Controls */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-seraphim-gold mb-4">Test Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={sendTestNotification} variant="primary">
              Send Notification
            </Button>
            <Button onClick={sendTestLog} variant="secondary">
              Send Log
            </Button>
            <Button onClick={sendTestAlert} variant="danger">
              Send Alert
            </Button>
            <Button onClick={sendTestMetric} variant="success">
              Send Metric
            </Button>
          </div>
        </Card>

        {/* Recent Messages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-seraphim-gold mb-4">
              Recent Notifications ({notifications.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.slice(-5).reverse().map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="font-medium text-white">{notif.payload.title}</div>
                  <div className="text-sm text-gray-400">{notif.payload.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-gray-500 text-center py-8">No notifications yet</div>
              )}
            </div>
          </Card>

          {/* Logs */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-seraphim-gold mb-4">
              Recent Logs ({logs.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.slice(-5).reverse().map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      log.payload.level === 'error' ? 'bg-red-500/20 text-red-400' :
                      log.payload.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {log.payload.level.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">{log.payload.source}</span>
                  </div>
                  <div className="text-sm text-white mt-1">{log.payload.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500 text-center py-8">No logs yet</div>
              )}
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-seraphim-gold mb-4">
              Recent Alerts ({alerts.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.slice(-5).reverse().map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.payload.severity === 'critical' ? 'bg-red-900/20 border-red-700' :
                    alert.payload.severity === 'high' ? 'bg-orange-900/20 border-orange-700' :
                    'bg-yellow-900/20 border-yellow-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{alert.payload.title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.payload.severity === 'critical' ? 'bg-red-500/30 text-red-400' :
                      alert.payload.severity === 'high' ? 'bg-orange-500/30 text-orange-400' :
                      'bg-yellow-500/30 text-yellow-400'
                    }`}>
                      {alert.payload.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{alert.payload.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-gray-500 text-center py-8">No alerts yet</div>
              )}
            </div>
          </Card>

          {/* Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-seraphim-gold mb-4">
              Recent Metrics ({metrics.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {metrics.slice(-5).reverse().map((metric) => (
                <div
                  key={metric.id}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{metric.payload.metricName}</span>
                    <span className={`text-sm ${
                      metric.payload.trend === 'up' ? 'text-vanguard-green' : 
                      metric.payload.trend === 'down' ? 'text-vanguard-red' : 
                      'text-gray-400'
                    }`}>
                      {metric.payload.value.toFixed(2)}
                      {metric.payload.trend === 'up' ? ' ↑' : metric.payload.trend === 'down' ? ' ↓' : ''}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Type: {metric.payload.metricType} • {new Date(metric.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {metrics.length === 0 && (
                <div className="text-gray-500 text-center py-8">No metrics yet</div>
              )}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};