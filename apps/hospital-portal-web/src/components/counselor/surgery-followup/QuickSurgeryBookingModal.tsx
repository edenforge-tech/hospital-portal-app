'use client';

/**
 * QuickSurgeryBookingModal
 * Fast-track booking from a counseling session where patient has agreed.
 * POST /api/counseling/sessions/{sessionId}/quick-book-surgery
 *
 * Fetches:
 *  - Surgeons: GET /api/users/surgeons
 *  - Theaters: GET /api/otbooking/theaters?branchId=
 */

import React, { useState } from 'react';
import { X, Zap, CalendarCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

interface Surgeon {
  userId: string;
  fullName: string;
  specialization?: string;
}

interface Theater {
  id: string;
  name: string;
  code: string;
}

interface QuickBookSurgeryResponse {
  success: boolean;
  scheduleId?: string;
  scheduleNumber?: string;
  message?: string;
}

interface QuickSurgeryBookingModalProps {
  sessionId: string;
  patientName: string;
  recommendedSurgery?: string;
  onClose: () => void;
  onBooked?: (response: QuickBookSurgeryResponse) => void;
}

const EYE_OPTIONS = ['Right', 'Left', 'Both'] as const;
type EyeOption = typeof EYE_OPTIONS[number];

export function QuickSurgeryBookingModal({
  sessionId,
  patientName,
  recommendedSurgery,
  onClose,
  onBooked,
}: QuickSurgeryBookingModalProps) {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  // Form state
  const [surgeonId, setSurgeonId] = useState('');
  const [theaterId, setTheaterId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [eye, setEye] = useState<EyeOption>('Right');
  const [notes, setNotes] = useState('');

  const [successData, setSuccessData] = useState<QuickBookSurgeryResponse | null>(null);
  const [serverError, setServerError] = useState('');

  // Fetch surgeons
  const { data: surgeons = [], isLoading: surgeonsLoading } = useQuery<Surgeon[]>({
    queryKey: ['surgeons-list'],
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/users/surgeons');
      return res.data;
    },
  });

  // Fetch theaters
  const { data: theaters = [], isLoading: theatersLoading } = useQuery<Theater[]>({
    queryKey: ['theaters-list', user?.branchId],
    queryFn: async () => {
      const api = getApi();
      const params = user?.branchId ? `?branchId=${user.branchId}` : '';
      const res = await api.get(`/otbooking/theaters${params}`);
      return res.data;
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      const payload = {
        surgeonId,
        theaterId,
        scheduledDate,
        startTime,
        estimatedDurationMinutes: estimatedDuration,
        eye,
        notes: notes.trim() || undefined,
      };
      const res = await api.post(`/counseling/sessions/${sessionId}/quick-book-surgery`, payload);
      return res.data as QuickBookSurgeryResponse;
    },
    onSuccess: (data) => {
      setSuccessData(data);
      qc.invalidateQueries({ queryKey: ['pending-decisions'] });
      onBooked?.(data);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Booking failed. Please try again.';
      setServerError(msg);
    },
  });

  const isValid = surgeonId && theaterId && scheduledDate && startTime && estimatedDuration > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setServerError('');
    bookMutation.mutate();
  };

  // ── Success screen ──
  if (successData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Surgery Booked!</h2>
          {successData.scheduleNumber && (
            <p className="text-sm text-gray-600 mb-1">
              Schedule <strong className="font-mono">{successData.scheduleNumber}</strong>
            </p>
          )}
          {successData.message && <p className="text-xs text-gray-500 mb-4">{successData.message}</p>}
          <button
            onClick={onClose}
            className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Zap className="w-4.5 h-4.5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Quick Surgery Booking</h2>
              <p className="text-xs text-gray-500 truncate max-w-[240px]">{patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Recommended surgery (read-only hint) */}
          {recommendedSurgery && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <CalendarCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800 font-medium">{recommendedSurgery}</p>
            </div>
          )}

          {/* Surgeon */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Surgeon <span className="text-red-500">*</span></label>
            <select
              value={surgeonId}
              onChange={e => setSurgeonId(e.target.value)}
              disabled={surgeonsLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            >
              <option value="">{surgeonsLoading ? 'Loading…' : 'Select surgeon'}</option>
              {surgeons.map(s => (
                <option key={s.userId} value={s.userId}>
                  Dr. {s.fullName}{s.specialization ? ` — ${s.specialization}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Theater */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">OT / Theater <span className="text-red-500">*</span></label>
            <select
              value={theaterId}
              onChange={e => setTheaterId(e.target.value)}
              disabled={theatersLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            >
              <option value="">{theatersLoading ? 'Loading…' : 'Select theater'}</option>
              {theaters.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Duration + Eye */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Duration (min) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={estimatedDuration}
                min={10}
                max={480}
                step={5}
                onChange={e => setEstimatedDuration(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Eye <span className="text-red-500">*</span></label>
              <div className="flex gap-1">
                {EYE_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEye(opt)}
                    className={cn(
                      'flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors',
                      eye === opt
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional instructions or remarks…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{serverError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || bookMutation.isPending}
              className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {bookMutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
                  </svg>
                  Booking…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Book Surgery
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
