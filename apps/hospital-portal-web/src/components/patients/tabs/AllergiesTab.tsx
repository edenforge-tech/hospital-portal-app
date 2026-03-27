'use client';

import React, { useState, useEffect } from 'react';
import { AlertOctagon, Trash2 } from 'lucide-react';
import { patientAllergiesApi, PatientAllergy } from '@/lib/api/patient-allergies.api';

interface AllergiesTabProps {
  patientId: string;
}

export function AllergiesTab({ patientId }: AllergiesTabProps) {
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('Failed to load allergies. The backend may not have data yet.');
      setAllergies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this allergy record?')) return;
    try {
      await patientAllergiesApi.delete(id);
      setAllergies(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting allergy:', err);
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
    life_threatening: 'Critical', severe: 'High', moderate: 'Moderate', mild: 'Low'
  };
  const severityColors: Record<string, { bg: string; border: string; text: string }> = {
    Critical: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900' },
    High: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900' },
    Moderate: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900' },
    Low: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900' }
  };

  const displayAllergies = allergies.map(a => ({
    ...a,
    displaySeverity: severityMap[a.severity] || a.severity || 'Low'
  }));
  const criticalAllergies = displayAllergies.filter(a => a.displaySeverity === 'Critical');

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
            <AlertOctagon className="w-6 h-6" />
            CRITICAL ALLERGIES - IMMEDIATE ATTENTION REQUIRED
          </h4>
          <div className="space-y-2">
            {criticalAllergies.map(a => (
              <div key={a.id} className="bg-white p-3 rounded border-l-4 border-red-600">
                <p className="font-bold text-red-900">{a.allergenName} ({a.allergenType})</p>
                <p className="text-sm text-red-700">Reaction: {a.reaction || 'Not specified'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Allergies ({allergies.length})</h3>
        {['Critical', 'High', 'Moderate', 'Low'].map(level => {
          const items = displayAllergies.filter(a => a.displaySeverity === level);
          if (items.length === 0) return null;
          const c = severityColors[level];
          return (
            <div key={level} className="space-y-3">
              <h4 className="font-medium text-gray-700">{level} Severity</h4>
              {items.map(allergy => (
                <div key={allergy.id} className={`${c.bg} border-2 ${c.border} rounded-lg p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className={`font-bold ${c.text} text-lg`}>{allergy.allergenName}</h5>
                      <p className="text-sm text-gray-600">{allergy.allergenType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 ${c.bg} ${c.text} border ${c.border} rounded-full text-xs font-bold`}>{level}</span>
                      <button onClick={() => handleDelete(allergy.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {allergy.reaction && <p><strong>Reaction:</strong> {allergy.reaction}</p>}
                    {allergy.onsetDate && <p><strong>Onset:</strong> {new Date(allergy.onsetDate).toLocaleDateString()}</p>}
                    <p><strong>Verified:</strong> {allergy.verified ? 'Yes' : 'No'}{allergy.verifiedBy ? ` by ${allergy.verifiedBy}` : ''}</p>
                    {allergy.notes && <p className="mt-2 p-2 bg-white/50 rounded border"><strong>Notes:</strong> {allergy.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {allergies.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Allergy History</h3>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allergen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allergies.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.allergenName}</td>
                    <td className="px-4 py-3 text-gray-600">{a.allergenType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        a.severity === 'life_threatening' ? 'bg-red-100 text-red-800' :
                        a.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                        a.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>{severityMap[a.severity] || a.severity}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.reaction || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        a.status === 'active' ? 'bg-green-100 text-green-800' : a.status === 'resolved' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {allergies.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <AlertOctagon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No allergies recorded for this patient.</p>
        </div>
      )}
    </div>
  );
}
