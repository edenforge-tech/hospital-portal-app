'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { emergencyAccessApi, EmergencyAccess, RequestEmergencyAccessDto } from '@/lib/api/emergency-access.api';
import { AlertTriangle, Clock, CheckCircle, XCircle, Shield, Lock } from 'lucide-react';

export default function EmergencyAccessPage() {
  const { user } = useAuthStore();
  const [myRequests, setMyRequests] = useState<EmergencyAccess[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<EmergencyAccess[]>([]);
  const [activeAccess, setActiveAccess] = useState<EmergencyAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  const [formData, setFormData] = useState<RequestEmergencyAccessDto>({
    reason: '',
    emergencyType: 'Medical',
    patientId: undefined,
    durationMinutes: 60,
    grantedPermissions: ['patient.view', 'patient.edit'],
    scope: 'Limited'
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsRes, approvalsRes, activeRes] = await Promise.all([
        emergencyAccessApi.getMyRequests(),
        emergencyAccessApi.getPendingApprovals().catch(() => ({ data: [] })), // May fail if not approver
        emergencyAccessApi.getActive()
      ]);

      setMyRequests(requestsRes.data || []);
      setPendingApprovals(approvalsRes.data || []);
      setActiveAccess(activeRes.data || []);
    } catch (err: any) {
      console.error('Error loading emergency access data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      setError('Reason is required');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await emergencyAccessApi.request(formData);
      setSuccess('Emergency access requested successfully');
      setShowRequestForm(false);
      setFormData({
        reason: '',
        emergencyType: 'Medical',
        patientId: undefined,
        durationMinutes: 60,
        grantedPermissions: ['patient.view', 'patient.edit'],
        scope: 'Limited'
      });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request emergency access');
    }
  };

  const handleApprove = async (id: string) => {
    const notes = prompt('Enter approval notes (optional):');
    
    try {
      setError(null);
      setSuccess(null);
      await emergencyAccessApi.approve(id, { notes: notes || undefined });
      setSuccess('Emergency access approved successfully');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve emergency access');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      setError(null);
      setSuccess(null);
      await emergencyAccessApi.reject(id, { reason });
      setSuccess('Emergency access rejected successfully');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject emergency access');
    }
  };

  const handleRevoke = async (id: string) => {
    const reason = prompt('Enter revocation reason:');
    if (!reason) return;

    try {
      setError(null);
      setSuccess(null);
      await emergencyAccessApi.revoke(id, reason);
      setSuccess('Emergency access revoked successfully');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke emergency access');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
      revoked: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected':
      case 'revoked':
        return <XCircle className="text-red-600" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      default:
        return <AlertTriangle className="text-gray-600" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Shield size={32} className="text-red-600" />
            <span>Emergency Access</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Request and manage emergency access to protected resources
          </p>
        </div>
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center space-x-2"
        >
          <AlertTriangle size={18} />
          <span>Request Emergency Access</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Request Form */}
      {showRequestForm && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Emergency Access</h2>
          <form onSubmit={handleRequestAccess} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Type
              </label>
              <select
                value={formData.emergencyType}
                onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Medical">Medical Emergency</option>
                <option value="LifeThreatening">Life-Threatening</option>
                <option value="Critical">Critical Care</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Request <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                placeholder="Describe the emergency situation and why access is needed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                  min="15"
                  max="240"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Scope
                </label>
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Limited">Limited</option>
                  <option value="Full">Full</option>
                  <option value="Specific">Specific</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Access */}
      {activeAccess.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Lock className="text-blue-600" size={20} />
            <span>Active Emergency Access</span>
          </h2>
          <div className="grid gap-4">
            {activeAccess.map((access) => (
              <div key={access.id} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{access.emergencyType}</h3>
                    <p className="text-sm text-gray-600 mt-1">{access.reason}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(access.status)}`}>
                    {access.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Code:</span> {access.accessCode || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Scope:</span> {access.scope}
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span> {new Date(access.endTime).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {access.durationMinutes} minutes
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(access.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Approvals (if user is approver) */}
      {pendingApprovals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h2>
          <div className="space-y-4">
            {pendingApprovals.map((access) => (
              <div key={access.id} className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{access.emergencyType}</h3>
                    <p className="text-sm text-gray-600 mt-1">{access.reason}</p>
                  </div>
                  {getStatusIcon(access.status)}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Requested:</span> {new Date(access.startTime).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {access.durationMinutes} minutes
                  </div>
                  <div>
                    <span className="font-medium">Scope:</span> {access.scope}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(access.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(access.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Requests */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Requests</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myRequests.map((access) => (
                <tr key={access.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{access.emergencyType}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{access.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(access.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {access.durationMinutes} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(access.status)}`}>
                      {access.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
