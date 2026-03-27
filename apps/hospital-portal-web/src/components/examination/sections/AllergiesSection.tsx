'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientAllergiesApi, type PatientAllergy } from '@/lib/api/patient-allergies.api';

interface AllergiesSectionProps {
  patientId: string;
  canEdit?: boolean;
}

export function AllergiesSection({ patientId, canEdit = true }: AllergiesSectionProps) {
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAllergies();
  }, [patientId]);

  const loadAllergies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientAllergiesApi.getByPatient(patientId);
      setAllergies(response.data || []);
    } catch (err: any) {
      console.error('Error loading allergies:', err);
      if (err?.response?.status !== 404) {
        setError('Failed to load allergies. Backend may not be configured.');
      }
      setAllergies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this allergy record?')) return;
    try {
      await patientAllergiesApi.delete(id);
      setAllergies((prev) => prev.filter((a) => a.id !== id));
      toast.success('Allergy removed');
    } catch (err) {
      console.error('Error deleting allergy:', err);
      toast.error('Failed to remove allergy');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading allergies...</span>
      </div>
    );
  }

  const severityMap: Record<string, string> = {
    life_threatening: 'Critical',
    severe: 'High',
    moderate: 'Moderate',
    mild: 'Low',
  };

  const severityColors: Record<string, { bg: string; border: string; text: string }> = {
    Critical: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900' },
    High: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900' },
    Moderate: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900' },
    Low: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900' },
  };

  const displayAllergies = allergies.map((a) => ({
    ...a,
    displaySeverity: severityMap[a.severity] || a.severity || 'Low',
  }));

  const criticalAllergies = displayAllergies.filter((a) => a.displaySeverity === 'Critical');

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {criticalAllergies.length > 0 && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4">
          <h4 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            CRITICAL ALLERGIES - IMMEDIATE ATTENTION REQUIRED
          </h4>
          <div className="space-y-2">
            {criticalAllergies.map((a) => (
              <div key={a.id} className="bg-white p-3 rounded border-l-4 border-red-600">
                <p className="font-bold text-red-900">
                  {a.allergenName} ({a.allergenType})
                </p>
                <p className="text-sm text-red-700">Reaction: {a.reaction || 'Not specified'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Current Allergies ({allergies.length})</h3>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Allergy
          </button>
        )}
      </div>

      {allergies.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No allergies recorded</p>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add first allergy
            </button>
          )}
        </div>
      )}

      {['Critical', 'High', 'Moderate', 'Low'].map((level) => {
        const items = displayAllergies.filter((a) => a.displaySeverity === level);
        if (items.length === 0) return null;
        const c = severityColors[level];

        return (
          <div key={level} className="space-y-3">
            <h4 className="font-medium text-gray-700">{level} Severity</h4>
            {items.map((allergy) => (
              <div key={allergy.id} className={`${c.bg} border-2 ${c.border} rounded-lg p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className={`font-bold ${c.text} text-lg`}>{allergy.allergenName}</h5>
                    <p className="text-sm text-gray-600">{allergy.allergenType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 ${c.bg} ${c.text} border ${c.border} rounded-full text-xs font-bold`}
                    >
                      {level}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => handleDelete(allergy.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {allergy.reaction && (
                    <p>
                      <strong>Reaction:</strong> {allergy.reaction}
                    </p>
                  )}
                  {allergy.onsetDate && (
                    <p>
                      <strong>Onset:</strong> {new Date(allergy.onsetDate).toLocaleDateString()}
                    </p>
                  )}
                  <p>
                    <strong>Verified:</strong> {allergy.verified ? 'Yes' : 'No'}
                    {allergy.verifiedBy ? ` by ${allergy.verifiedBy}` : ''}
                  </p>
                  {allergy.notes && (
                    <p className="mt-2 p-2 bg-white/50 rounded border">
                      <strong>Notes:</strong> {allergy.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Allergy</h3>
            <p className="text-sm text-gray-600 mb-4">
              This feature requires backend API implementation. Please configure the patient-allergies endpoint.
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
