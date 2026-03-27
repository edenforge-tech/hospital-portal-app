'use client';

/**
 * ReasonForDelayBadge
 * Inline editable pill showing + updating why the patient hasn't decided yet.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';

export const DELAY_REASONS = [
  'Financial',
  'Fear',
  'Family Concern',
  'Travel / Location',
  'Competitor Quote',
  'Medical Concern',
  'Undecided',
  'Unknown',
] as const;

export type DelayReason = (typeof DELAY_REASONS)[number];

const COLORS: Record<string, string> = {
  'Financial':        'bg-orange-100 text-orange-700 border-orange-300',
  'Fear':             'bg-red-100    text-red-700    border-red-300',
  'Family Concern':   'bg-purple-100 text-purple-700 border-purple-300',
  'Travel / Location':'bg-blue-100   text-blue-700   border-blue-300',
  'Competitor Quote': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Medical Concern':  'bg-pink-100   text-pink-700   border-pink-300',
  'Undecided':        'bg-gray-100   text-gray-700   border-gray-300',
  'Unknown':          'bg-gray-100   text-gray-600   border-gray-200',
};

interface ReasonForDelayBadgeProps {
  sessionId: string;
  value?: string;
  readOnly?: boolean;
  onUpdate?: (reason: string) => void;
}

export function ReasonForDelayBadge({
  sessionId,
  value,
  readOnly = false,
  onUpdate,
}: ReasonForDelayBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const mutation = useMutation({
    mutationFn: async (reason: string) => {
      const api = getApi();
      await api.patch(`/counseling/sessions/${sessionId}/delay-reason`, { reason });
    },
    onSuccess: (_, reason) => {
      onUpdate?.(reason);
      qc.invalidateQueries({ queryKey: ['pending-decisions'] });
      setOpen(false);
    },
  });

  const color = value ? (COLORS[value] ?? COLORS['Unknown']) : 'bg-gray-50 text-gray-400 border-dashed border-gray-300';
  const label = value || 'Set delay reason';

  if (readOnly) {
    return (
      <span className={cn('inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border', color)}>
        {label}
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => !readOnly && setOpen(v => !v)}
        className={cn(
          'inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all hover:opacity-80',
          color
        )}
      >
        {label}
        <ChevronDown className="w-2.5 h-2.5" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
          {DELAY_REASONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => mutation.mutate(r)}
              disabled={mutation.isPending}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors',
                value === r && 'bg-gray-100'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
