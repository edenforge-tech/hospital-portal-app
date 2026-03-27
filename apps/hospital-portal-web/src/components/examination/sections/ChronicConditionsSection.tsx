'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { chronicConditionsApi, type ChronicCondition } from '@/lib/api/chronic-conditions.api';

interface ChronicConditionsSectionProps {
  patientId: string;
  canEdit?: boolean;
}

export function ChronicConditionsSection({ patientId, canEdit = true }: ChronicConditionsSectionProps) {
  const [conditions, setConditions] = useState<ChronicCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadConditions();
  }, [patientId]);

  const loadConditions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await chronicConditionsApi.getByPatient(patientId);
      setConditions(response.data || []);
    } catch (err: any) {
      console.error('Error loading chronic conditions:', err);
      if (err?.response?.status !== 404) {
        setError('Failed to load conditions. Backend may not be configured.');
      }
      setConditions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this condition record?')) return;
    try {
      await chronicConditionsApi.delete(id);
      setConditions((prev) => prev.filter((c) => c.id !== id));
      toast.success('Condition removed');
    } catch (err) {
      console.error('Error deleting condition:', err);
      toast.error('Failed to remove condition');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading conditions...</span>
      </div>
    );
  }

  const severityColors: Record<string, { bg: string; border: string; text: string }> = {
    severe: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900' },
    moderate: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900' },
    mild: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900' },
  };

  const activeConditions = conditions.filter((c) => c.status === 'active' || !c.status);
  const managedConditions = conditions.filter((c) => c.status === 'managed');
  const resolvedConditions = conditions.filter((c) => c.status === 'resolved');

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Chronic Conditions ({conditions.length})
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Condition
          </button>
        )}
      </div>

      {conditions.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No chronic conditions recorded</p>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add first condition
            </button>
          )}
        </div>
      )}

      {activeConditions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Active Conditions</h4>
          {activeConditions.map((condition) => {
            const colors = severityColors[condition.severity] || severityColors.mild;
            return (
              <div key={condition.id} className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className={`font-bold ${colors.text} text-lg`}>{condition.condition}</h5>
                    {condition.diagnosedDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 ${colors.bg} ${colors.text} border ${colors.border} rounded-full text-xs font-bold uppercase`}
                    >
                      {condition.severity}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => handleDelete(condition.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {condition.notes && (
                  <div className="mt-2 p-2 bg-white/50 rounded border text-sm">
                    <strong>Notes:</strong> {condition.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {managedConditions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Managed Conditions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {managedConditions.map((condition) => (
              <div key={condition.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-green-900">{condition.condition}</p>
                    <p className="text-xs text-green-700 mt-1">Status: Managed</p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(condition.id)}
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

      {resolvedConditions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Resolved Conditions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resolvedConditions.map((condition) => (
              <div key={condition.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-700">{condition.condition}</p>
                    <p className="text-xs text-gray-500 mt-1">Status: Resolved</p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(condition.id)}
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
            <h3 className="text-lg font-semibold mb-4">Add Chronic Condition</h3>
            <p className="text-sm text-gray-600 mb-4">
              This feature requires backend API implementation. Please configure the chronic-conditions endpoint.
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
