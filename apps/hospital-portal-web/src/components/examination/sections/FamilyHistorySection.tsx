'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { familyHistoryApi, type FamilyHistory } from '@/lib/api/family-history.api';

interface FamilyHistorySectionProps {
  patientId: string;
  canEdit?: boolean;
}

export function FamilyHistorySection({ patientId, canEdit = true }: FamilyHistorySectionProps) {
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadFamilyHistory();
  }, [patientId]);

  const loadFamilyHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await familyHistoryApi.getByPatient(patientId);
      setFamilyHistory(response.data || []);
    } catch (err: any) {
      console.error('Error loading family history:', err);
      if (err?.response?.status !== 404) {
        setError('Failed to load family history. Backend may not be configured.');
      }
      setFamilyHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this family history record?')) return;
    try {
      await familyHistoryApi.delete(id);
      setFamilyHistory((prev) => prev.filter((f) => f.id !== id));
      toast.success('Family history record removed');
    } catch (err) {
      console.error('Error deleting family history:', err);
      toast.error('Failed to remove family history record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading family history...</span>
      </div>
    );
  }

  const relationColors: Record<string, string> = {
    father: 'bg-blue-100 text-blue-800 border-blue-300',
    mother: 'bg-pink-100 text-pink-800 border-pink-300',
    sibling: 'bg-purple-100 text-purple-800 border-purple-300',
    grandparent: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Family Medical History ({familyHistory.length})
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Family History
          </button>
        )}
      </div>

      {familyHistory.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No family history recorded</p>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add first family history
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {familyHistory.map((item) => {
          const relationClass = relationColors[item.relation?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';

          return (
            <div key={item.id} className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${relationClass} capitalize`}
                    >
                      {item.relation}
                    </span>
                    {item.isDeceased && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                        Deceased
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-slate-900 text-base">{item.condition}</h5>
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                {item.ageAtDiagnosis && (
                  <p>
                    <strong>Age at diagnosis:</strong> {item.ageAtDiagnosis} years
                  </p>
                )}
                {item.notes && (
                  <div className="mt-2 p-2 bg-white/50 rounded border text-sm">
                    <strong>Notes:</strong> {item.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Family History</h3>
            <p className="text-sm text-gray-600 mb-4">
              This feature requires backend API implementation. Please configure the family-history endpoint.
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
