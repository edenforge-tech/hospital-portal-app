'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientMedicationsApi, type PatientMedication } from '@/lib/api/patient-medications.api';

interface MedicationsSectionProps {
  patientId: string;
  canEdit?: boolean;
}

export function MedicationsSection({ patientId, canEdit = true }: MedicationsSectionProps) {
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadMedications();
  }, [patientId]);

  const loadMedications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientMedicationsApi.getByPatient(patientId);
      setMedications(response.data || []);
    } catch (err: any) {
      console.error('Error loading medications:', err);
      if (err?.response?.status !== 404) {
        setError('Failed to load medications. Backend may not be configured.');
      }
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this medication record?')) return;
    try {
      await patientMedicationsApi.delete(id);
      setMedications((prev) => prev.filter((m) => m.id !== id));
      toast.success('Medication removed');
    } catch (err) {
      console.error('Error deleting medication:', err);
      toast.error('Failed to remove medication');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading medications...</span>
      </div>
    );
  }

  const activeMedications = medications.filter((m) => m.status === 'active' || !m.status);
  const completedMedications = medications.filter((m) => m.status === 'completed');
  const discontinuedMedications = medications.filter((m) => m.status === 'discontinued');

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Current Medications ({activeMedications.length})
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        )}
      </div>

      {medications.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No medications recorded</p>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add first medication
            </button>
          )}
        </div>
      )}

      {activeMedications.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Active Medications</h4>
          {activeMedications.map((medication) => (
            <div
              key={medication.id}
              className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-bold text-emerald-900 text-lg">{medication.medicationName}</h5>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    {medication.dosage && (
                      <p>
                        <strong>Dosage:</strong> {medication.dosage}
                      </p>
                    )}
                    {medication.frequency && (
                      <p>
                        <strong>Frequency:</strong> {medication.frequency}
                      </p>
                    )}
                    {medication.route && (
                      <p>
                        <strong>Route:</strong> {medication.route}
                      </p>
                    )}
                    {medication.startDate && (
                      <p>
                        <strong>Started:</strong> {new Date(medication.startDate).toLocaleDateString()}
                      </p>
                    )}
                    {medication.prescribedBy && (
                      <p>
                        <strong>Prescribed by:</strong> {medication.prescribedBy}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold">
                    ACTIVE
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(medication.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {medication.notes && (
                <div className="mt-2 p-2 bg-white/50 rounded border text-sm">
                  <strong>Notes:</strong> {medication.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {completedMedications.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Completed Medications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completedMedications.map((medication) => (
              <div key={medication.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-green-900">{medication.medicationName}</p>
                    {medication.dosage && (
                      <p className="text-xs text-green-700 mt-1">{medication.dosage}</p>
                    )}
                    {medication.endDate && (
                      <p className="text-xs text-gray-600 mt-1">
                        Ended: {new Date(medication.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(medication.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {discontinuedMedications.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Discontinued Medications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {discontinuedMedications.map((medication) => (
              <div key={medication.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-700">{medication.medicationName}</p>
                    {medication.dosage && (
                      <p className="text-xs text-gray-600 mt-1">{medication.dosage}</p>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(medication.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Medication</h3>
            <p className="text-sm text-gray-600 mb-4">
              This feature requires backend API implementation. Please configure the patient-medications endpoint.
            </p>
            <button
              onClick={() => setShowAddForm(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
