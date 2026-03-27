'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { surgicalHistoryApi, type SurgicalHistory } from '@/lib/api/surgical-history.api';

interface SurgicalHistorySectionProps {
  patientId: string;
  canEdit?: boolean;
}

export function SurgicalHistorySection({ patientId, canEdit = true }: SurgicalHistorySectionProps) {
  const [surgeries, setSurgeries] = useState<SurgicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadSurgeries();
  }, [patientId]);

  const loadSurgeries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await surgicalHistoryApi.getByPatient(patientId);
      setSurgeries(response.data || []);
    } catch (err: any) {
      console.error('Error loading surgical history:', err);
      if (err?.response?.status !== 404) {
        setError('Failed to load surgical history. Backend may not be configured.');
      }
      setSurgeries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this surgery record?')) return;
    try {
      await surgicalHistoryApi.delete(id);
      setSurgeries((prev) => prev.filter((s) => s.id !== id));
      toast.success('Surgery record removed');
    } catch (err) {
      console.error('Error deleting surgery:', err);
      toast.error('Failed to remove surgery record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading surgical history...</span>
      </div>
    );
  }

  const outcomeColors: Record<string, { bg: string; border: string; text: string }> = {
    successful: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900' },
    complications: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900' },
    failed: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900' },
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
          Past Surgeries ({surgeries.length})
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Surgery
          </button>
        )}
      </div>

      {surgeries.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No surgical history recorded</p>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add first surgery
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {surgeries.map((surgery) => {
          const colors = outcomeColors[surgery.outcome || ''] || {
            bg: 'bg-purple-50',
            border: 'border-purple-300',
            text: 'text-purple-900',
          };

          return (
            <div key={surgery.id} className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className={`font-bold ${colors.text} text-lg`}>{surgery.procedureName}</h5>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    {surgery.surgeryDate && (
                      <p>
                        <strong>Date:</strong> {new Date(surgery.surgeryDate).toLocaleDateString()}
                      </p>
                    )}
                    {surgery.surgeon && (
                      <p>
                        <strong>Surgeon:</strong> {surgery.surgeon}
                      </p>
                    )}
                    {surgery.hospital && (
                      <p>
                        <strong>Hospital:</strong> {surgery.hospital}
                      </p>
                    )}
                    {surgery.outcome && (
                      <p>
                        <strong>Outcome:</strong>{' '}
                        <span className="capitalize">{surgery.outcome}</span>
                      </p>
                    )}
                    {surgery.complications && (
                      <p className="text-orange-700">
                        <strong>Complications:</strong> {surgery.complications}
                      </p>
                    )}
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(surgery.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {surgery.notes && (
                <div className="mt-2 p-2 bg-white/50 rounded border text-sm">
                  <strong>Notes:</strong> {surgery.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Surgical History</h3>
            <p className="text-sm text-gray-600 mb-4">
              This feature requires backend API implementation. Please configure the surgical-history endpoint.
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
