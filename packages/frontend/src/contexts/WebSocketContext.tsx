import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler?: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  connected: false,
  emit: () => {},
  on: () => {},
  off: () => {},
});

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
      auth: {
        token: user.uid,
      },
      transports: ['websocket'],
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      toast.success('Real-time connection established');
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      toast.error('Real-time connection lost');
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
      toast.error('WebSocket connection error');
    });

    // Application event handlers
    newSocket.on('analysis:update', (data) => {
      console.log('Analysis update:', data);
    });

    newSocket.on('workflow:status', (data) => {
      console.log('Workflow status:', data);
    });

    newSocket.on('agent:result', (data) => {
      console.log('Agent result:', data);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const emit = useCallback(
    (event: string, data?: any) => {
      if (socket && connected) {
        socket.emit(event, data);
      } else {
        console.warn('Socket not connected, cannot emit event:', event);
      }
    },
    [socket, connected]
  );

  const on = useCallback(
    (event: string, handler: (data: any) => void) => {
      if (socket) {
        socket.on(event, handler);
      }
    },
    [socket]
  );

  const off = useCallback(
    (event: string, handler?: (data: any) => void) => {
      if (socket) {
        if (handler) {
          socket.off(event, handler);
        } else {
          socket.off(event);
        }
      }
    },
    [socket]
  );

  return (
    <WebSocketContext.Provider value={{ socket, connected, emit, on, off }}>
      {children}
    </WebSocketContext.Provider>
  );
};