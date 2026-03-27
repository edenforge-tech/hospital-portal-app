import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';

/**
 * Hook for real-time queue updates via SignalR
 * Replaces polling with instant push notifications
 */
export function useQueueUpdates() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!tenantId) {
      console.warn('No tenant ID available for queue updates');
      return;
    }

    let isSubscribed = true;

    const startConnection = async () => {
      try {
        // Get API base URL without /api suffix for SignalR hub
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5073';
        const hubUrl = `${apiUrl}/hubs/queue`;

        console.log('Connecting to SignalR hub:', hubUrl);

        const connection = new HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => {
              // Get token from auth store or localStorage
              const token = useAuthStore.getState().token;
              return token || '';
            },
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              // Exponential backoff: 0, 2s, 10s, 30s, then 60s
              if (retryContext.elapsedMilliseconds < 60000) {
                return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 60000);
              }
              return 60000;
            },
          })
          .configureLogging(LogLevel.Information)
          .build();

        // Handle queue updates
        connection.on('QueueUpdated', (item: any, action: string) => {
          if (!isSubscribed) return;

          console.log('Queue updated:', action, item);

          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['counseling-queue'] });
          queryClient.invalidateQueries({ queryKey: ['counseling-queue-stats'] });

          // Show toast notification
          switch (action) {
            case 'added':
              toast.info(`Patient added to queue: ${item.patientName || 'Unknown'}`, {
                description: `Token: ${item.tokenNumber || 'N/A'}`,
              });
              break;
            case 'session_started':
              toast.success(`Session started for ${item.patientName || 'Unknown'}`);
              break;
            case 'completed':
              toast.success('Queue item completed');
              break;
            case 'updated':
              // Silent update for status changes
              break;
          }
        });

        // Handle stats updates
        connection.on('StatsUpdated', (stats: any) => {
          if (!isSubscribed) return;

          console.log('Stats updated:', stats);

          // Update stats cache without full refetch
          queryClient.setQueryData(['counseling-queue-stats'], (old: any) => ({
            ...old,
            ...stats,
          }));
        });

        // Handle errors
        connection.on('Error', (error: any) => {
          console.error('SignalR error:', error);
          setConnectionError(error.Message || 'Connection error');
          toast.error('Queue update error', {
            description: error.Message || 'Failed to receive updates',
          });
        });

        // Connection lifecycle events
        connection.onreconnecting((error) => {
          console.warn('SignalR reconnecting...', error);
          setIsConnected(false);
          setConnectionError('Reconnecting...');
        });

        connection.onreconnected((connectionId) => {
          console.log('SignalR reconnected:', connectionId);
          setIsConnected(true);
          setConnectionError(null);
          
          // Rejoin tenant queue
          connection.invoke('JoinTenantQueue', tenantId).catch((err) => {
            console.error('Failed to rejoin queue:', err);
          });

          toast.success('Queue updates reconnected');
        });

        connection.onclose((error) => {
          console.error('SignalR connection closed:', error);
          setIsConnected(false);
          setConnectionError('Connection closed');
        });

        // Start connection
        await connection.start();
        console.log('SignalR connected successfully');

        // Join tenant queue
        await connection.invoke('JoinTenantQueue', tenantId);
        console.log('Joined tenant queue:', tenantId);

        setIsConnected(true);
        setConnectionError(null);
        connectionRef.current = connection;

      } catch (err: any) {
        console.error('Error establishing SignalR connection:', err);
        setConnectionError(err.message || 'Failed to connect');
        
        if (isSubscribed) {
          toast.error('Failed to connect to queue updates', {
            description: 'Falling back to polling',
          });
        }
      }
    };

    startConnection();

    // Cleanup
    return () => {
      isSubscribed = false;
      
      if (connectionRef.current) {
        connectionRef.current
          .invoke('LeaveTenantQueue', tenantId)
          .catch((err) => console.error('Error leaving queue:', err))
          .finally(() => {
            connectionRef.current?.stop();
            connectionRef.current = null;
          });
      }
    };
  }, [tenantId, queryClient]);

  return {
    isConnected,
    connectionError,
    connection: connectionRef.current,
  };
}
