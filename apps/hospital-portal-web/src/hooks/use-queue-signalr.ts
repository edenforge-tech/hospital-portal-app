// Queue SignalR Hook - Real-time queue updates
import { useEffect, useCallback } from 'react';
import { useSignalR } from './use-signalr';
import { useQueryClient } from '@tanstack/react-query';
import { queueKeys } from './use-queue';

export interface QueueUpdateData {
  tenantId: string;
  branchId: string;
  departmentId?: string;
  queueType: string;
  timestamp: string;
  data: {
    action: 'PatientCalled' | 'PatientMarkedAbsent' | 'PatientTransferred' | 'QueueRefresh';
    queueItem?: any;
    [key: string]: any;
  };
}

export interface PatientCalledData {
  tenantId: string;
  branchId: string;
  patientName: string;
  queueType: string;
  timestamp: string;
}

export interface UseQueueSignalROptions {
  branchId: string;
  departmentId?: string;
  queueType?: string;
  enabled?: boolean;
  onQueueUpdate?: (data: QueueUpdateData) => void;
  onPatientCalled?: (data: PatientCalledData) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for real-time queue updates via SignalR
 * Automatically subscribes to queue updates and invalidates React Query cache
 */
export function useQueueSignalR(options: UseQueueSignalROptions) {
  const {
    branchId,
    departmentId,
    queueType,
    enabled = true,
    onQueueUpdate,
    onPatientCalled,
    onError,
  } = options;

  const queryClient = useQueryClient();

  // Get API base URL from environment
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
  const hubUrl = apiBaseUrl.replace('/api', '/hubs/queue');

  // Initialize SignalR connection
  const {
    connectionState,
    isConnected,
    connect,
    disconnect,
    on,
    invoke,
    error: connectionError,
  } = useSignalR({
    hubUrl,
    autoConnect: enabled,
    onConnected: () => {
      console.log('✅ Queue SignalR connected');
    },
    onDisconnected: () => {
      console.log('🔌 Queue SignalR disconnected');
    },
    onReconnected: () => {
      console.log('🔄 Queue SignalR reconnected - resubscribing...');
      // Resubscribe after reconnection
      if (enabled) {
        subscribeToQueue();
      }
    },
    onError: (err) => {
      console.error('❌ Queue SignalR error:', err);
      onError?.(err);
    },
  });

  // Subscribe to queue updates
  const subscribeToQueue = useCallback(async () => {
    if (!isConnected || !branchId) {
      console.warn('⚠️ Cannot subscribe: Not connected or missing branchId');
      return;
    }

    try {
      // Subscribe to specific queue or all queues in branch
      if (queueType && queueType !== 'all') {
        await invoke('SubscribeToQueue', branchId, departmentId || null, queueType);
        console.log(`📡 Subscribed to ${queueType} queue for branch ${branchId}`);
      } else {
        // Subscribe to all queues in the branch
        await invoke('SubscribeToBranch', branchId);
        console.log(`📡 Subscribed to all queues for branch ${branchId}`);
      }
    } catch (error) {
      console.error('❌ Failed to subscribe to queue:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to subscribe to queue'));
    }
  }, [isConnected, branchId, departmentId, queueType, invoke, onError]);

  // Unsubscribe from queue
  const unsubscribeFromQueue = useCallback(async () => {
    if (!isConnected || !branchId) return;

    try {
      if (queueType && queueType !== 'all') {
        await invoke('UnsubscribeFromQueue', branchId, departmentId || null, queueType);
        console.log(`📴 Unsubscribed from ${queueType} queue`);
      }
    } catch (error) {
      console.error('❌ Failed to unsubscribe from queue:', error);
    }
  }, [isConnected, branchId, departmentId, queueType, invoke]);

  // Handle QueueUpdated event
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on<QueueUpdateData>('QueueUpdated', (data) => {
      console.log('📥 QueueUpdated event received:', data);

      // Invalidate queue queries to refresh data
      queryClient.invalidateQueries({ queryKey: queueKeys.all });

      // Call custom handler
      onQueueUpdate?.(data);

      // Show notification based on action
      if (data.data.action === 'PatientCalled') {
        console.log('📢 Patient called:', data.data.queueItem);
      } else if (data.data.action === 'PatientMarkedAbsent') {
        console.log('❌ Patient marked absent:', data.data.queueItem);
      } else if (data.data.action === 'PatientTransferred') {
        console.log('🔀 Patient transferred:', data.data.queueItem);
      }
    });

    return unsubscribe;
  }, [isConnected, on, queryClient, onQueueUpdate]);

  // Handle PatientCalled event
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on<PatientCalledData>('PatientCalled', (data) => {
      console.log('📥 PatientCalled event received:', data);

      // Invalidate queue queries to refresh data
      queryClient.invalidateQueries({ queryKey: queueKeys.all });

      // Call custom handler
      onPatientCalled?.(data);

      // Could show a toast notification here
      console.log(`📢 ${data.patientName} called for ${data.queueType}`);
    });

    return unsubscribe;
  }, [isConnected, on, queryClient, onPatientCalled]);

  // Handle SubscriptionConfirmed event
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on<any>('SubscriptionConfirmed', (data) => {
      console.log('✅ Subscription confirmed:', data);
    });

    return unsubscribe;
  }, [isConnected, on]);

  // Handle Error event
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = on<{ message: string }>('Error', (data) => {
      console.error('❌ SignalR error event:', data.message);
      onError?.(new Error(data.message));
    });

    return unsubscribe;
  }, [isConnected, on, onError]);

  // Subscribe when connection is established
  useEffect(() => {
    if (isConnected && enabled) {
      subscribeToQueue();
    }

    return () => {
      if (isConnected && enabled) {
        unsubscribeFromQueue();
      }
    };
  }, [isConnected, enabled, subscribeToQueue]);

  return {
    connectionState,
    isConnected,
    error: connectionError,
    connect,
    disconnect,
    subscribe: subscribeToQueue,
    unsubscribe: unsubscribeFromQueue,
  };
}
