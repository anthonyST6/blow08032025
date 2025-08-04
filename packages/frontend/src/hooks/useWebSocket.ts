import { useEffect, useCallback, useState } from 'react';
import { websocketService, WebSocketEvents } from '../services/websocket.service';
import { useAuth } from '../contexts/AuthContext';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  rooms?: string[];
  useCaseId?: string;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { autoConnect = true, rooms = [], useCaseId } = options;
  const { user } = useAuth();
  const [state, setState] = useState<WebSocketState>({
    isConnected: websocketService.isConnected(),
    isConnecting: false,
    error: null
  });

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (autoConnect && user) {
      setState(prev => ({ ...prev, isConnecting: true }));
      websocketService.connect();
    }

    return () => {
      if (!user) {
        websocketService.disconnect();
      }
    };
  }, [user, autoConnect]);

  // Handle connection state changes
  useEffect(() => {
    const handleConnect = () => {
      setState({
        isConnected: true,
        isConnecting: false,
        error: null
      });
    };

    const handleDisconnect = () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false
      }));
    };

    const handleError = (error: Error) => {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error
      }));
    };

    websocketService.on('connect', handleConnect);
    websocketService.on('disconnect', handleDisconnect);
    websocketService.on('connect_error', handleError);

    return () => {
      websocketService.off('connect', handleConnect);
      websocketService.off('disconnect', handleDisconnect);
      websocketService.off('connect_error', handleError);
    };
  }, []);

  // Join/leave rooms
  useEffect(() => {
    if (state.isConnected && rooms.length > 0) {
      rooms.forEach(room => websocketService.joinRoom(room));

      return () => {
        rooms.forEach(room => websocketService.leaveRoom(room));
      };
    }
  }, [state.isConnected, rooms]);

  // Join/leave use case
  useEffect(() => {
    if (state.isConnected && useCaseId) {
      websocketService.joinUseCase(useCaseId);

      return () => {
        websocketService.leaveUseCase(useCaseId);
      };
    }
  }, [state.isConnected, useCaseId]);

  // Subscribe to events
  const subscribe = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    handler: WebSocketEvents[K]
  ) => {
    websocketService.on(event, handler);

    return () => {
      websocketService.off(event, handler);
    };
  }, []);

  // Send events
  const send = useCallback((event: string, data: any) => {
    websocketService.send(event, data);
  }, []);

  // Manual connect/disconnect
  const connect = useCallback(() => {
    setState(prev => ({ ...prev, isConnecting: true }));
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  return {
    ...state,
    subscribe,
    send,
    connect,
    disconnect
  };
};

// Hook for use case specific WebSocket events
export const useUseCaseWebSocket = (useCaseId?: string) => {
  const [executionStatus, setExecutionStatus] = useState<any>(null);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [executionError, setExecutionError] = useState<Error | null>(null);

  const ws = useWebSocket({ useCaseId });

  useEffect(() => {
    if (!ws.isConnected) return;

    const unsubscribers = [
      ws.subscribe('usecase:execution:start', (data) => {
        setExecutionStatus('running');
        setExecutionProgress(0);
        setExecutionError(null);
      }),
      ws.subscribe('usecase:execution:progress', (data) => {
        setExecutionProgress(data.progress || 0);
      }),
      ws.subscribe('usecase:execution:complete', (data) => {
        setExecutionStatus('completed');
        setExecutionProgress(100);
      }),
      ws.subscribe('usecase:execution:error', (data) => {
        setExecutionStatus('error');
        setExecutionError(new Error(data.error || 'Execution failed'));
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [ws.isConnected, ws.subscribe]);

  return {
    ...ws,
    executionStatus,
    executionProgress,
    executionError
  };
};

// Hook for mission control WebSocket events
export const useMissionControlWebSocket = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);

  const ws = useWebSocket({ rooms: ['mission-control'] });

  useEffect(() => {
    if (!ws.isConnected) return;

    const unsubscribers = [
      ws.subscribe('mission-control:metric', (data) => {
        setMetrics(prev => [...prev, data]);
      }),
      ws.subscribe('mission-control:update', (data) => {
        setUpdates(prev => [...prev, data]);
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [ws.isConnected, ws.subscribe]);

  return {
    ...ws,
    metrics,
    updates
  };
};

// Hook for alert WebSocket events
export const useAlertWebSocket = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  const ws = useWebSocket({ rooms: ['alerts'] });

  useEffect(() => {
    if (!ws.isConnected) return;

    const unsubscribers = [
      ws.subscribe('alert:new', (data) => {
        setAlerts(prev => [data, ...prev]);
      }),
      ws.subscribe('alert:update', (data) => {
        setAlerts(prev => prev.map(alert => 
          alert.id === data.id ? { ...alert, ...data } : alert
        ));
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [ws.isConnected, ws.subscribe]);

  return {
    ...ws,
    alerts
  };
};