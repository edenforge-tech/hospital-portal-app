/**
 * Conversion Breakdown Widget
 * Shows how today's counseled patients are distributed by payer type.
 * Cross-pollinated from Surgeon Dashboard's procedure breakdown concept.
 * Created: March 10, 2026
 */

'use client';

import React from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConversionData {
  cash: number;
  insurance: number;
  government: number; // CGHS, ESI, etc.
  camp: number;
  pending: number; // Not yet categorised
}

interface ConversionBreakdownProps {
  data: ConversionData;
  isLoading?: boolean;
}

interface FunnelBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  bgColor: string;
  textColor: string;
  emoji: string;
}

function FunnelBar({ label, value, total, color, bgColor, textColor, emoji }: FunnelBarProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{emoji} {label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('font-bold text-sm', textColor)}>{value}</span>
          <span className="text-gray-400 text-[10px]">{pct}%</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ConversionBreakdown({ data, isLoading = false }: ConversionBreakdownProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-2 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const total = data.cash + data.insurance + data.government + data.camp + data.pending;
  const converted = data.cash + data.insurance + data.government + data.camp;
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-gray-900">Payer Mix Today</h3>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-600 font-semibold">{total} total</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Conversion summary pill */}
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <div>
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Conversion Rate</p>
            <p className="text-2xl font-bold text-emerald-800 leading-none mt-0.5">{conversionRate}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{converted} converted</p>
            <p className="text-xs text-gray-400">of {total} counseled</p>
          </div>
        </div>

        {/* Funnel bars */}
        <div className="space-y-3">
          <FunnelBar
            label="Cash"
            value={data.cash}
            total={total}
            color="bg-emerald-500"
            bgColor="bg-emerald-50"
            textColor="text-emerald-700"
            emoji="💵"
          />
          <FunnelBar
            label="Insurance / Co-Pay"
            value={data.insurance}
            total={total}
            color="bg-blue-500"
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            emoji="🛡️"
          />
          <FunnelBar
            label="Govt. Scheme"
            value={data.government}
            total={total}
            color="bg-amber-500"
            bgColor="bg-amber-50"
            textColor="text-amber-700"
            emoji="🏛️"
          />
          <FunnelBar
            label="Camp"
            value={data.camp}
            total={total}
            color="bg-violet-500"
            bgColor="bg-violet-50"
            textColor="text-violet-700"
            emoji="🎪"
          />
          {data.pending > 0 && (
            <FunnelBar
              label="Pending Decision"
              value={data.pending}
              total={total}
              color="bg-gray-400"
              bgColor="bg-gray-50"
              textColor="text-gray-600"
              emoji="⏳"
            />
          )}
        </div>
      </div>
    </div>
  );
}
