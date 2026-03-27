'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Users, Clock, Stethoscope, Settings } from 'lucide-react';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';
import { getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface QueueToken {
  id: string;
  tokenNumber: string;
  roomNumber?: string;
  doctorName?: string;
  queueType: string;
  calledAt?: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
}

export default function QueueTVDisplayPage() {
  const [currentToken, setCurrentToken] = useState<QueueToken | null>(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [queueType, setQueueType] = useState('Doctor');
  const [showSettings, setShowSettings] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    fetchBranches();
    fetchDepartments();
  }, []);

  const fetchBranches = async () => {
    try {
      const api = getApi();
      const response = await api.get('/branches');
      console.log('[Queue TV] Branches API response:', response.data);
      
      // Handle various response formats - ensure we always get an array
      let branchList: Branch[] = [];
      if (Array.isArray(response.data)) {
        branchList = response.data;
      } else if (response.data?.branches && Array.isArray(response.data.branches)) {
        branchList = response.data.branches;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        branchList = response.data.items;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        branchList = response.data.data;
      }
      
      console.log('[Queue TV] Extracted branches:', branchList);
      setBranches(branchList);
      
      if (branchList.length > 0) {
        const userBranchId = user?.branchId || localStorage.getItem('currentBranchId');
        const defaultBranch = userBranchId && branchList.find((b: Branch) => b.id === userBranchId)
          ? userBranchId
          : branchList[0].id;
        console.log('[Queue TV] Setting branch:', defaultBranch, 'from branch:', branchList[0]);
        setSelectedBranch(defaultBranch);
        localStorage.setItem('currentBranchId', defaultBranch);
      } else {
        console.warn('[Queue TV] No branches found - response.data structure:', Object.keys(response.data || {}));
      }
    } catch (error) {
      console.error('[Queue TV] Error fetching branches:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const api = getApi();
      const response = await api.get('/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    if (!selectedBranch) {
      console.warn('[Queue TV] No branch selected, waiting...');
      return;
    }

    console.log('[Queue TV] Starting SignalR connection for branch:', selectedBranch);

    const token = localStorage.getItem('auth_token') || '';
    const tenantId = localStorage.getItem('tenant_id') || '';
    
    if (!tenantId) {
      console.error('[SignalR] Tenant ID not found in localStorage');
      return;
    }

    if (!token) {
      console.error('[SignalR] Auth token not found in localStorage');
      return;
    }

    console.log('[SignalR] Building connection with tenantId:', tenantId);

    const newConnection = new HubConnectionBuilder()
      .withUrl(`http://localhost:5073/hubs/queue?tenantId=${tenantId}`, {
        accessTokenFactory: () => token
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => {
        console.log('[SignalR] Connected to Queue Hub');
        console.log('[SignalR] Subscribing to queue:', {
          branchId: selectedBranch,
          departmentId: selectedDepartment || null,
          queueType
        });
        setIsConnected(true);
        return newConnection.invoke('SubscribeToQueue', selectedBranch, selectedDepartment || null, queueType);
      })
      .then(() => {
        console.log('[SignalR] Subscribed to queue updates successfully');
      })
      .catch(err => {
        console.error('[SignalR] Connection Error:', err);
        setIsConnected(false);
      });

    newConnection.on('TokenCalled', (data: QueueToken) => {
      console.log('[SignalR] Token called event received:', data);
      setCurrentToken(data);
      if (typeof window !== 'undefined') {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
    });

    newConnection.on('QueueUpdate', (data: any) => {
      console.log('[SignalR] Queue update event received:', data);
    });

    setConnection(newConnection);

    return () => {
      console.log('[SignalR] Disconnecting...');
      newConnection.stop();
    };
  }, [selectedBranch, selectedDepartment, queueType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      {showSettings && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-xl p-6 w-96 border-2 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Display Settings</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>×</Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Branch</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Department (Optional)</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Queue Type</label>
              <Select value={queueType} onValueChange={setQueueType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Lab">Lab</SelectItem>
                  <SelectItem value="Billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow z-40"
      >
        <Settings className="h-6 w-6 text-gray-600" />
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">Queue Display</h1>
        <p className="text-xl text-gray-600">Please wait for your token to be called</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          {isConnected ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Updates Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Connecting...
            </Badge>
          )}
          {selectedBranch && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              {branches.find(b => b.id === selectedBranch)?.name || 'Branch'} - {queueType}
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Card className="mb-8 bg-white shadow-2xl border-4 border-blue-500">
          <div className="p-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <Bell className="h-16 w-16 text-blue-600 animate-bounce" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Now Calling</h2>
            
            {currentToken ? (
              <div className="space-y-6">
                <div className="text-9xl font-bold text-blue-600 tracking-wider animate-pulse">
                  {currentToken.tokenNumber}
                </div>
                
                {currentToken.roomNumber && (
                  <div className="flex items-center justify-center gap-4 text-4xl">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-bold text-indigo-600">{currentToken.roomNumber}</span>
                  </div>
                )}
                
                {currentToken.doctorName && (
                  <div className="flex items-center justify-center gap-4 text-3xl">
                    <Stethoscope className="h-10 w-10 text-gray-500" />
                    <span className="text-gray-700">{currentToken.doctorName}</span>
                  </div>
                )}

                <div className="text-2xl text-gray-500 mt-4">
                  Called at {new Date(currentToken.calledAt || '').toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-6xl text-gray-400 py-12">
                Waiting for next patient...
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          <Card className="bg-white shadow-lg">
            <div className="p-6 text-center">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <div className="text-4xl font-bold text-gray-800">{waitingCount}</div>
              <div className="text-lg text-gray-600 mt-2">Waiting</div>
            </div>
          </Card>

          <Card className="bg-white shadow-lg">
            <div className="p-6 text-center">
              <Clock className="h-12 w-12 text-orange-500 mx-auto mb-3" />
              <div className="text-4xl font-bold text-gray-800">15</div>
              <div className="text-lg text-gray-600 mt-2">Avg Wait (min)</div>
            </div>
          </Card>

          <Card className="bg-white shadow-lg">
            <div className="p-6 text-center">
              <Stethoscope className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <div className="text-4xl font-bold text-gray-800">3</div>
              <div className="text-lg text-gray-600 mt-2">Doctors Available</div>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center text-gray-500 text-xl">
          <p>Thank you for your patience • Hospital Portal</p>
        </div>
      </div>
    </div>
  );
}
