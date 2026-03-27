'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, FileText } from 'lucide-react';

interface EmergencyOverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOverride: (reason: string) => void;
  patientName: string;
  tabName: string;
  isLoading?: boolean;
}

export const EmergencyOverrideDialog: React.FC<EmergencyOverrideDialogProps> = ({
  isOpen,
  onClose,
  onOverride,
  patientName,
  tabName,
  isLoading = false
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      alert('Override reason must be at least 10 characters');
      return;
    }
    onOverride(reason);
    setReason('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Emergency Override</h2>
              <p className="text-sm text-amber-700">This action will be logged</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-4 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Warning: Bypassing Check-In Gate</p>
              <p className="text-amber-700 mt-1">
                You are about to access <strong>{tabName}</strong> for <strong>{patientName}</strong> without check-in.
                This override will be recorded with your user ID, timestamp, and reason.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Reason for Override *
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed reason for bypassing the check-in requirement (minimum 10 characters)..."
              rows={4}
              minLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/10 characters minimum
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || reason.trim().length < 10}
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              {isLoading ? 'Overriding...' : 'Confirm Override'}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-6 pb-6 pt-0">
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
            <strong>Audit Trail:</strong> This override will be logged with your user credentials,
            timestamp, patient ID, accessed section, and the reason provided above.
          </div>
        </div>
      </div>
    </div>
  );
};
