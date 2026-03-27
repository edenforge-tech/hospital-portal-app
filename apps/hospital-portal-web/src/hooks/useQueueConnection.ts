// SignalR Queue Connection Hook
// Real-time queue updates for doctor desk, optometry, and TV displays

import { useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';

interface QueueUpdate {
  tenantId: string;
  branchId: string;
  departmentId?: string;
  queueType: string;
  timestamp: Date;
  data: any;
}

interface PatientCalled {
  tenantId: string;
  branchId: string;
  patientName: string;
  queueType: string;
  timestamp: Date;
}

interface QueuePositionChanged {
  tenantId: string;
  branchId: string;
  patientId: string;
  oldPosition: number;
  newPosition: number;
  timestamp: Date;
}

interface PatientStatusChanged {
  tenantId: string;
  branchId: string;
  patientId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: Date;
}

interface UseQueueConnectionOptions {
  branchId?: string; // Made optional for general usage
  departmentId?: string;
  queueType?: string;
  onQueueUpdate?: (update: QueueUpdate) => void;
  onPatientCalled?: (data: PatientCalled) => void;
  onQueuePositionChanged?: (data: QueuePositionChanged) => void;
  onPatientStatusChanged?: (data: PatientStatusChanged) => void;
  autoConnect?: boolean;
  showToasts?: boolean;
}

export function useQueueConnection({
  branchId,
  departmentId,
  queueType,
  onQueueUpdate,
  onPatientCalled,
  onQueuePositionChanged,
  onPatientStatusChanged,
  autoConnect = true,
  showToasts = false,
}: UseQueueConnectionOptions) {
  const { token } = useAuthStore();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Build connection
  const buildConnection = useCallback(() => {
    if (!token) {
      console.warn('Cannot connect to SignalR: No authentication token');
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
    const hubUrl = apiUrl.replace('/api', '/hubs/queue');

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0, 2, 10, 30 seconds, then 30 seconds
          const delays = [0, 2000, 10000, 30000];
          return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)];
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Connection lifecycle events
    conn.onreconnecting((error) => {
      console.warn('SignalR reconnecting...', error);
      setIsConnected(false);
      setError('Reconnecting...');
      if (showToasts) {
        toast.loading('Reconnecting to live updates...', { id: 'signalr-reconnect' });
      }
    });

    conn.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
      if (showToasts) {
        toast.success('Reconnected to live updates', { id: 'signalr-reconnect' });
      }
      
      // Re-subscribe to queue after reconnection
      if (queueType) {
        subscribeToQueue(branchId, departmentId, queueType, conn);
      } else {
        subscribeToBranch(branchId, conn);
      }
    });

    conn.onclose((error) => {
      console.error('SignalR connection closed:', error);
      setIsConnected(false);
      setError(error?.message || 'Connection closed');
      
      // Attempt manual reconnection if automatic reconnect failed
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        setTimeout(() => {
          connect();
        }, delay);
      } else if (showToasts) {
        toast.error('Lost connection to live updates. Please refresh the page.', { 
          duration: 10000,
          id: 'signalr-error' 
        });
      }
    });

    return conn;
  }, [token, branchId, departmentId, queueType, showToasts]);

  // Subscribe to specific queue
  const subscribeToQueue = async (
    branchId: string,
    departmentId: string | undefined,
    queueType: string,
    conn: signalR.HubConnection
  ) => {
    try {
      await conn.invoke('SubscribeToQueue', branchId, departmentId || null, queueType);
      console.log(`Subscribed to queue: ${branchId}/${departmentId}/${queueType}`);
    } catch (err) {
      console.error('Error subscribing to queue:', err);
      setError('Failed to subscribe to queue updates');
    }
  };

  // Subscribe to all queues in branch (admin/reception)
  const subscribeToBranch = async (branchId: string, conn: signalR.HubConnection) => {
    try {
      await conn.invoke('SubscribeToBranch', branchId);
      console.log(`Subscribed to branch: ${branchId}`);
    } catch (err) {
      console.error('Error subscribing to branch:', err);
      setError('Failed to subscribe to branch updates');
    }
  };

  // Connect to SignalR hub
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const conn = buildConnection();
      if (!conn) {
        setIsConnecting(false);
        return;
      }

      // Register event handlers
      conn.on('QueueUpdated', (update: QueueUpdate) => {
        console.log('Queue updated:', update);
        onQueueUpdate?.(update);
      });

      conn.on('PatientCalled', (data: PatientCalled) => {
        console.log('Patient called:', data);
        onPatientCalled?.(data);
        if (showToasts) {
          toast(`📢 ${data.patientName} called to ${data.queueType}`, { 
            icon: '🔔',
            duration: 5000 
          });
        }
      });

      conn.on('QueuePositionChanged', (data: QueuePositionChanged) => {
        console.log('Queue position changed:', data);
        onQueuePositionChanged?.(data);
      });

      conn.on('PatientStatusChanged', (data: PatientStatusChanged) => {
        console.log('Patient status changed:', data);
        onPatientStatusChanged?.(data);
      });

      conn.on('SubscriptionConfirmed', (data: any) => {
        console.log('Subscription confirmed:', data);
        if (showToasts) {
          toast.success('Connected to live queue updates', { id: 'signalr-connect' });
        }
      });

      conn.on('UnsubscriptionConfirmed', (data: any) => {
        console.log('Unsubscription confirmed:', data);
      });

      conn.on('Error', (data: any) => {
        console.error('SignalR error:', data);
        setError(data.Message);
      });

      // Start connection
      await conn.start();
      console.log('SignalR connected successfully');
      setConnection(conn);
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttemptsRef.current = 0;

      // Subscribe based on provided parameters
      if (queueType) {
        await subscribeToQueue(branchId, departmentId, queueType, conn);
      } else {
        await subscribeToBranch(branchId, conn);
      }

    } catch (err: any) {
      console.error('SignalR connection error:', err);
      setError(err.message || 'Failed to connect');
      setIsConnecting(false);
      setIsConnected(false);
      
      // Retry connection
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        setTimeout(() => {
          connect();
        }, 2000 * reconnectAttemptsRef.current);
      }
    }
  }, [
    buildConnection, 
    isConnecting, 
    isConnected, 
    branchId, 
    departmentId, 
    queueType,
    onQueueUpdate,
    onPatientCalled,
    onQueuePositionChanged,
    onPatientStatusChanged,
    showToasts,
  ]);

  // Disconnect from SignalR hub
  const disconnect = useCallback(async () => {
    if (connection) {
      try {
        await connection.stop();
        console.log('SignalR disconnected');
        setIsConnected(false);
        setConnection(null);
      } catch (err) {
        console.error('Error disconnecting from SignalR:', err);
      }
    }
  }, [connection]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && token && branchId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, token, branchId]); // Don't include connect/disconnect to avoid reconnection loops

  return {
    connection,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}
