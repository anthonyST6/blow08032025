import { useState, useEffect, useCallback } from 'react';
import { 
  dashboardIntegration, 
  DashboardEvent, 
  DashboardEventType, 
  DashboardSource, 
  DashboardMessage 
} from '../services/dashboard-integration.service';

interface UseDashboardIntegrationOptions {
  source: DashboardSource;
  eventTypes?: DashboardEventType[];
  autoMarkRead?: boolean;
}

interface UseDashboardIntegrationReturn {
  messages: DashboardMessage[];
  unreadCount: number;
  emitEvent: (type: DashboardEventType, data: any) => void;
  sendMessage: (to: DashboardSource | 'all', title: string, message: string, options?: any) => void;
  markAsRead: (messageId: string) => void;
  clearMessages: () => void;
  navigateTo: (target: DashboardSource, data?: any) => void;
  requestData: (from: DashboardSource, dataType: string) => Promise<any>;
  shareData: (to: DashboardSource, dataType: string, data: any) => void;
  getSharedData: (from: DashboardSource, dataType: string) => any;
}

export function useDashboardIntegration(
  options: UseDashboardIntegrationOptions
): UseDashboardIntegrationReturn {
  const { source, eventTypes = [], autoMarkRead = true } = options;
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load messages on mount and listen for new ones
  useEffect(() => {
    const loadMessages = () => {
      const allMessages = dashboardIntegration.getMessages(source);
      const unread = dashboardIntegration.getMessages(source, true);
      setMessages(allMessages);
      setUnreadCount(unread.length);
    };

    loadMessages();

    // Listen for new messages
    const handleNewMessage = (message: DashboardMessage) => {
      if (message.to === source || message.to === 'all') {
        loadMessages();
      }
    };

    dashboardIntegration.on('message', handleNewMessage);

    return () => {
      dashboardIntegration.off('message', handleNewMessage);
    };
  }, [source]);

  // Subscribe to specific event types
  useEffect(() => {
    if (eventTypes.length === 0) return;

    const unsubscribe = dashboardIntegration.subscribeToDashboardEvents(
      source,
      eventTypes,
      (event: DashboardEvent) => {
        console.log(`[${source}] Received event:`, event);
        
        // Handle navigation events
        if (event.type === DashboardEventType.NAVIGATE_TO_DASHBOARD) {
          const { target, data } = event.data;
          if (target === source && data?.redirect) {
            window.location.href = data.redirect;
          }
        }
      }
    );

    return unsubscribe;
  }, [source, eventTypes]);

  // Emit an event
  const emitEvent = useCallback((type: DashboardEventType, data: any) => {
    dashboardIntegration.emitDashboardEvent(type, source, data);
  }, [source]);

  // Send a message
  const sendMessage = useCallback((
    to: DashboardSource | 'all',
    title: string,
    message: string,
    options: any = {}
  ) => {
    dashboardIntegration.sendMessage({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: source,
      to,
      type: options.type || 'info',
      title,
      message,
      data: options.data,
      actions: options.actions,
      timestamp: new Date()
    });
  }, [source]);

  // Mark message as read
  const markAsRead = useCallback((messageId: string) => {
    dashboardIntegration.markMessageAsRead(messageId, source);
    
    // Reload messages
    const allMessages = dashboardIntegration.getMessages(source);
    const unread = dashboardIntegration.getMessages(source, true);
    setMessages(allMessages);
    setUnreadCount(unread.length);
  }, [source]);

  // Clear messages
  const clearMessages = useCallback(() => {
    dashboardIntegration.clearMessages(source);
    setMessages([]);
    setUnreadCount(0);
  }, [source]);

  // Navigate to another dashboard
  const navigateTo = useCallback((target: DashboardSource, data?: any) => {
    dashboardIntegration.navigateToDashboard(target, data);
  }, []);

  // Request data from another dashboard
  const requestData = useCallback(async (from: DashboardSource, dataType: string) => {
    return await dashboardIntegration.requestDashboardData(from, dataType);
  }, []);

  // Share data with another dashboard
  const shareData = useCallback((to: DashboardSource, dataType: string, data: any) => {
    dashboardIntegration.shareData(source, to, dataType, data);
  }, [source]);

  // Get shared data
  const getSharedData = useCallback((from: DashboardSource, dataType: string) => {
    return dashboardIntegration.getSharedData(from, source, dataType);
  }, [source]);

  // Auto-mark messages as read when viewed
  useEffect(() => {
    if (autoMarkRead && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        !dashboardIntegration['isMessageRead'](msg.id, source)
      );
      
      unreadMessages.forEach(msg => {
        markAsRead(msg.id);
      });
    }
  }, [messages, autoMarkRead, markAsRead, source]);

  return {
    messages,
    unreadCount,
    emitEvent,
    sendMessage,
    markAsRead,
    clearMessages,
    navigateTo,
    requestData,
    shareData,
    getSharedData
  };
}

// Hook for Mission Control to coordinate all dashboards
export function useMissionControlCoordinator() {
  const [dashboardStates, setDashboardStates] = useState<Map<DashboardSource, any>>(new Map());

  const coordinateAction = useCallback(async (action: string, data: any) => {
    return await dashboardIntegration.coordinateAction(action, DashboardSource.MISSION_CONTROL, data);
  }, []);

  const broadcastToAll = useCallback((
    type: DashboardEventType,
    data: any,
    message?: { title: string; content: string }
  ) => {
    // Emit event
    dashboardIntegration.emitDashboardEvent(type, DashboardSource.MISSION_CONTROL, data);
    
    // Send message if provided
    if (message) {
      dashboardIntegration.sendMessage({
        id: `broadcast_${Date.now()}`,
        from: DashboardSource.MISSION_CONTROL,
        to: 'all',
        type: 'info',
        title: message.title,
        message: message.content,
        data,
        timestamp: new Date()
      });
    }
  }, []);

  const collectDashboardData = useCallback(async () => {
    const data = new Map<DashboardSource, any>();
    
    // Collect from each dashboard
    for (const dashboard of [
      DashboardSource.ADMIN,
      DashboardSource.RISK_OFFICER,
      DashboardSource.COMPLIANCE_REVIEWER
    ]) {
      try {
        const dashboardData = await dashboardIntegration.requestDashboardData(
          dashboard,
          'dashboard_state'
        );
        data.set(dashboard, dashboardData);
      } catch (error) {
        console.error(`Failed to collect data from ${dashboard}:`, error);
      }
    }
    
    setDashboardStates(data);
    return data;
  }, []);

  return {
    dashboardStates,
    coordinateAction,
    broadcastToAll,
    collectDashboardData
  };
}