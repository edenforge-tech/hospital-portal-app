/**
 * Surgery Quick View
 * Shows the counselor's upcoming booked surgeries for the next 7 days.
 * Cross-pollinated from Surgeon Dashboard "upcoming surgeries" list.
 *
 * Includes:
 *   - Today's OT count
 *   - Day-by-day list of scheduled surgeries
 *   - Status colour coding (Confirmed / Pending / Rescheduled)
 *   - Eye laterality badge (OD / OS / OU)
 *
 * Created: March 10, 2026
 */

'use client';

import React, { useState } from 'react';
import { Calendar, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SurgerySlot {
  id: string;
  patientName: string;
  mrn: string;
  procedure: string;
  scheduledDate: string; // ISO date YYYY-MM-DD
  scheduledTime: string; // "09:00"
  operatingDoctor: string;
  status: 'Confirmed' | 'Pending Confirmation' | 'Rescheduled' | 'Cancelled';
  eye: 'OD' | 'OS' | 'OU';
  packageName?: string;
  payerType?: string; // 'Cash' | 'Insurance' | 'CGHS'
}

interface SurgeryQuickViewProps {
  surgeries: SurgerySlot[];
  isLoading?: boolean;
}

const STATUS_META: Record<string, { icon: React.ReactNode; badge: string; iconColor: string }> = {
  Confirmed: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    badge: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-500',
  },
  'Pending Confirmation': {
    icon: <Clock className="w-3.5 h-3.5" />,
    badge: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-500',
  },
  Rescheduled: {
    icon: <Clock className="w-3.5 h-3.5" />,
    badge: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-500',
  },
  Cancelled: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    badge: 'bg-red-100 text-red-700',
    iconColor: 'text-red-500',
  },
};

const EYE_BADGE: Record<string, string> = {
  OD: 'bg-blue-50 text-blue-700 border-blue-200',
  OS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  OU: 'bg-purple-50 text-purple-700 border-purple-200',
};

const PAYER_BADGE: Record<string, string> = {
  Cash: 'bg-emerald-50 text-emerald-700',
  Insurance: 'bg-sky-50 text-sky-700',
  CGHS: 'bg-amber-50 text-amber-700',
  'Govt Scheme': 'bg-amber-50 text-amber-700',
};

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Group surgeries by date
function groupByDate(surgeries: SurgerySlot[]): Map<string, SurgerySlot[]> {
  const map = new Map<string, SurgerySlot[]>();
  const sorted = [...surgeries].sort((a, b) => {
    const dt = a.scheduledDate.localeCompare(b.scheduledDate);
    return dt !== 0 ? dt : a.scheduledTime.localeCompare(b.scheduledTime);
  });
  sorted.forEach((s) => {
    const key = s.scheduledDate;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  });
  return map;
}

function SurgeryRow({ surgery }: { surgery: SurgerySlot }) {
  const meta = STATUS_META[surgery.status] || STATUS_META.Confirmed;

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      {/* Time */}
      <div className="flex-shrink-0 w-12 text-center">
        <p className="text-sm font-bold text-gray-800">{surgery.scheduledTime}</p>
      </div>

      {/* Avatar + patient */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <User className="w-4 h-4 text-blue-600" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{surgery.patientName}</p>
            <p className="text-[11px] text-gray-500 font-mono">{surgery.mrn}</p>
          </div>
          {/* Status badge */}
          <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0', meta.badge)}>
            <span className={meta.iconColor}>{meta.icon}</span>
            {surgery.status}
          </span>
        </div>
        <p className="text-xs text-gray-700 mt-0.5 truncate">{surgery.procedure}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Eye laterality */}
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', EYE_BADGE[surgery.eye])}>
            {surgery.eye}
          </span>
          {/* Payer */}
          {surgery.payerType && (
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', PAYER_BADGE[surgery.payerType] || 'bg-gray-50 text-gray-600')}>
              {surgery.payerType}
            </span>
          )}
          {/* Doctor */}
          <span className="text-[10px] text-gray-500 truncate">{surgery.operatingDoctor}</span>
        </div>
      </div>
    </div>
  );
}

