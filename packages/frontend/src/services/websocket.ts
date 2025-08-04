import { io, Socket } from 'socket.io-client';

// Custom EventEmitter for browser environment
class EventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }
}

export interface WebSocketMessage {
  type: 'notification' | 'log' | 'alert' | 'update' | 'metric';
  payload: any;
  timestamp: Date;
  id: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  source?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface LogPayload {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

export interface AlertPayload {
  type: 'security' | 'integrity' | 'accuracy' | 'compliance' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedResources?: string[];
  recommendedActions?: string[];
}

export interface MetricUpdatePayload {
  metricType: 'sia' | 'performance' | 'usage' | 'compliance';
  metricName: string;
  value: number;
  previousValue?: number;
  trend?: 'up' | 'down' | 'stable';
  threshold?: {
    warning: number;
    critical: number;
  };
}

class WebSocketService extends EventEmitter {
  private socket: Socket | null = null;
  private reconnectInterval: number = 5000;
  private maxReconnectAttempts: number = 5;
  private reconnectAttempts: number = 0;
  private url: string;
  private isIntentionallyClosed: boolean = false;
  private messageQueue: WebSocketMessage[] = [];

  constructor() {
    super();
    // Use environment variable or default to local development
    const wsHost = (import.meta.env.VITE_WS_URL as string) || `http://${window.location.hostname}:3001`;
    this.url = wsHost;
  }

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket.io already connected');
      return;
    }

    this.isIntentionallyClosed = false;
    
    try {
      // Create Socket.io connection with authentication
      this.socket = io(this.url, {
        auth: {
          token: token
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        reconnectionDelayMax: 30000,
        transports: ['websocket', 'polling']
      });
      
      // Set up event listeners
      this.socket.on('connect', this.handleConnect.bind(this));
      this.socket.on('disconnect', this.handleDisconnect.bind(this));
      this.socket.on('connect_error', this.handleError.bind(this));
      
      // Listen for specific message types
      this.socket.on('notification', this.handleNotificationMessage.bind(this));
      this.socket.on('log', this.handleLogMessage.bind(this));
      this.socket.on('alert', this.handleAlertMessage.bind(this));
      this.socket.on('metric', this.handleMetricMessage.bind(this));
      this.socket.on('update', this.handleUpdateMessage.bind(this));
      
      // Listen for authentication errors
      this.socket.on('auth_error', (error: any) => {
        console.error('Authentication error:', error);
        this.emit('auth_error', error);
      });
      
    } catch (error) {
      console.error('Failed to create Socket.io connection:', error);
      this.emit('error', error);
    }
  }

  private handleConnect(): void {
    console.log('Socket.io connected');
    this.reconnectAttempts = 0;
    this.emit('connected');
    
    // Send any queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private handleDisconnect(reason: string): void {
    console.log('Socket.io disconnected:', reason);
    this.emit('disconnected', { reason });
    
    // Socket.io handles reconnection automatically
    // unless we intentionally closed the connection
    if (this.isIntentionallyClosed) {
      this.socket?.disconnect();
    }
  }

  private handleError(error: Error): void {
    console.error('Socket.io error:', error);
    this.emit('error', error);
  }

  private createMessage(type: string, payload: any): WebSocketMessage {
    return {
      type: type as WebSocketMessage['type'],
      payload,
      timestamp: new Date(),
      id: this.generateId()
    };
  }

  private handleNotificationMessage(data: any): void {
    const message = this.createMessage('notification', data);
    this.emit('notification', message);
    this.emit('message', message);
    this.handleNotification(data as NotificationPayload);
  }

  private handleLogMessage(data: any): void {
    const message = this.createMessage('log', data);
    this.emit('log', message);
    this.emit('message', message);
    this.handleLog(data as LogPayload);
  }

  private handleAlertMessage(data: any): void {
    const message = this.createMessage('alert', data);
    this.emit('alert', message);
    this.emit('message', message);
    this.handleAlert(data as AlertPayload);
  }

  private handleMetricMessage(data: any): void {
    const message = this.createMessage('metric', data);
    this.emit('metric', message);
    this.emit('message', message);
    this.handleMetricUpdate(data as MetricUpdatePayload);
  }

  private handleUpdateMessage(data: any): void {
    const message = this.createMessage('update', data);
    this.emit('update', message);
    this.emit('message', message);
  }

  private handleNotification(payload: NotificationPayload): void {
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.message,
        icon: '/logo.png',
        tag: payload.source || 'seraphim-vanguards',
      });
    }
  }

  private handleLog(payload: LogPayload): void {
    // Logs are handled by listeners
    console.log(`[${payload.level.toUpperCase()}] ${payload.source}: ${payload.message}`);
  }

  private handleAlert(payload: AlertPayload): void {
    // Critical alerts could trigger browser notifications
    if (payload.severity === 'critical' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Critical ${payload.type} Alert`, {
        body: payload.description,
        icon: '/logo.png',
        requireInteraction: true,
      });
    }
  }

  private handleMetricUpdate(payload: MetricUpdatePayload): void {
    // Metric updates are handled by listeners
    console.log(`Metric Update: ${payload.metricName} = ${payload.value}`);
  }

  send(message: Partial<WebSocketMessage>): void {
    const fullMessage: WebSocketMessage = {
      id: this.generateId(),
      timestamp: new Date(),
      type: message.type || 'update',
      payload: message.payload || {},
    };

    if (this.socket?.connected) {
      // Emit the message with its type as the event name
      this.socket.emit(fullMessage.type, fullMessage.payload);
    } else {
      // Queue message for sending when connection is established
      this.messageQueue.push(fullMessage);
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.messageQueue = [];
    this.emit('disconnected', { reason: 'Client initiated disconnect' });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private getStoredToken(): string | null {
    // Get token from localStorage or auth store
    return localStorage.getItem('auth_token');
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Subscribe to specific message types
  subscribeToNotifications(callback: (message: WebSocketMessage) => void): () => void {
    this.on('notification', callback);
    return () => this.off('notification', callback);
  }

  subscribeToLogs(callback: (message: WebSocketMessage) => void): () => void {
    this.on('log', callback);
    return () => this.off('log', callback);
  }

  subscribeToAlerts(callback: (message: WebSocketMessage) => void): () => void {
    this.on('alert', callback);
    return () => this.off('alert', callback);
  }

  subscribeToMetrics(callback: (message: WebSocketMessage) => void): () => void {
    this.on('metric', callback);
    return () => this.off('metric', callback);
  }

  // Utility method to request notification permissions
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window && Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();