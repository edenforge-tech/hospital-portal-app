'use client';

import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { surgeryRequestsApi, SurgeryRequest } from '@/lib/api/surgery-requests.api';

interface SurgeryTabProps {
  patientId: string;
  patientName?: string;
}

export function SurgeryTab({ patientId, patientName }: SurgeryTabProps) {
  const [surgeries, setSurgeries] = useState<SurgeryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSurgeries();
  }, [patientId, patientName]);

  const loadSurgeries = async () => {
    setLoading(true);
    setError(null);
    try {
      // SurgeryRequest uses patientName, not patientId
      if (patientName) {
        const response = await surgeryRequestsApi.getByPatientName(patientName);
        setSurgeries(response.data || []);
      } else {
        setSurgeries([]);
      }
    } catch (err: any) {
      console.error('Error loading surgery requests:', err);
      setError('Failed to load surgery requests.');
      setSurgeries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading surgery requests...</span>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const urgencyColors: Record<string, string> = {
    routine: 'text-gray-600',
    urgent: 'text-orange-600',
    emergency: 'text-red-600 font-bold',
  };

  const upcoming = surgeries.filter(s => s.status === 'approved' || s.status === 'pending');
  const completed = surgeries.filter(s => s.status === 'completed');
  const other = surgeries.filter(s => s.status === 'rejected' || s.status === 'cancelled');

  const SurgeryCard = ({ surgery }: { surgery: SurgeryRequest }) => (
    <div className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${surgery.urgency === 'emergency' ? 'bg-red-50' : 'bg-indigo-50'}`}>
            <Stethoscope className={`w-5 h-5 ${surgery.urgency === 'emergency' ? 'text-red-600' : 'text-indigo-600'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{surgery.procedureType}</h4>
            <p className={`text-sm ${urgencyColors[surgery.urgency] || 'text-gray-600'}`}>
              {surgery.urgency.charAt(0).toUpperCase() + surgery.urgency.slice(1)} | {surgery.requestType}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[surgery.status] || 'bg-gray-100 text-gray-800'}`}>
          {surgery.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Requested: {new Date(surgery.requestDate).toLocaleDateString()}</span>
        </div>
        {surgery.scheduledDate && (
          <div className="flex items-center gap-2 text-gray-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Scheduled: {new Date(surgery.scheduledDate).toLocaleDateString()}</span>
          </div>
        )}
        {surgery.preferredDate && !surgery.scheduledDate && (
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Preferred: {new Date(surgery.preferredDate).toLocaleDateString()}{surgery.preferredTime ? ` ${surgery.preferredTime}` : ''}</span>
          </div>
        )}
      </div>

      {surgery.notes && <p className="mt-2 text-sm text-gray-600">{surgery.notes}</p>}
      {surgery.specialInstructions && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <strong className="text-yellow-800">Special Instructions:</strong> {surgery.specialInstructions}
        </div>
      )}
      {surgery.surgeonResponse && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <strong className="text-blue-800">Surgeon Response:</strong> {surgery.surgeonResponse}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{upcoming.length}</p>
          <p className="text-sm text-yellow-600">Upcoming</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{completed.length}</p>
          <p className="text-sm text-green-600">Completed</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{surgeries.length}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Surgeries</h3>
          <div className="space-y-3">{upcoming.map(s => <SurgeryCard key={s.id} surgery={s} />)}</div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Completed Surgeries</h3>
          <div className="space-y-3">{completed.map(s => <SurgeryCard key={s.id} surgery={s} />)}</div>
        </div>
      )}

      {other.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancelled / Rejected</h3>
          <div className="space-y-3">{other.map(s => <SurgeryCard key={s.id} surgery={s} />)}</div>
        </div>
      )}

      {surgeries.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No surgery requests found for this patient.</p>
        </div>
      )}
    </div>
  );
}
