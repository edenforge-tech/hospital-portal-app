'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, Clock, AlertCircle, FileText } from 'lucide-react';
import { departmentAccessApprovalApi, DepartmentAccessRequest } from '@/lib/api/department-access-approval.api';

export default function PendingApprovalsPage() {
  const [requests, setRequests] = useState<DepartmentAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentAccessApprovalApi.getPendingApprovals();
      setRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, requestNumber: string) => {
    const notes = prompt(`Approve request ${requestNumber}?\n\nOptional notes:`);
    if (notes === null) return; // User cancelled

    setProcessing(requestId);
    setError('');
    setSuccess('');
    try {
      const result = await departmentAccessApprovalApi.approveRequest(requestId, notes);
      setSuccess(result.message);
      await fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string, requestNumber: string) => {
    const reason = prompt(`Reject request ${requestNumber}?\n\nRejection reason (required):`);
    if (!reason) {
      alert('Rejection reason is required');
      return;
    }

    setProcessing(requestId);
    setError('');
    setSuccess('');
    try {
      const result = await departmentAccessApprovalApi.rejectRequest(requestId, reason);
      setSuccess(result.message);
      await fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto animate-spin" />
            <p className="mt-4 text-gray-600">Loading pending approvals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="h-8 w-8 text-indigo-600" />
            Pending Access Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Review and approve department access requests from your team
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending access requests at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Request Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.userName}
                      </h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                        Pending
                      </span>
                      <span className="text-sm text-gray-500">
                        {request.requestNumber}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-1">
                      <strong>Email:</strong> {request.userEmail}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Department:</strong> {request.departmentName} ({request.departmentCode})
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Access Type:</strong> {request.requestedAccessType}
                    </p>
                    <p className="text-gray-600 mb-3">
                      <strong>Requested:</strong> {new Date(request.createdAt).toLocaleString()}
                    </p>

                    {/* Justification */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-700">Justification</span>
                      </div>
                      <p className="text-gray-800">{request.justification}</p>
                    </div>

                    {/* Requested Permissions */}
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700 block mb-2">
                        Requested Permissions:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {request.requestedCanView && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            👁️ View
                          </span>
                        )}
                        {request.requestedCanCreate && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            ➕ Create
                          </span>
                        )}
                        {request.requestedCanEdit && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            ✏️ Edit
                          </span>
                        )}
                        {request.requestedCanDelete && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            🗑️ Delete
                          </span>
                        )}
                        {request.requestedCanApprove && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            ✅ Approve
                          </span>
                        )}
                        {request.requestedCanExport && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                            📥 Export
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleApprove(request.requestId, request.requestNumber)}
                      disabled={processing === request.requestId}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.requestId, request.requestNumber)}
                      disabled={processing === request.requestId}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-5 w-5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
