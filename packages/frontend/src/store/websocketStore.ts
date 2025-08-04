import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './authStore';
import { usePromptStore } from './promptStore';
import { useUIStore } from './uiStore';

export type WebSocketEvent = 
  | 'analysis:started'
  | 'analysis:progress'
  | 'analysis:completed'
  | 'analysis:failed'
  | 'workflow:started'
  | 'workflow:progress'
  | 'workflow:completed'
  | 'workflow:failed'
  | 'report:generated'
  | 'alert:created'
  | 'user:joined'
  | 'user:left';

export interface WebSocketMessage {
  event: WebSocketEvent;
  data: any;
  timestamp: Date;
}

interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
  messages: WebSocketMessage[];
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler?: (data: any) => void) => void;
  clearMessages: () => void;
}

export const useWebSocketStore = create<WebSocketState>()(
  devtools(
    (set, get) => ({
      socket: null,
      isConnected: false,
      connectionError: null,
      reconnectAttempts: 0,
      messages: [],

      connect: () => {
        const { socket, isConnected } = get();
        
        // Don't connect if already connected
        if (socket && isConnected) {
          return;
        }

        const authStore = useAuthStore.getState();
        const token = authStore.user?.uid;

        if (!token) {
          set({ connectionError: 'No authentication token available' });
          return;
        }

        const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          set({ 
            isConnected: true, 
            connectionError: null,
            reconnectAttempts: 0 
          });
          
          const uiStore = useUIStore.getState();
          uiStore.addNotification({
            type: 'success',
            title: 'Connected',
            message: 'Real-time connection established',
          });
        });

        newSocket.on('disconnect', (reason) => {
          set({ isConnected: false });
          
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, don't auto-reconnect
            newSocket.connect();
          }
        });

        newSocket.on('connect_error', (error) => {
          set((state) => ({
            connectionError: error.message,
            reconnectAttempts: state.reconnectAttempts + 1,
          }));
        });

        // Application event handlers
        newSocket.on('analysis:started', (data) => {
          const promptStore = usePromptStore.getState();
          promptStore.fetchPromptById(data.promptId);
          
          set((state) => ({
            messages: [...state.messages, {
              event: 'analysis:started',
              data,
              timestamp: new Date(),
            }],
          }));
        });

        newSocket.on('analysis:progress', (data) => {
          set((state) => ({
            messages: [...state.messages, {
              event: 'analysis:progress',
              data,
              timestamp: new Date(),
            }],
          }));
        });

        newSocket.on('analysis:completed', (data) => {
          const promptStore = usePromptStore.getState();
          promptStore.fetchPromptById(data.promptId);
          
          const uiStore = useUIStore.getState();
          uiStore.addNotification({
            type: 'success',
            title: 'Analysis Complete',
            message: `Analysis for prompt "${data.promptTitle}" has been completed`,
          });
          
          set((state) => ({
            messages: [...state.messages, {
              event: 'analysis:completed',
              data,
              timestamp: new Date(),
            }],
          }));
        });

        newSocket.on('analysis:failed', (data) => {
          const promptStore = usePromptStore.getState();
          promptStore.fetchPromptById(data.promptId);
          
          const uiStore = useUIStore.getState();
          uiStore.addNotification({
            type: 'error',
            title: 'Analysis Failed',
            message: data.error || 'An error occurred during analysis',
          });
          
          set((state) => ({
            messages: [...state.messages, {
              event: 'analysis:failed',
              data,
              timestamp: new Date(),
            }],
          }));
        });

        newSocket.on('workflow:started', (data) => {
          set((state) => ({
            messages: [...state.messages, {
              event: 'workflow:started',
              data,
              timestamp: new Date(),
            }],
          }));
        });

        newSocket.on('workflow:completed', (data) => {
          const uiStore = useUIStore.getState();
          uiStore.addNotification({
            type: 'success',
            title: 'Workflow Complete',
            message: `Workflow "${data.workflowName}" has been completed`,
          });
          
          set((state) => ({
            messages: [...state.messages, {
              event: 'workflow:completed',
              data,
              timestamp: new Date(),
            }],
          }));
        });

        newSocket.on('report:generated', (data) => {
          const uiStore = useUIStore.getState();
          uiStore.addNotification({
            type: 'info',
            title: 'Report Generated',
            message: `New report available: ${data.reportTitle}`,
          });
          
          set((state) => ({
            messages: [...state.messages, {
              event: 'report:generated',
              data,
              timestamp: new Date(),
            }],
          }));
        });

        newSocket.on('alert:created', (data) => {
          const uiStore = useUIStore.getState();
          uiStore.addNotification({
            type: 'warning',
            title: 'New Alert',
            message: data.message,
          });
          
          set((state) => ({
            messages: [...state.messages, {
              event: 'alert:created',
              data,
              timestamp: new Date(),
            }],
          }));
        });

        set({ socket: newSocket });
      },

      disconnect: () => {
        const { socket } = get();
        
        if (socket) {
          socket.disconnect();
          set({ 
            socket: null, 
            isConnected: false,
            messages: [] 
          });
        }
      },

      emit: (event: string, data: any) => {
        const { socket, isConnected } = get();
        
        if (socket && isConnected) {
          socket.emit(event, data);
        } else {
          console.warn('Cannot emit event: WebSocket is not connected');
        }
      },

      on: (event: string, handler: (data: any) => void) => {
        const { socket } = get();
        
        if (socket) {
          socket.on(event, handler);
        }
      },

      off: (event: string, handler?: (data: any) => void) => {
        const { socket } = get();
        
        if (socket) {
          if (handler) {
            socket.off(event, handler);
          } else {
            socket.off(event);
          }
        }
      },

      clearMessages: () => {
        set({ messages: [] });
      },
    }),
    {
      name: 'websocket-store',
    }
  )
);

// Helper hooks
export const useIsWebSocketConnected = () => useWebSocketStore((state) => state.isConnected);
export const useWebSocketError = () => useWebSocketStore((state) => state.connectionError);
export const useWebSocketMessages = () => useWebSocketStore((state) => state.messages);

// Selector for messages by event type
export const useWebSocketMessagesByEvent = (event: WebSocketEvent) =>
  useWebSocketStore((state) => state.messages.filter(m => m.event === event));

// Auto-connect when authenticated
useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    const wsStore = useWebSocketStore.getState();
    
    if (isAuthenticated && !wsStore.isConnected) {
      wsStore.connect();
    } else if (!isAuthenticated && wsStore.isConnected) {
      wsStore.disconnect();
    }
  }
);