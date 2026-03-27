'use client';

/**
 * TodaysCallbacksWidget
 * Shows today's scheduled callbacks for the counselor.
 * Fetches: GET /api/counseling/callbacks?branchId=&date=today&status=Scheduled
 * Actions:  PATCH /api/counseling/callbacks/{id}/complete
 */

import React, { useState } from 'react';
import { Phone, CheckCircle2, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CallbackItem {
  callbackId: string;
  sessionId: string;
  patientName: string;
  patientPhone?: string;
  callbackDate: string;
  callbackTime?: string;
  callbackType: string;
  channel: string;
  callbackNotes?: string;
  callbackStatus: string;
  priority: number;
}

interface TodaysCallbacksWidgetProps {
  branchId?: string;
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  // Handle "HH:MM:SS" or "HH:MM"
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ampm}`;
}

const TYPE_LABELS: Record<string, string> = {
  PreSurgery: 'Pre-Surgery',
  PostSurgery: 'Post-Surgery',
  Financial: 'Financial',
  FearAnxiety: 'Fear/Anxiety',
  DecisionPending: 'Decision',
  InsuranceFollowup: 'Insurance',
  General: 'General',
};

const CHANNEL_ICON: Record<string, string> = {
  Phone: '📞',
  WhatsApp: '💬',
  SMS: '✉',
  VideoCall: '📹',
};

export function TodaysCallbacksWidget({ branchId }: TodaysCallbacksWidgetProps) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const { data: callbacks = [], isLoading } = useQuery<CallbackItem[]>({
    queryKey: ['todays-callbacks', branchId, today],
    queryFn: async () => {
      const api = getApi();
      const params = new URLSearchParams({ date: today, status: 'Scheduled' });
      if (branchId) params.set('branchId', branchId);
      const res = await api.get(`/counseling/callbacks?${params}`);
      return res.data;
    },
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  const completeMutation = useMutation({
    mutationFn: async ({ callbackId, notes }: { callbackId: string; notes?: string }) => {
      const api = getApi();
      await api.patch(`/counseling/callbacks/${callbackId}/complete`, {
        completionNotes: notes ?? 'Marked complete from today\'s callbacks widget',
        outcome: 'Completed',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todays-callbacks'] });
      qc.invalidateQueries({ queryKey: ['pending-decisions'] });
      setCompletingId(null);
    },
  });

  const overdueCount = callbacks.filter(c => {
    if (!c.callbackTime) return false;
    const [h, m] = c.callbackTime.split(':').map(Number);
    const scheduledMs = new Date().setHours(h, m, 0, 0);
    return scheduledMs < Date.now();
  }).length;

  if (isLoading) {
    return (
      <div className="mx-3 my-2 bg-white border border-gray-200 rounded-lg p-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-40" />
      </div>
    );
  }

  if (callbacks.length === 0) return null;

  return (
    <div className="mx-3 my-2 bg-white border border-blue-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-blue-800">Today's Callbacks</span>
          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
            {callbacks.length}
          </span>
          {overdueCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              <AlertCircle className="w-2.5 h-2.5" />
              {overdueCount} overdue
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />}
      </button>

      {/* List */}
      {expanded && (
        <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
          {callbacks.map(cb => {
            const isOverdue = (() => {
              if (!cb.callbackTime) return false;
              const [h, m] = cb.callbackTime.split(':').map(Number);
              return new Date().setHours(h, m, 0, 0) < Date.now();
            })();

            return (
              <div
                key={cb.callbackId}
                className={cn(
                  'flex items-center gap-2 px-3 py-2',
                  isOverdue && 'bg-red-50'
                )}
              >
                {/* Time */}
                <div className="flex items-center gap-1 min-w-[52px]">
                  <Clock className={cn('w-3 h-3', isOverdue ? 'text-red-500' : 'text-gray-400')} />
                  <span className={cn('text-[10px] font-mono font-semibold', isOverdue ? 'text-red-600' : 'text-gray-600')}>
                    {cb.callbackTime ? formatTime(cb.callbackTime) : '—'}
                  </span>
                </div>

                {/* Patient + type */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{cb.patientName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] bg-gray-100 text-gray-600 px-1 rounded">
                      {TYPE_LABELS[cb.callbackType] ?? cb.callbackType}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {CHANNEL_ICON[cb.channel] ?? ''} {cb.channel}
                    </span>
                    {cb.priority >= 4 && (
                      <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded font-bold">HIGH</span>
                    )}
                  </div>
                </div>

                {/* Complete button */}
                <button
                  disabled={completeMutation.isPending && completingId === cb.callbackId}
                  onClick={() => {
                    setCompletingId(cb.callbackId);
                    completeMutation.mutate({ callbackId: cb.callbackId });
                  }}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60 transition-colors flex-shrink-0"
                  title="Mark as complete"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Done
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
