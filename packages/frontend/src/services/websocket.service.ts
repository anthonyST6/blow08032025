import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../utils/auth';

export interface WebSocketEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  
  // Use case events
  'usecase:update': (data: any) => void;
  'usecase:execution:start': (data: any) => void;
  'usecase:execution:progress': (data: any) => void;
  'usecase:execution:complete': (data: any) => void;
  'usecase:execution:error': (data: any) => void;
  
  // Vanguard agent events
  'vanguard:status': (data: any) => void;
  'vanguard:result': (data: any) => void;
  
  // Alert events
  'alert:new': (data: any) => void;
  'alert:update': (data: any) => void;
  
  // Audit events
  'audit:new': (data: any) => void;
  
  // Mission control events
  'mission-control:update': (data: any) => void;
  'mission-control:metric': (data: any) => void;
  
  // Report events
  'report:generated': (data: any) => void;
  'report:deleted': (data: any) => void;
  'report:updated': (data: any) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Auto-connect when service is instantiated
    this.connect();
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const token = await getAuthToken();
      if (!token) {
        console.error('No auth token available for WebSocket connection');
        return;
      }

      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
      
      this.socket = io(wsUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventHandlers();
      console.log('WebSocket connection initiated');
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connect');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('disconnect', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.emit('connect_error', error);
    });

    // Forward all other events to listeners
    const events: (keyof WebSocketEvents)[] = [
      'usecase:update',
      'usecase:execution:start',
      'usecase:execution:progress',
      'usecase:execution:complete',
      'usecase:execution:error',
      'vanguard:status',
      'vanguard:result',
      'alert:new',
      'alert:update',
      'audit:new',
      'mission-control:update',
      'mission-control:metric',
      'report:generated',
      'report:deleted',
      'report:updated'
    ];

    events.forEach(event => {
      this.socket!.on(event, (data: any) => {
        this.emit(event, data);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event emitter methods
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  // Send events to server
  send(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot send event:', event);
    }
  }

  // Join/leave rooms
  joinRoom(room: string): void {
    this.send('join:room', { room });
  }

  leaveRoom(room: string): void {
    this.send('leave:room', { room });
  }

  // Use case specific methods
  joinUseCase(useCaseId: string): void {
    this.send('join:usecase', { useCaseId });
  }

  leaveUseCase(useCaseId: string): void {
    this.send('leave:usecase', { useCaseId });
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export const webSocketService = websocketService; // Alias for compatibility