// ── Mock data (TODO: replace with API call) ──────────────────────────────────
export const MOCK_SURGERIES: SurgerySlot[] = [
  {
    id: 's1',
    patientName: 'Priya S.',
    mrn: 'MRN005',
    procedure: 'Phacoemulsification + PCIOL',
    scheduledDate: new Date().toISOString().slice(0, 10),
    scheduledTime: '10:30',
    operatingDoctor: 'Dr. Ravi Shankar',
    status: 'Confirmed',
    eye: 'OD',
    payerType: 'Cash',
    packageName: 'Premium',
  },
  {
    id: 's2',
    patientName: 'Amit P.',
    mrn: 'MRN123',
    procedure: 'Phacoemulsification + PCIOL',
    scheduledDate: new Date().toISOString().slice(0, 10),
    scheduledTime: '12:00',
    operatingDoctor: 'Dr. Ravi Shankar',
    status: 'Pending Confirmation',
    eye: 'OS',
    payerType: 'Insurance',
    packageName: 'Standard',
  },
  {
    id: 's3',
    patientName: 'Sunita D.',
    mrn: 'MRN009',
    procedure: 'Trabeculectomy',
    scheduledDate: (() => {
      const d = new Date(); d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    })(),
    scheduledTime: '09:00',
    operatingDoctor: 'Dr. Meera Nair',
    status: 'Confirmed',
    eye: 'OD',
    payerType: 'CGHS',
  },
  {
    id: 's4',
    patientName: 'Rajan K.',
    mrn: 'MRN312',
    procedure: 'LASIK OU',
    scheduledDate: (() => {
      const d = new Date(); d.setDate(d.getDate() + 2);
      return d.toISOString().slice(0, 10);
    })(),
    scheduledTime: '14:00',
    operatingDoctor: 'Dr. Ravi Shankar',
    status: 'Confirmed',
    eye: 'OU',
    payerType: 'Cash',
  },
];

export function SurgeryQuickView({ surgeries, isLoading = false }: SurgeryQuickViewProps) {
  const [viewDays, setViewDays] = useState<3 | 7>(3);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 animate-pulse">
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-3 flex gap-3 border-b border-gray-100">
            <div className="w-12 h-10 bg-gray-100 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter to selected range
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + viewDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const filtered = surgeries.filter((s) => s.scheduledDate <= cutoffStr);

  const grouped = groupByDate(filtered);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = (grouped.get(todayStr) || []).length;
  const confirmedCount = filtered.filter((s) => s.status === 'Confirmed').length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900">Surgery Schedule</h3>
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick summary */}
          <span className="text-xs text-emerald-700 font-semibold">
            {confirmedCount} confirmed
          </span>
          {/* 3d / 7d toggle */}
          <div className="flex rounded-md overflow-hidden border border-gray-200">
            {([3, 7] as const).map((d) => (
              <button
                key={d}
                onClick={() => setViewDays(d)}
                className={cn('px-2.5 py-1 text-xs font-medium transition-colors', viewDays === d ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Today spotlight */}
      {todayCount > 0 && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <p className="text-xs text-emerald-800 font-semibold">
            {todayCount} surger{todayCount !== 1 ? 'ies' : 'y'} scheduled for today
          </p>
        </div>
      )}

      {/* Day groups */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {grouped.size === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Calendar className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-600">No surgeries in next {viewDays} days</p>
            <p className="text-xs text-gray-400 mt-1">Book surgeries during counselling sessions</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([date, slots]) => (
            <div key={date}>
              {/* Day header */}
              <div className="sticky top-0 px-4 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">{formatShortDate(date)}</span>
                <span className="text-[10px] text-gray-400">{slots.length} case{slots.length !== 1 ? 's' : ''}</span>
              </div>
              {/* Slots for this day */}
              {slots.map((surgery) => (
                <SurgeryRow key={surgery.id} surgery={surgery} />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50">
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          View full surgery calendar →
        </button>
      </div>
    </div>
  );
}
