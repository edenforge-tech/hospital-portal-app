'use client';

import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { getApi } from '@/lib/api';
import { Phone, Clock, UserX, ArrowRight, AlertCircle, Users, Activity } from 'lucide-react';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';

interface QueueItem {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  mobileNumber: string;
  appointmentId?: string;
  queueType: 'Optometry' | 'Doctor' | 'Billing' | 'Pharmacy';
  status: 'waiting' | 'called' | 'in-progress' | 'completed' | 'absent';
  checkedInAt: string;
  calledAt?: string;
  waitTime: number; // minutes
  doctorName?: string;
  roomNumber?: string;
  priority: 'normal' | 'emergency' | 'follow-up';
}

interface QueueStats {
  totalWaiting: number;
  averageWaitTime: number;
  totalCompleted: number;
  totalAbsent: number;
}

interface QueueSectionProps {
  title: string;
  queueType: 'Optometry' | 'Doctor' | 'Billing' | 'Pharmacy';
  icon: React.ReactNode;
  color: string;
}

export default function QueueDashboard() {
  const [queues, setQueues] = useState<Record<string, QueueItem[]>>({
    Optometry: [],
    Doctor: [],
    Billing: [],
    Pharmacy: [],
  });
  const [stats, setStats] = useState<Record<string, QueueStats>>({
    Optometry: { totalWaiting: 0, averageWaitTime: 0, totalCompleted: 0, totalAbsent: 0 },
    Doctor: { totalWaiting: 0, averageWaitTime: 0, totalCompleted: 0, totalAbsent: 0 },
    Billing: { totalWaiting: 0, averageWaitTime: 0, totalCompleted: 0, totalAbsent: 0 },
    Pharmacy: { totalWaiting: 0, averageWaitTime: 0, totalCompleted: 0, totalAbsent: 0 },
  });
  const [selectedQueue, setSelectedQueue] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferToQueue, setTransferToQueue] = useState<'Optometry' | 'Doctor' | 'Billing' | 'Pharmacy'>('Doctor');
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // SignalR connection for real-time updates
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5073';
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/queue`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => {
        console.log('Queue Dashboard: Connected to SignalR');
        setIsConnected(true);
        
        // Subscribe to all queues (branch-wide)
        const branchId = localStorage.getItem('branchId');
        if (branchId) {
          newConnection.invoke('SubscribeToBranch', branchId)
            .catch(err => console.error('Error subscribing to branch:', err));
        }

        // Listen for queue updates
        newConnection.on('QueueUpdate', (data: any) => {
          console.log('Queue Dashboard: Received queue update', data);
          fetchQueueData(); // Refresh data
        });

        // Listen for token calls
        newConnection.on('TokenCalled', (data: any) => {
          console.log('Queue Dashboard: Token called', data);
          fetchQueueData(); // Refresh data
        });

        // Listen for subscription confirmation
        newConnection.on('SubscriptionConfirmed', (data: any) => {
          console.log('Queue Dashboard: Subscription confirmed', data);
        });
      })
      .catch(err => {
        console.error('SignalR connection error:', err);
        setIsConnected(false);
      });

    newConnection.onreconnecting(() => {
      console.log('Queue Dashboard: Reconnecting...');
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      console.log('Queue Dashboard: Reconnected');
      setIsConnected(true);
      // Resubscribe after reconnection
      const branchId = localStorage.getItem('branchId');
      if (branchId) {
        newConnection.invoke('SubscribeToBranch', branchId)
          .catch(err => console.error('Error resubscribing:', err));
      }
    });

    newConnection.onclose(() => {
      console.log('Queue Dashboard: Disconnected');
      setIsConnected(false);
    });

    setConnection(newConnection);

    return () => {
      newConnection?.stop();
    };
  }, []);

  // Fetch queue data (initial load and fallback)
  useEffect(() => {
    fetchQueueData();
    // Reduced polling interval since we have real-time updates
    const interval = setInterval(fetchQueueData, 30000); // Refresh every 30 seconds (fallback)
    return () => clearInterval(interval);
  }, []);

  const fetchQueueData = async () => {
    try {
      const api = getApi();
      const response = await api.get('/queue/all'); // Backend API to implement
      
      if (response.data) {
        setQueues(response.data.queues);
        setStats(response.data.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch queue data:', error);
      setLoading(false);
    }
  };

  // Call patient
  const handleCallPatient = async (item: QueueItem) => {
    try {
      const api = getApi();
      await api.post(`/queue/${item.id}/call`, {
        roomNumber: item.roomNumber,
        doctorName: item.doctorName,
      });
      
      // SignalR will automatically broadcast the update to all connected clients
      // Backend QueueService handles the broadcast via IHubContext<QueueHub>
      
      fetchQueueData();
    } catch (error) {
      console.error('Failed to call patient:', error);
    }
  };

  // Mark patient as absent
  const handleMarkAbsent = async (item: QueueItem) => {
    if (!confirm(`Mark ${item.patientName} (${item.tokenNumber}) as absent?`)) return;
    
    try {
      const api = getApi();
      await api.post(`/queue/${item.id}/mark-absent`);
      fetchQueueData();
    } catch (error) {
      console.error('Failed to mark absent:', error);
    }
  };

  // Transfer to another queue
  const handleTransferQueue = async () => {
    if (!selectedQueue) return;
    
    try {
      const api = getApi();
      await api.post(`/queue/${selectedQueue.id}/transfer`, {
        newQueueType: transferToQueue,
      });
      
      setTransferDialogOpen(false);
      setSelectedQueue(null);
      fetchQueueData();
    } catch (error) {
      console.error('Failed to transfer queue:', error);
    }
  };

  // Calculate wait time in minutes
  const calculateWaitTime = (checkedInAt: string): number => {
    const checkedIn = new Date(checkedInAt);
    const now = new Date();
    return Math.floor((now.getTime() - checkedIn.getTime()) / (1000 * 60));
  };

  // Queue section component
  const QueueSection = ({ title, queueType, icon, color }: QueueSectionProps) => {
    const queueItems = queues[queueType] || [];
    const queueStats = stats[queueType];
    const waitingItems = queueItems.filter((item) => item.status === 'waiting');

    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`${color} text-white px-4 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h2 className="text-base font-semibold">{title}</h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-white/20 px-2 py-1 rounded">
                {queueStats?.totalWaiting || 0} waiting
              </span>
              <span className="bg-white/20 px-2 py-1 rounded">
                {queueStats?.averageWaitTime || 0} min
              </span>
            </div>
          </div>
        </div>

        {/* Queue Items */}
        <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
          {waitingItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No patients waiting</p>
            </div>
          ) : (
            waitingItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 hover:bg-slate-50 transition-colors ${
                  item.priority === 'emergency' ? 'bg-red-50 border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl font-bold text-emerald-600">{item.tokenNumber}</span>
                      {item.priority === 'emergency' && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-medium">
                          EMERGENCY
                        </span>
                      )}
                      {item.priority === 'follow-up' && (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-medium">
                          FOLLOW-UP
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 text-sm mb-1">{item.patientName}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {item.mobileNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {calculateWaitTime(item.checkedInAt)} min
                      </span>
                    </div>
                    {item.doctorName && (
                      <p className="text-xs text-slate-600 mt-1">
                        {item.doctorName} • Room {item.roomNumber}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleCallPatient(item)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap"
                    >
                      Call Patient
                    </button>
                    <button
                      onClick={() => handleMarkAbsent(item)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 justify-center"
                    >
                      <UserX className="w-3 h-3" />
                      Absent
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQueue(item);
                        setTransferDialogOpen(true);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 justify-center"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Transfer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Loading queue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Queue Management</h1>
        <p className="text-sm text-slate-600">Monitor and manage patient queues across all departments</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Total Waiting</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {Object.values(stats).reduce((sum, s) => sum + s.totalWaiting, 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Avg Wait Time</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {Math.round(
                    Object.values(stats).reduce((sum, s) => sum + s.averageWaitTime, 0) /
                      Object.values(stats).length
                  )}{' '}
                  <span className="text-sm text-slate-600">min</span>
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Completed Today</p>
                <p className="text-2xl font-semibold text-emerald-600 mt-1">
                  {Object.values(stats).reduce((sum, s) => sum + s.totalCompleted, 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Absent</p>
                <p className="text-2xl font-semibold text-red-600 mt-1">
                  {Object.values(stats).reduce((sum, s) => sum + s.totalAbsent, 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Queue Sections */}
        <div className="grid grid-cols-2 gap-4">
          <QueueSection
            title="Optometry Queue"
            queueType="Optometry"
            icon={<Activity className="w-5 h-5" />}
            color="bg-purple-600"
          />
          <QueueSection
            title="Doctor Queue"
            queueType="Doctor"
            icon={<Users className="w-5 h-5" />}
            color="bg-emerald-600"
          />
          <QueueSection
            title="Billing Queue"
            queueType="Billing"
            icon={<Activity className="w-5 h-5" />}
            color="bg-slate-600"
          />
          <QueueSection
            title="Pharmacy Queue"
            queueType="Pharmacy"
            icon={<Activity className="w-5 h-5" />}
            color="bg-amber-600"
          />
        </div>

      {/* Transfer Dialog */}
      {transferDialogOpen && selectedQueue && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Transfer Patient to Another Queue</h3>
            <p className="text-sm text-slate-600 mb-4">
              Transfer <span className="font-medium text-slate-900">{selectedQueue.patientName}</span> (
              {selectedQueue.tokenNumber}) from <span className="font-medium text-slate-900">{selectedQueue.queueType}</span> to:
            </p>
            <select
              value={transferToQueue}
              onChange={(e) => setTransferToQueue(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Optometry">Optometry</option>
              <option value="Doctor">Doctor</option>
              <option value="Billing">Billing</option>
              <option value="Pharmacy">Pharmacy</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTransferDialogOpen(false);
                  setSelectedQueue(null);
                }}
                className="flex-1 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferQueue}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
