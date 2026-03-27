'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { socialHistoryApi, type SocialHistory } from '@/lib/api/social-history.api';

interface SocialHistorySectionProps {
  patientId: string;
  canEdit?: boolean;
}

export function SocialHistorySection({ patientId, canEdit = true }: SocialHistorySectionProps) {
  const [socialHistory, setSocialHistory] = useState<SocialHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadSocialHistory();
  }, [patientId]);

  const loadSocialHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await socialHistoryApi.getByPatient(patientId);
      // Assuming the API returns an array, take the first (most recent) record
      const data = response.data;
      setSocialHistory(Array.isArray(data) && data.length > 0 ? data[0] : null);
    } catch (err: any) {
      console.error('Error loading social history:', err);
      if (err?.response?.status !== 404) {
        setError('Failed to load social history. Backend may not be configured.');
      }
      setSocialHistory(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading social history...</span>
      </div>
    );
  }

  const getSmokingBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'current':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'former':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'never':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAlcoholBadgeColor = (use: string) => {
    switch (use?.toLowerCase()) {
      case 'heavy':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'occasional':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'never':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Social & Lifestyle History</h3>
        {canEdit && (
          <button
            onClick={() => setShowEditForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {socialHistory ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {socialHistory ? 'Edit' : 'Add'} Social History
          </button>
        )}
      </div>

      {!socialHistory && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No social history recorded</p>
          {canEdit && (
            <button
              onClick={() => setShowEditForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add social history
            </button>
          )}
        </div>
      )}

      {socialHistory && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Smoking Status */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Smoking Status</p>
              <span
                className={`inline-block px-4 py-2 rounded-lg border font-semibold capitalize ${getSmokingBadgeColor(socialHistory.smokingStatus)}`}
              >
                {socialHistory.smokingStatus || 'Not specified'}
              </span>
            </div>

            {/* Alcohol Use */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Alcohol Use</p>
              <span
                className={`inline-block px-4 py-2 rounded-lg border font-semibold capitalize ${getAlcoholBadgeColor(socialHistory.alcoholUse)}`}
              >
                {socialHistory.alcoholUse || 'Not specified'}
              </span>
            </div>

            {/* Occupation */}
            {socialHistory.occupation && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Occupation</p>
                <p className="text-base text-gray-900">{socialHistory.occupation}</p>
              </div>
            )}

            {/* Exercise */}
            {socialHistory.exerciseFrequency && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Exercise Frequency</p>
                <p className="text-base text-gray-900 capitalize">{socialHistory.exerciseFrequency}</p>
              </div>
            )}

            {/* Diet */}
            {socialHistory.diet && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Diet</p>
                <p className="text-base text-gray-900">{socialHistory.diet}</p>
              </div>
            )}

            {/* Substance Use */}
            {socialHistory.substanceUse && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Substance Use</p>
                <p className="text-base text-gray-900">{socialHistory.substanceUse}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {socialHistory.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-500 mb-2">Additional Notes</p>
              <p className="text-gray-700">{socialHistory.notes}</p>
            </div>
          )}
        </div>
      )}

      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {socialHistory ? 'Edit' : 'Add'} Social History
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This feature requires backend API implementation. Please configure the social-history endpoint.
            </p>
            <button
              onClick={() => setShowEditForm(false)}
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
