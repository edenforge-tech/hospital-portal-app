'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Lock, Unlock, Clock, Shield } from 'lucide-react';

interface EmergencyStats {
  activeAccess: number;
  totalThisMonth: number;
  pendingReviews: number;
  averageDuration: string;
}

interface EmergencyAccess {
  id: string;
  userId: string;
  userName: string;
  patientId: string;
  patientName: string;
  reason: string;
  status: 'active' | 'expired' | 'revoked';
  grantedAt: string;
  expiresAt: string;
  duration: string;
}

export default function EmergencyPage() {
  const [stats, setStats] = useState<EmergencyStats>({
    activeAccess: 0,
    totalThisMonth: 0,
    pendingReviews: 0,
    averageDuration: '0m'
  });
  const [accesses, setAccesses] = useState<EmergencyAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    try {
      setStats({
        activeAccess: 2,
        totalThisMonth: 8,
        pendingReviews: 3,
        averageDuration: '45m'
      });

      setAccesses([
        {
          id: '1',
          userId: 'user-1',
          userName: 'Dr. Sarah Johnson',
          patientId: 'patient-1',
          patientName: 'Emergency Case #2401',
          reason: 'Critical eye injury - immediate consultation required',
          status: 'active',
          grantedAt: '2026-01-24T14:30:00',
          expiresAt: '2026-01-24T16:30:00',
          duration: '2 hours'
        },
        {
          id: '2',
          userId: 'user-2',
          userName: 'Dr. Michael Chen',
          patientId: 'patient-2',
          patientName: 'Emergency Case #2402',
          reason: 'Acute vision loss - emergency evaluation',
          status: 'expired',
          grantedAt: '2026-01-23T10:00:00',
          expiresAt: '2026-01-23T11:00:00',
          duration: '1 hour'
        }
      ]);
    } catch (error) {
      console.error('Failed to load emergency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Active Access', value: stats.activeAccess, icon: Unlock, color: 'bg-red-500' },
    { title: 'Total This Month', value: stats.totalThisMonth, icon: Shield, color: 'bg-blue-500' },
    { title: 'Pending Reviews', value: stats.pendingReviews, icon: AlertTriangle, color: 'bg-orange-500' },
    { title: 'Avg Duration', value: stats.averageDuration, icon: Clock, color: 'bg-purple-500' }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      revoked: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || styles.expired;
  };

  if (loading) {
    return <div className="p-6"><div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading emergency access data...</div></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Emergency Access (Break-Glass)</h1>
        <p className="text-gray-600 mt-1">Monitor emergency access to protected patient data</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Emergency Access Warning</p>
            <p className="text-sm text-red-700">
              All emergency access requests are logged and audited. Use only in genuine emergencies.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Access Log</h2>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Request Emergency Access
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {accesses.map((access) => (
              <div key={access.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{access.userName}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(access.status)}`}>
                        {access.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div><p className="text-gray-500">Patient</p><p className="text-gray-900 font-medium">{access.patientName}</p></div>
                      <div><p className="text-gray-500">Duration</p><p className="text-gray-900 font-medium">{access.duration}</p></div>
                      <div><p className="text-gray-500">Granted</p><p className="text-gray-900 font-medium">{new Date(access.grantedAt).toLocaleString()}</p></div>
                      <div><p className="text-gray-500">Expires</p><p className="text-gray-900 font-medium">{new Date(access.expiresAt).toLocaleString()}</p></div>
                    </div>
                    <p className="text-sm text-gray-600"><strong>Reason:</strong> {access.reason}</p>
                  </div>
                  {access.status === 'active' && (
                    <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Revoke Access</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
