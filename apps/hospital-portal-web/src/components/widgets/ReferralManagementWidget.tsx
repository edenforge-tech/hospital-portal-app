/**
 * Referral Management Widget
 * Create and track specialist referrals
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { Referral } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const ReferralManagementWidget: React.FC<WidgetProps> = ({ patientId, sessionId }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) loadReferrals();
  }, [patientId]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getReferralStatus(patientId!);
      setReferrals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      'pending': { icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      'scheduled': { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', label: 'Scheduled' },
      'completed': { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700', label: 'Completed' },
      'cancelled': { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700', label: 'Cancelled' },
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <h3 className="text-lg font-semibold flex items-center">
        <Users className="w-5 h-5 mr-2 text-blue-600" />
        Referrals
      </h3>

      {referrals.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No active referrals
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.map(referral => {
            const statusConfig = getStatusConfig(referral.status);
            
            return (
              <div key={referral.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{referral.specialty}</h4>
                    <p className="text-sm text-gray-600 mt-1">{referral.reason}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${statusConfig.color}`}>
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.label}</span>
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span>To: {referral.referredToDoctorName}</span>
                  {referral.referredToFacility && (
                    <span className="ml-2">• {referral.referredToFacility}</span>
                  )}
                </div>

                {referral.appointmentDate && (
                  <div className="flex items-center text-sm bg-blue-50 rounded px-3 py-2 mb-2">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Appointment: {new Date(referral.appointmentDate).toLocaleDateString()}</span>
                  </div>
                )}

                {referral.notes && (
                  <div className="text-xs text-gray-600 border-t pt-2 mt-2">
                    <strong>Notes:</strong> {referral.notes}
                  </div>
                )}

                <div className="flex space-x-2 mt-3">
                  {referral.status === 'pending' && (
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Schedule Appointment
                    </button>
                  )}
                  {referral.attachedDocuments && referral.attachedDocuments.length > 0 && (
                    <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      View Records ({referral.attachedDocuments.length})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button 
        onClick={() => window.location.href = `/counseling/${sessionId}/referral/create`}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        Create New Referral
      </button>
    </div>
  );
};

export default ReferralManagementWidget;
