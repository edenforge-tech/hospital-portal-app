'use client';

/**
 * CallbackSchedulerModal
 * Schedule a follow-up callback for a patient.
 * Creates a callback via POST /api/counseling/sessions/{id}/callbacks (Migration 70 dedicated table).
 */

import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';

const CHANNELS = ['Phone', 'WhatsApp', 'SMS', 'VideoCall'];

const CALLBACK_TYPES = [
  { value: 'PreSurgery',       label: 'Pre-Surgery' },
  { value: 'PostSurgery',      label: 'Post-Surgery' },
  { value: 'Financial',        label: 'Financial' },
  { value: 'FearAnxiety',      label: 'Fear / Anxiety' },
  { value: 'DecisionPending',  label: 'Decision Pending' },
  { value: 'InsuranceFollowup', label: 'Insurance Follow-up' },
  { value: 'General',          label: 'General' },
];

interface CallbackSchedulerModalProps {
  sessionId: string;
  patientId: string;
  patientName: string;
  onClose: () => void;
}

export function CallbackSchedulerModal({
  sessionId,
  patientId,
  patientName,
  onClose,
}: CallbackSchedulerModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [channel, setChannel] = useState('Phone');
  const [callbackType, setCallbackType] = useState('PreSurgery');
  const [notes, setNotes] = useState('');
  const [patientPreferredTime, setPatientPreferredTime] = useState('');
  const [smsReminder, setSmsReminder] = useState(true);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.post(`/counseling/sessions/${sessionId}/callbacks`, {
        callbackType,
        callbackDate: date,
        callbackTime: time || undefined,
        channel,
        callbackNotes: notes || undefined,
        patientPreferredTime: patientPreferredTime || undefined,
        smsReminder,
      });
    },
    onSuccess: () => {
      toast.success('Callback scheduled');
      qc.invalidateQueries({ queryKey: ['pending-decisions'] });
      onClose();
    },
    onError: () => toast.error('Failed to schedule callback'),
  });

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="font-bold text-gray-900">Schedule Callback</h2>
              <p className="text-xs text-gray-500">{patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Callback Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Callback Type <span className="text-red-500">*</span></label>
            <select value={callbackType} onChange={e => setCallbackType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
              {CALLBACK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={minDate}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
            <div className="flex gap-2 flex-wrap">
              {CHANNELS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChannel(c)}
                  className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${
                    channel === c
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Reminder notes for the callback…"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Patient&apos;s Preferred Time</label>
            <input type="text" value={patientPreferredTime} onChange={e => setPatientPreferredTime(e.target.value)}
              placeholder='e.g. "Morning (9-11 AM)"'
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        {/* SMS reminder checkbox */}
        <div className="px-5 py-3 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={smsReminder}
              onChange={e => setSmsReminder(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-gray-700">
              Send SMS reminder to patient before callback
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!date || mutation.isPending}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {mutation.isPending ? 'Scheduling…' : 'Schedule Callback'}
          </button>
        </div>
      </div>
    </div>
  );
}
