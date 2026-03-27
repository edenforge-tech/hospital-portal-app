// SignalR Connection Hook - Generic real-time connection management
import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/lib/auth-store';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface UseSignalROptions {
  hubUrl: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onError?: (error: Error) => void;
}

export function useSignalR(options: UseSignalROptions) {
  const {
    hubUrl,
    autoConnect = true,
    reconnectInterval = 5000,
    onConnected,
    onDisconnected,
    onReconnecting,
    onReconnected,
    onError,
  } = options;

  const { token } = useAuthStore();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create connection
  const createConnection = useCallback(() => {
    if (!token) {
      setConnectionState('disconnected');
      return null;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 30s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Connection lifecycle events
    connection.onclose((error) => {
      setConnectionState('disconnected');
      setError(error || null);
      if (error) {
        console.error('❌ SignalR connection closed with error:', error);
        onError?.(error);
      }
      onDisconnected?.();

      // Auto-reconnect if enabled
      if (autoConnect && reconnectInterval > 0) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect SignalR...');
          connect();
        }, reconnectInterval);
      }
    });

    connection.onreconnecting((error) => {
      setConnectionState('reconnecting');
      setError(error || null);
      console.log('🔄 SignalR reconnecting...', error);
      onReconnecting?.();
    });

    connection.onreconnected((connectionId) => {
      setConnectionState('connected');
      setError(null);
      console.log('✅ SignalR reconnected. Connection ID:', connectionId);
      onReconnected?.();
    });

    return connection;
  }, [token, hubUrl, autoConnect, reconnectInterval, onConnected, onDisconnected, onReconnecting, onReconnected, onError]);

  // Connect to hub
  const connect = useCallback(async () => {
    if (!token) {
      console.warn('⚠️ Cannot connect to SignalR: No auth token');
      return false;
    }

    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      console.log('✅ SignalR already connected');
      return true;
    }

    try {
      setConnectionState('connecting');
      setError(null);

      // Create new connection if not exists
      if (!connectionRef.current) {
        connectionRef.current = createConnection();
      }

      if (!connectionRef.current) {
        throw new Error('Failed to create SignalR connection');
      }

      await connectionRef.current.start();
      setConnectionState('connected');
      console.log('✅ SignalR connected successfully');
      onConnected?.();
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to SignalR');
      setConnectionState('error');
      setError(error);
      console.error('❌ SignalR connection failed:', error);
      onError?.(error);
      return false;
    }
  }, [token, createConnection, onConnected, onError]);

  // Disconnect from hub
  const disconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
        console.log('🔌 SignalR disconnected');
      } catch (err) {
        console.error('❌ Error disconnecting SignalR:', err);
      }
      connectionRef.current = null;
    }
    setConnectionState('disconnected');
    setError(null);
  }, []);

  // Subscribe to event
  const on = useCallback(
    <T = any>(eventName: string, handler: (data: T) => void) => {
      if (!connectionRef.current) {
        console.warn(`⚠️ Cannot subscribe to "${eventName}": No connection`);
        return () => {};
      }

      connectionRef.current.on(eventName, handler);
      console.log(`📡 Subscribed to SignalR event: ${eventName}`);

      // Return unsubscribe function
      return () => {
        connectionRef.current?.off(eventName, handler);
        console.log(`📴 Unsubscribed from SignalR event: ${eventName}`);
      };
    },
    []
  );

  // Invoke server method
  const invoke = useCallback(
    async <T = any>(methodName: string, ...args: any[]): Promise<T | null> => {
      if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
        console.warn(`⚠️ Cannot invoke "${methodName}": Not connected`);
        return null;
      }

      try {
        const result = await connectionRef.current.invoke<T>(methodName, ...args);
        console.log(`📤 Invoked SignalR method: ${methodName}`, args);
        return result;
      } catch (err) {
        console.error(`❌ Error invoking "${methodName}":`, err);
        throw err;
      }
    },
    []
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, token]);

  return {
    connection: connectionRef.current,
    connectionState,
    error,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isReconnecting: connectionState === 'reconnecting',
    connect,
    disconnect,
    on,
    invoke,
  };
}
