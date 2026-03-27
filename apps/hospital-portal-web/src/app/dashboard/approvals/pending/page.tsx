'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, FileText } from 'lucide-react';
import { approvalsApi, AccessRequest } from '@/lib/api/approvals.api';

export default function PendingApprovalsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await approvalsApi.getPendingApprovals();
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
      alert('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    const comments = prompt('Add approval comments (optional):');
    
    try {
      await approvalsApi.approve(requestId, comments || undefined);
      alert('Request approved successfully!');
      loadRequests();
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Enter rejection reason (required):');
    if (!reason) return;
    
    try {
      await approvalsApi.reject(requestId, reason);
      alert('Request rejected!');
      loadRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject request');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve department access requests</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No pending approval requests</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Justification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map(request => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{request.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {request.departmentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {request.requestedAccessLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-md">{request.justification}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-900"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-900"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
