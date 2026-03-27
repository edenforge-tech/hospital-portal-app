'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, User } from 'lucide-react';

interface ReferralStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

interface Referral {
  id: string;
  patientName: string;
  referringDoctor: string;
  referredTo: string;
  specialty: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdDate: string;
  priority: 'routine' | 'urgent';
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      setStats({ pending: 4, approved: 12, rejected: 2, total: 18 });
      setReferrals([
        {
          id: '1',
          patientName: 'John Doe',
          referringDoctor: 'Dr. Sarah Johnson',
          referredTo: 'Dr. Michael Chen',
          specialty: 'Retinal Specialist',
          reason: 'Suspected diabetic retinopathy',
          status: 'pending',
          createdDate: '2026-01-22',
          priority: 'urgent'
        },
        {
          id: '2',
          patientName: 'Jane Smith',
          referringDoctor: 'Dr. Sarah Johnson',
          referredTo: 'External Glaucoma Center',
          specialty: 'Glaucoma',
          reason: 'Advanced glaucoma treatment',
          status: 'approved',
          createdDate: '2026-01-20',
          priority: 'routine'
        }
      ]);
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-red-500' },
    { title: 'Total', value: stats.total, icon: RefreshCw, color: 'bg-blue-500' }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return <div className="p-6"><div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading referrals...</div></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Referral Management</h1>
        <p className="text-gray-600 mt-1">Manage patient referrals and external consultations</p>
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
            <h2 className="text-xl font-semibold text-gray-900">Referrals</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              New Referral
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div key={referral.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{referral.patientName}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(referral.status)}`}>
                        {referral.status.toUpperCase()}
                      </span>
                      {referral.priority === 'urgent' && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">URGENT</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-500">From</p><p className="text-gray-900 font-medium">{referral.referringDoctor}</p></div>
                      <div><p className="text-gray-500">To</p><p className="text-gray-900 font-medium">{referral.referredTo}</p></div>
                      <div><p className="text-gray-500">Specialty</p><p className="text-gray-900 font-medium">{referral.specialty}</p></div>
                      <div><p className="text-gray-500">Date</p><p className="text-gray-900 font-medium">{new Date(referral.createdDate).toLocaleDateString()}</p></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2"><strong>Reason:</strong> {referral.reason}</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
