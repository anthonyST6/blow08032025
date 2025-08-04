import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export interface AlertData {
  id: string;
  type: 'accuracy' | 'bias' | 'compliance' | 'security' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface MonitoringData {
  promptsPerMinute: number;
  averageResponseTime: number;
  activeAgents: number;
  errorRate: number;
  timestamp: Date;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  source?: string;
  actionUrl?: string;
  timestamp: Date;
}

export interface LogData {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface MetricData {
  id: string;
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

class WebSocketServerDev extends EventEmitter {
  private io: Server | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private logSimulationInterval: NodeJS.Timeout | null = null;

  initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    this.setupEventHandlers();
    this.startMonitoring();
    this.startLogSimulation();

    logger.info('WebSocket server initialized (Development Mode - No Auth)');
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      // In dev mode, create a mock user
      const mockUser = {
        uid: 'dev-user-' + Math.random().toString(36).substr(2, 9),
        email: 'dev@example.com',
        role: 'admin', // Give admin role for full access in dev
      };
      
      socket.data.user = mockUser;
      logger.info(`WebSocket client connected (dev mode): ${mockUser.uid}`);

      // Join user to their role-based room
      socket.join(`role:${mockUser.role}`);
      socket.join(`user:${mockUser.uid}`);

      // Send initial connection success
      socket.emit('connected', {
        userId: mockUser.uid,
        timestamp: new Date(),
        devMode: true,
      });

      // Handle heartbeat
      socket.on('heartbeat', () => {
        socket.emit('heartbeat', { timestamp: new Date() });
      });

      // Handle subscription to specific alert types
      socket.on('subscribe:alerts', (alertTypes: string[]) => {
        alertTypes.forEach((type) => {
          socket.join(`alert:${type}`);
        });
      });

      // Handle unsubscription from alert types
      socket.on('unsubscribe:alerts', (alertTypes: string[]) => {
        alertTypes.forEach((type) => {
          socket.leave(`alert:${type}`);
        });
      });

      // Handle real-time prompt analysis requests
      socket.on('analyze:prompt', async (data) => {
        try {
          // Emit analysis started event
          socket.emit('analysis:started', {
            promptId: data.promptId,
            timestamp: new Date(),
          });

          // This would trigger the actual analysis
          this.emit('analyze:prompt', {
            ...data,
            userId: mockUser.uid,
            socketId: socket.id,
          });
        } catch (error) {
          socket.emit('analysis:error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            promptId: data.promptId,
          });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected (dev mode): ${mockUser.uid}`);
      });
    });
  }

  private startMonitoring() {
    // Send monitoring data every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.broadcastMonitoringData();
    }, 5000);
  }

  private startLogSimulation() {
    // Simulate logs every 2-10 seconds
    const sendRandomLog = () => {
      const logTypes = [
        { level: 'info', messages: [
          'Agent initialized successfully',
          'Prompt analysis completed',
          'Compliance check passed',
          'Model response validated',
          'Cache hit for prompt template'
        ]},
        { level: 'warn', messages: [
          'High latency detected in model response',
          'Rate limit approaching threshold',
          'Memory usage above 80%',
          'Deprecated API endpoint used'
        ]},
        { level: 'error', messages: [
          'Failed to connect to vector database',
          'Model timeout after 30 seconds',
          'Invalid API key provided',
          'Database connection lost'
        ]},
        { level: 'debug', messages: [
          'Request payload validated',
          'Token count: 1523',
          'Cache miss, fetching from source',
          'Embedding dimension: 1536'
        ]}
      ];

      const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
      const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];

      const log: LogData = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        level: randomType.level as any,
        message: randomMessage,
        source: ['api-server', 'agent-orchestrator', 'compliance-engine', 'ml-pipeline'][Math.floor(Math.random() * 4)],
        metadata: {
          requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
          duration: Math.floor(Math.random() * 5000),
        },
        timestamp: new Date(),
      };

      this.sendLog(log);

      // Schedule next log
      const nextDelay = Math.random() * 8000 + 2000; // 2-10 seconds
      this.logSimulationInterval = setTimeout(sendRandomLog, nextDelay);
    };

    // Start the simulation
    sendRandomLog();

    // Also send some notifications periodically
    setInterval(() => {
      const notifications = [
        { severity: 'info', title: 'System Update', message: 'New compliance rules loaded successfully' },
        { severity: 'success', title: 'Analysis Complete', message: 'Batch prompt analysis finished with 98% accuracy' },
        { severity: 'warning', title: 'Resource Alert', message: 'GPU utilization exceeding 90%' },
        { severity: 'error', title: 'Agent Failure', message: 'Bias detection agent encountered an error' },
      ];

      const random = notifications[Math.floor(Math.random() * notifications.length)];
      
      this.sendNotification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: random.title,
        message: random.message,
        severity: random.severity as any,
        source: 'System Monitor',
        timestamp: new Date(),
      });
    }, 15000); // Every 15 seconds
  }

  private async broadcastMonitoringData() {
    if (!this.io) return;

    // In a real implementation, these would be calculated from actual metrics
    const monitoringData: MonitoringData = {
      promptsPerMinute: Math.floor(Math.random() * 100),
      averageResponseTime: Math.random() * 2000,
      activeAgents: Math.floor(Math.random() * 8) + 1,
      errorRate: Math.random() * 0.05,
      timestamp: new Date(),
    };

    // Broadcast to all connected admin users
    this.io.to('role:admin').emit('monitoring:update', monitoringData);

    // Also send as metric data
    const metrics: MetricData[] = [
      {
        id: `metric-${Date.now()}-1`,
        name: 'prompts_per_minute',
        value: monitoringData.promptsPerMinute,
        unit: 'count',
        tags: { type: 'throughput' },
        timestamp: new Date(),
      },
      {
        id: `metric-${Date.now()}-2`,
        name: 'average_response_time',
        value: monitoringData.averageResponseTime,
        unit: 'ms',
        tags: { type: 'latency' },
        timestamp: new Date(),
      },
      {
        id: `metric-${Date.now()}-3`,
        name: 'active_agents',
        value: monitoringData.activeAgents,
        unit: 'count',
        tags: { type: 'capacity' },
        timestamp: new Date(),
      },
      {
        id: `metric-${Date.now()}-4`,
        name: 'error_rate',
        value: monitoringData.errorRate * 100,
        unit: 'percent',
        tags: { type: 'reliability' },
        timestamp: new Date(),
      },
    ];

    metrics.forEach(metric => this.sendMetric(metric));
  }

  sendAlert(alert: AlertData) {
    if (!this.io) return;

    // Send to users subscribed to this alert type
    this.io.to(`alert:${alert.type}`).emit('alert:new', alert);

    // Always send critical alerts to admins
    if (alert.severity === 'critical') {
      this.io.to('role:admin').emit('alert:critical', alert);
    }

    logger.info(`Alert sent: ${alert.type} - ${alert.title}`);
  }

  sendNotification(notification: NotificationData) {
    if (!this.io) return;

    // Send to all connected clients
    this.io.emit('notification', notification);
    logger.info(`Notification sent: ${notification.severity} - ${notification.title}`);
  }

  sendLog(log: LogData) {
    if (!this.io) return;

    // Send to all connected clients
    this.io.emit('log', log);
  }

  sendMetric(metric: MetricData) {
    if (!this.io) return;

    // Send to admin users
    this.io.to('role:admin').emit('metric', metric);
  }

  sendAnalysisUpdate(userId: string, update: any) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('analysis:update', update);
  }

  sendWorkflowUpdate(workflowId: string, update: any) {
    if (!this.io) return;

    // Send to users subscribed to this workflow
    this.io.to(`workflow:${workflowId}`).emit('workflow:update', update);
  }

  broadcastSystemMessage(message: string, severity: 'info' | 'warning' | 'error' = 'info') {
    if (!this.io) return;

    this.io.emit('system:message', {
      message,
      severity,
      timestamp: new Date(),
    });
  }

  getConnectedClients(): number {
    if (!this.io) return 0;
    return this.io.sockets.sockets.size;
  }

  shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.logSimulationInterval) {
      clearTimeout(this.logSimulationInterval);
    }

    if (this.io) {
      this.io.close();
      logger.info('WebSocket server shut down');
    }
  }
}

export const wsServer = new WebSocketServerDev();