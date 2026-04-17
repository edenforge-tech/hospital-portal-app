'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, X, XCircle, FileText, AlertCircle } from 'lucide-react';
import { departmentAccessApprovalApi, DepartmentAccessRequest } from '@/lib/api/department-access-approval.api';
import { useConfirmation } from '@/components/common/ConfirmationDialog';

const STATUS_CONFIG = {
  Pending: {
    color: 'yellow',
    icon: Clock,
    label: 'Pending',
  },
  Approved: {
    color: 'green',
    icon: CheckCircle,
    label: 'Approved',
  },
  Rejected: {
    color: 'red',
    icon: XCircle,
    label: 'Rejected',
  },
  Cancelled: {
    color: 'gray',
    icon: X,
    label: 'Cancelled',
  },
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<DepartmentAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { showConfirmation, ConfirmationComponent } = useConfirmation();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentAccessApprovalApi.getMyRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId: string, requestNumber: string) => {
    showConfirmation({
      title: 'Cancel Request',
      message: `Cancel request ${requestNumber}? This action cannot be undone.`,
      variant: 'warning',
      confirmText: 'Cancel Request',
      onConfirm: async () => {
        setCancelling(requestId);
        setError('');
        setSuccess('');
        try {
          const result = await departmentAccessApprovalApi.cancelRequest(requestId);
          setSuccess(result.message);
          await fetchRequests();
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to cancel request');
        } finally {
          setCancelling(null);
        }
      },
    });
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto animate-spin" />
            <p className="mt-4 text-gray-600">Loading your requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ConfirmationComponent />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-600" />
            My Access Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Track the status of your department access requests
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

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                filterStatus === status
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 text-sm">
                ({status === 'all' ? requests.length : requests.filter(r => r.status.toLowerCase() === status).length})
              </span>
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? "You haven't submitted any access requests yet." 
                : `You have no ${filterStatus} requests.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const statusConfig = STATUS_CONFIG[request.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={request.requestId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    {/* Request Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {request.departmentName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 bg-${statusConfig.color}-100 text-${statusConfig.color}-800 text-sm font-medium rounded-full`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {statusConfig.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {request.requestNumber}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Department Code</p>
                          <p className="font-medium text-gray-900">{request.departmentCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Access Type</p>
                          <p className="font-medium text-gray-900">{request.requestedAccessType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Requested On</p>
                          <p className="font-medium text-gray-900">
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {request.reviewedAt && (
                          <div>
                            <p className="text-sm text-gray-600">Reviewed On</p>
                            <p className="font-medium text-gray-900">
                              {new Date(request.reviewedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

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

                      {/* Review Notes/Rejection Reason */}
                      {request.status === 'Approved' && request.reviewNotes && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">Approval Notes</span>
                          </div>
                          <p className="text-green-900">{request.reviewNotes}</p>
                          {request.reviewedByName && (
                            <p className="text-sm text-green-700 mt-2">
                              Approved by: {request.reviewedByName}
                            </p>
                          )}
                        </div>
                      )}

                      {request.status === 'Rejected' && request.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-red-800">Rejection Reason</span>
                          </div>
                          <p className="text-red-900">{request.rejectionReason}</p>
                          {request.reviewedByName && (
                            <p className="text-sm text-red-700 mt-2">
                              Rejected by: {request.reviewedByName}
                            </p>
                          )}
                        </div>
                      )}

                      {request.autoApproved && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                          <span className="text-sm text-blue-800 font-medium">
                            Auto-approved (no approval required)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Cancel Button (only for pending requests) */}
                    {request.status === 'Pending' && (
                      <div className="ml-6">
                        <button
                          onClick={() => handleCancel(request.requestId, request.requestNumber)}
                          disabled={cancelling === request.requestId}
                          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="h-5 w-5" />
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
