/**
 * Insurance Claim Tracking Widget
 * Real-time visibility into insurance claim status
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck, Clock, CheckCircle2, XCircle, AlertTriangle, Upload } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { InsuranceClaim } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const InsuranceClaimTrackingWidget: React.FC<WidgetProps> = ({ patientId }) => {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) loadClaims();
  }, [patientId]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getInsuranceClaimStatus(patientId!);
      setClaims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'submitted':
        return { icon: Clock, color: 'text-blue-600 bg-blue-100', label: 'Submitted' };
      case 'under-review':
        return { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Under Review' };
      case 'additional-info-required':
        return { icon: AlertTriangle, color: 'text-orange-600 bg-orange-100', label: 'Info Required' };
      case 'approved':
        return { icon: CheckCircle2, color: 'text-green-600 bg-green-100', label: 'Approved' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Rejected' };
      case 'settled':
        return { icon: CheckCircle2, color: 'text-green-600 bg-green-100', label: 'Settled' };
      default:
        return { icon: Clock, color: 'text-gray-600 bg-gray-100', label: status };
    }
  };

  const getStageProgress = (status: string) => {
    const stages = ['submitted', 'under-review', 'additional-info-required', 'approved', 'settled'];
    const currentIndex = stages.indexOf(status);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <h3 className="text-lg font-semibold flex items-center">
        <FileCheck className="w-5 h-5 mr-2 text-blue-600" />
        Insurance Claims
      </h3>

      {claims.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No insurance claims found
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => {
            const statusConfig = getStatusConfig(claim.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={claim.id} className="border rounded-lg p-4 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{claim.claimNumber}</h4>
                    <p className="text-sm text-gray-600">{claim.tpaName}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full flex items-center ${statusConfig.color}`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">{statusConfig.label}</span>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-gray-600">Claim Amount:</span>
                    <div className="font-semibold">₹{claim.claimAmount.toLocaleString()}</div>
                  </div>
                  {claim.approvedAmount && (
                    <div>
                      <span className="text-gray-600">Approved:</span>
                      <div className="font-semibold text-green-600">
                        ₹{claim.approvedAmount.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getStageProgress(claim.status)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex justify-between text-xs text-gray-600 mb-3">
                  <span>Submitted: {new Date(claim.submittedDate).toLocaleDateString()}</span>
                  <span>Updated: {new Date(claim.lastUpdatedDate).toLocaleDateString()}</span>
                </div>

                {/* Documents */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium">Documents</h5>
                    <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {claim.documents.map(doc => (
                      <div
                        key={doc.id}
                        className={`px-2 py-1 text-xs rounded flex items-center ${
                          doc.uploaded
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {doc.uploaded ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {doc.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejection Reason */}
                {claim.rejectionReason && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs font-medium text-red-800">Rejection Reason:</p>
                    <p className="text-xs text-red-700 mt-1">{claim.rejectionReason}</p>
                    <button className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium">
                      File Appeal
                    </button>
                  </div>
                )}

                {/* Expected Settlement */}
                {claim.expectedSettlementDate && claim.status === 'approved' && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-700">
                      Expected settlement: {new Date(claim.expectedSettlementDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
        Submit New Claim
      </button>
    </div>
  );
};

export default InsuranceClaimTrackingWidget;
