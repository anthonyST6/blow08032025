import { useCallback, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useMissionControlPersistence } from './useMissionControlPersistence';

export enum ActionType {
  VANGUARD_EXECUTION = 'vanguard_execution',
  VANGUARD_RESULT = 'vanguard_result',
  DATA_EXPORT = 'data_export',
  WORKFLOW_INITIATED = 'workflow_initiated',
  USER_ACTION = 'user_action',
}

interface LogActionParams {
  actionType: ActionType;
  actionDetails: {
    component: string;
    description: string;
    parameters?: Record<string, any>;
    result?: any;
  };
}

interface QueuedLogEntry {
  id: string;
  timestamp: string;
  data: any;
  retryCount: number;
}

const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds
const MAX_RETRY_COUNT = 3;
const OFFLINE_QUEUE_KEY = 'audit_log_offline_queue';

export const useAuditLogger = () => {
  const { user } = useAuth();
  const { selectedUseCase } = useMissionControlPersistence();
  const batchQueue = useRef<any[]>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);
  const isOnline = useRef(navigator.onLine);

  // Load offline queue on mount
  useEffect(() => {
    const loadOfflineQueue = () => {
      try {
        const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
        if (stored) {
          const queue: QueuedLogEntry[] = JSON.parse(stored);
          // Process offline queue when coming back online
          if (isOnline.current && queue.length > 0) {
            processOfflineQueue(queue);
          }
        }
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    };

    loadOfflineQueue();

    // Monitor online/offline status
    const handleOnline = () => {
      isOnline.current = true;
      loadOfflineQueue();
    };

    const handleOffline = () => {
      isOnline.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }
    };
  }, []);

  const saveToOfflineQueue = (entry: any) => {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: QueuedLogEntry[] = stored ? JSON.parse(stored) : [];
      
      queue.push({
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        data: entry,
        retryCount: 0
      });

      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save to offline queue:', error);
    }
  };

  const processOfflineQueue = async (queue: QueuedLogEntry[]) => {
    const remaining: QueuedLogEntry[] = [];

    for (const item of queue) {
      try {
        await api.post('/audit-trail/use-case/log', item.data);
      } catch (error) {
        item.retryCount++;
        if (item.retryCount < MAX_RETRY_COUNT) {
          remaining.push(item);
        } else {
          console.error('Max retries exceeded for log entry:', item);
        }
      }
    }

    // Update offline queue with remaining items
    if (remaining.length > 0) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    }
  };

  const processBatch = async () => {
    if (batchQueue.current.length === 0) return;

    const batch = [...batchQueue.current];
    batchQueue.current = [];

    if (!isOnline.current) {
      // Save entire batch to offline queue
      batch.forEach(entry => saveToOfflineQueue(entry));
      return;
    }

    try {
      // Send batch to backend
      await Promise.all(
        batch.map(entry => api.post('/audit-trail/use-case/log', entry))
      );
    } catch (error) {
      console.error('Failed to process batch:', error);
      // Save failed entries to offline queue
      batch.forEach(entry => saveToOfflineQueue(entry));
    }
  };

  const scheduleBatchProcess = () => {
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
    }

    batchTimer.current = setTimeout(() => {
      processBatch();
    }, BATCH_INTERVAL);
  };

  const logAction = useCallback(async (params: LogActionParams) => {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId: user?.uid,
        userEmail: user?.email,
        useCaseId: selectedUseCase,
        action: params.actionType,
        resource: params.actionDetails.component,
        result: params.actionDetails.result ? 'success' : 'pending',
        particulars: {
          useCaseId: selectedUseCase,
          component: params.actionDetails.component,
          parameters: params.actionDetails.parameters
        },
        details: params.actionDetails,
        metadata: {
          source: 'use-case-dashboard',
          sessionId: sessionStorage.getItem('sessionId'),
        }
      };
      
      // Add to batch queue
      batchQueue.current.push(logEntry);
      
      // Process immediately if batch is full
      if (batchQueue.current.length >= BATCH_SIZE) {
        processBatch();
      } else {
        // Schedule batch processing
        scheduleBatchProcess();
      }
      
      // Also update local state for immediate UI feedback
      const event = new CustomEvent('audit-log-entry', { detail: logEntry });
      window.dispatchEvent(event);
      
      return logEntry;
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }, [user, selectedUseCase]);
  
  return { logAction };
};