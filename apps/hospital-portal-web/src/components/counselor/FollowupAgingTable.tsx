/**
 * FollowupAgingTable — Phase E
 * Shows pending-decision counseling sessions bucketed by days since session.
 * Fetches GET /counseling/analytics/followup-aging
 */

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { getApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Clock, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AgingSession {
  id: string;
  patientName: string;
  recommendedSurgery: string | null;
  phone: string | null;
  daysSinceSession: number;
}

interface AgingBuckets {
  bucket_0_3: AgingSession[];
  bucket_4_7: AgingSession[];
  bucket_8_14: AgingSession[];
  bucket_15_plus: AgingSession[];
}

interface FollowupAgingData {
  totalPending: number;
  buckets: AgingBuckets;
  generatedAt: string;
}

// ─── Bucket config ────────────────────────────────────────────────────────────

const BUCKET_CONFIG = [
  {
    key: 'bucket_15_plus' as keyof AgingBuckets,
    label: '15+ days',
    urgency: 'Critical',
    dotColor: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-700',
    rowClass: 'bg-red-50',
    borderClass: 'border-red-200',
    headerClass: 'text-red-700',
  },
  {
    key: 'bucket_8_14' as keyof AgingBuckets,
    label: '8–14 days',
    urgency: 'High',
    dotColor: 'bg-orange-500',
    badgeClass: 'bg-orange-100 text-orange-700',
    rowClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    headerClass: 'text-orange-700',
  },
  {
    key: 'bucket_4_7' as keyof AgingBuckets,
    label: '4–7 days',
    urgency: 'Medium',
    dotColor: 'bg-amber-400',
    badgeClass: 'bg-amber-100 text-amber-700',
    rowClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    headerClass: 'text-amber-700',
  },
  {
    key: 'bucket_0_3' as keyof AgingBuckets,
    label: '0–3 days',
    urgency: 'Normal',
    dotColor: 'bg-green-500',
    badgeClass: 'bg-green-100 text-green-700',
    rowClass: 'bg-green-50',
    borderClass: 'border-green-200',
    headerClass: 'text-green-700',
  },
] as const;

// ─── BucketPanel ─────────────────────────────────────────────────────────────

function BucketPanel({
  config,
  sessions,
}: {
  config: typeof BUCKET_CONFIG[number];
  sessions: AgingSession[];
}) {
  const [open, setOpen] = useState(config.key === 'bucket_15_plus');

  return (
    <div className={cn('rounded-lg border', config.borderClass, 'overflow-hidden')}>
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
          open ? config.rowClass : 'hover:bg-gray-50 bg-white'
        )}
      >
        <span className={cn('w-2 h-2 rounded-full flex-shrink-0', config.dotColor)} />
        <span className={cn('text-sm font-semibold flex-1', config.headerClass)}>
          {config.label}
        </span>
        <span
          className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full',
            config.badgeClass
          )}
        >
          {sessions.length}
        </span>
        <span className="text-xs text-gray-400 w-14 text-right flex-shrink-0">
          {config.urgency}
        </span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Session rows */}
      {open && sessions.length > 0 && (
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-t border-gray-100">
              <th className="text-left px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Patient
              </th>
              <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Surgery
              </th>
              <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Phone
              </th>
              <th className="text-right px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Days
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 font-medium text-gray-800 max-w-[160px] truncate">
                  {s.patientName}
                </td>
                <td className="px-3 py-2 text-gray-500 max-w-[140px] truncate">
                  {s.recommendedSurgery ?? '—'}
                </td>
                <td className="px-3 py-2 text-gray-500">
                  {s.phone ?? '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  <span
                    className={cn(
                      'inline-block px-2 py-0.5 rounded-full font-semibold',
                      config.badgeClass
                    )}
                  >
                    {s.daysSinceSession}d
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {open && sessions.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3 border-t border-gray-100">
          No patients in this range
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FollowupAgingTable() {
  const { user } = useAuthStore();

  const { data, isLoading, isError, refetch } = useQuery<FollowupAgingData>({
    queryKey: ['counselor-followup-aging', user?.branchId],
    queryFn: async () => {
      const api = getApi();
      const params = new URLSearchParams();
      if (user?.branchId) params.set('branchId', user.branchId);
      const res = await api.get(`/counseling/analytics/followup-aging?${params}`);
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="h-5 w-48 bg-gray-100 rounded animate-pulse mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
        <p className="text-sm text-gray-400">Failed to load followup aging data</p>
        <button onClick={() => refetch()} className="mt-1 text-xs text-blue-600 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-500" /> Followup Aging
          {data.totalPending > 0 && (
            <span className="ml-1 flex items-center gap-1 text-xs font-normal text-amber-600">
              <AlertTriangle className="w-3 h-3" /> {data.totalPending} pending
            </span>
          )}
        </h3>
        <p className="text-[10px] text-gray-400">
          Days since counseling session (undecided patients)
        </p>
      </div>

      <div className="space-y-2">
        {BUCKET_CONFIG.map(cfg => (
          <BucketPanel
            key={cfg.key}
            config={cfg}
            sessions={data.buckets[cfg.key]}
          />
        ))}
      </div>
    </div>
  );
}
