'use client';

import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';

interface QueueData {
  currentToken: string;
  nextTokens: string[];
  doctorName: string;
  roomNumber: string;
  departmentName: string;
  queueType: 'Optometry' | 'Doctor' | 'Billing' | 'Pharmacy';
  timestamp: string;
}

interface QueueDisplayTVProps {
  branchId?: string;
  departmentId?: string;
  queueType?: 'Optometry' | 'Doctor' | 'Billing' | 'Pharmacy';
  autoRefreshInterval?: number; // milliseconds
  enableWebSocket?: boolean;
}

export default function QueueDisplayTV({
  branchId,
  departmentId,
  queueType = 'Doctor',
  autoRefreshInterval = 5000,
  enableWebSocket = true,
}: QueueDisplayTVProps) {
  const [queueData, setQueueData] = useState<QueueData>({
    currentToken: 'BLR-001',
    nextTokens: ['BLR-002', 'BLR-003', 'BLR-004', 'BLR-005', 'BLR-006'],
    doctorName: 'Dr. Rajesh Kumar',
    roomNumber: 'R-101',
    departmentName: 'Ophthalmology',
    queueType: 'Doctor',
    timestamp: new Date().toISOString(),
  });
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);

  // SignalR connection for real-time updates
  useEffect(() => {
    if (!enableWebSocket) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5073';
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/queue`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [enableWebSocket]);

  useEffect(() => {
    if (!connection) return;

    connection.start()
      .then(() => {
        console.log('Queue Display: Connected to SignalR');
        setIsConnected(true);
        
        // Subscribe to queue updates for this specific queue
        if (branchId && queueType) {
          connection.invoke('SubscribeToQueue', branchId, departmentId || null, queueType)
            .catch(err => console.error('Error subscribing to queue:', err));
        }

        // Listen for token calls
        connection.on('TokenCalled', (data: { tokenNumber: string; roomNumber: string; doctorName: string }) => {
          console.log('Queue Display: Token called', data);
          setQueueData((prev) => ({
            ...prev,
            currentToken: data.tokenNumber,
            roomNumber: data.roomNumber,
            doctorName: data.doctorName,
            timestamp: new Date().toISOString(),
          }));
          setLastUpdate(new Date());
        });

        // Listen for queue updates
        connection.on('QueueUpdate', (data: QueueData) => {
          console.log('Queue Display: Received queue update', data);
          setQueueData(data);
          setLastUpdate(new Date());
        });

        // Listen for subscription confirmation
        connection.on('SubscriptionConfirmed', (data: any) => {
          console.log('Queue Display: Subscription confirmed', data);
        });
      })
      .catch(err => {
        console.error('SignalR connection error:', err);
        setIsConnected(false);
      });

    connection.onreconnecting(() => {
      console.log('Queue Display: Reconnecting...');
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log('Queue Display: Reconnected');
      setIsConnected(true);
      // Resubscribe after reconnection
      if (branchId && queueType) {
        connection.invoke('SubscribeToQueue', branchId, departmentId || null, queueType)
          .catch(err => console.error('Error resubscribing:', err));
      }
    });

    connection.onclose(() => {
      console.log('Queue Display: Disconnected');
      setIsConnected(false);
    });

    return () => {
      if (connection && branchId && queueType) {
        connection.invoke('UnsubscribeFromQueue', branchId, departmentId || null, queueType)
          .catch(err => console.error('Error unsubscribing:', err));
      }
      connection?.stop();
    };
  }, [connection, branchId, departmentId, queueType]);

  // Fallback: Auto-refresh via polling
  useEffect(() => {
    if (enableWebSocket && isConnected) {
      // Skip polling if WebSocket is connected
      return;
    }

    const fetchQueueData = async () => {
      try {
        // API call to fetch queue data (implement backend API)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/queue/display?branchId=${branchId}&departmentId=${departmentId}&queueType=${queueType}`
        );
        if (response.ok) {
          const data = await response.json();
          setQueueData(data);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch queue data:', error);
      }
    };

    const interval = setInterval(fetchQueueData, autoRefreshInterval);
    fetchQueueData(); // Initial fetch

    return () => clearInterval(interval);
  }, [enableWebSocket, isConnected, branchId, departmentId, queueType, autoRefreshInterval]);

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-6 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-4xl font-bold mb-1">Queue Display</h1>
            <p className="text-xl text-emerald-100">
              {queueData.departmentName} - {queueData.queueType}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">{formatTime(new Date())}</div>
            <div className="text-sm text-emerald-100 flex items-center gap-2 justify-end mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
              {isConnected ? 'Live Updates' : 'Offline Mode'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-7xl mx-auto w-full">
        {/* Current Token */}
        <div className="mb-12 text-center w-full">
          <p className="text-3xl font-semibold text-slate-600 mb-4">NOW SERVING</p>
          <div className="bg-emerald-600 rounded-3xl shadow-lg p-12 border-4 border-emerald-300 animate-pulse">
            <div className="text-[10rem] font-black text-white leading-none tracking-tight drop-shadow-lg">
              {queueData.currentToken}
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-4xl font-bold text-slate-800">{queueData.doctorName}</p>
            <div className="flex items-center justify-center gap-4 text-2xl text-slate-600">
              <span className="flex items-center gap-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Room {queueData.roomNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Next Tokens */}
        <div className="w-full">
          <p className="text-3xl font-semibold text-slate-600 mb-6 text-center">NEXT IN QUEUE</p>
          <div className="grid grid-cols-5 gap-6">
            {queueData.nextTokens.map((token, index) => (
              <div
                key={token}
                className="bg-emerald-600 rounded-xl shadow-lg p-8 border-4 border-emerald-300 transform transition-all hover:scale-105"
              >
                <div className="text-6xl font-bold text-white text-center leading-none">
                  {token}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-4 text-center border-t border-gray-300">
        <p className="text-lg text-gray-600">
          Last Updated: {formatTime(lastUpdate)}
          {!isConnected && (
            <span className="ml-4 text-yellow-600 font-semibold">
              (Auto-refresh every {autoRefreshInterval / 1000}s)
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
