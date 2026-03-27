'use client';

import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { prescriptionsApi } from '@/lib/api';

interface PharmacyTabProps {
  patientId: string;
}

export function PharmacyTab({ patientId }: PharmacyTabProps) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrescriptions();
  }, [patientId]);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await prescriptionsApi.getByPatient(patientId);
      setPrescriptions(response.data || []);
    } catch (err: any) {
      console.error('Error loading prescriptions:', err);
      setError('Failed to load pharmacy data.');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading pharmacy data...</span>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    dispensed: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const activeMeds = prescriptions.filter(p => p.status === 'active' || p.status === 'pending');
  const dispensedMeds = prescriptions.filter(p => p.status === 'dispensed');
  const completedMeds = prescriptions.filter(p => p.status === 'completed' || p.status === 'cancelled');

  const MedCard = ({ rx }: { rx: any }) => (
    <div className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Pill className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{rx.medicationName || rx.medication || 'Unknown Medication'}</h4>
            <p className="text-sm text-gray-500">
              {rx.dosage && <span>{rx.dosage}</span>}
              {rx.frequency && <span> | {rx.frequency}</span>}
              {rx.route && <span> | {rx.route}</span>}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[rx.status] || 'bg-gray-100 text-gray-800'}`}>
          {rx.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        {rx.prescribedDate && <span>Prescribed: {new Date(rx.prescribedDate).toLocaleDateString()}</span>}
        {rx.prescribedBy && <span>By: {rx.prescribedBy}</span>}
        {rx.dispensedDate && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Dispensed: {new Date(rx.dispensedDate).toLocaleDateString()}</span>}
        {rx.quantity && <span>Qty: {rx.quantity}{rx.refillsRemaining != null ? ` | Refills: ${rx.refillsRemaining}` : ''}</span>}
      </div>
      {rx.instructions && <p className="mt-2 text-sm text-gray-600 italic">{rx.instructions}</p>}
      {rx.notes && <p className="mt-1 text-sm text-gray-500">{rx.notes}</p>}
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{activeMeds.length}</p>
          <p className="text-sm text-green-600">Active</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{dispensedMeds.length}</p>
          <p className="text-sm text-blue-600">Dispensed</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{prescriptions.length}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
      </div>

      {activeMeds.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-green-600" /> Current Medications
          </h3>
          <div className="space-y-3">{activeMeds.map(rx => <MedCard key={rx.id} rx={rx} />)}</div>
        </div>
      )}

      {dispensedMeds.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recently Dispensed</h3>
          <div className="space-y-3">{dispensedMeds.map(rx => <MedCard key={rx.id} rx={rx} />)}</div>
        </div>
      )}

      {completedMeds.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Completed / Cancelled</h3>
          <div className="space-y-3">{completedMeds.map(rx => <MedCard key={rx.id} rx={rx} />)}</div>
        </div>
      )}

      {prescriptions.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pharmacy records found for this patient.</p>
        </div>
      )}
    </div>
  );
}
