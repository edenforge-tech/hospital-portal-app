'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { AnalyticsSummary } from '@/hooks/use-counselor-analytics';

const STAGES = [
  { key: 'totalSessions',  label: 'Total',     color: '#3b82f6' },
  { key: 'agreedCount',    label: 'Agreed',    color: '#22c55e' },
  { key: 'undecidedCount', label: 'Undecided', color: '#f59e0b' },
  { key: 'declinedCount',  label: 'Declined',  color: '#ef4444' },
] as const;

interface TooltipPayload {
  payload?: { stage: string; count: number; pct: number };
}

function FunnelTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.[0]?.payload) return null;
  const { stage, count, pct } = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800">{stage}</p>
      <p className="text-gray-500 mt-0.5">
        {count} sessions&nbsp;
        <span className="font-medium text-gray-700">({pct}%)</span>
      </p>
    </div>
  );
}

interface Props {
  data: AnalyticsSummary;
  className?: string;
}

export function ConversionFunnelChart({ data, className }: Props) {
  if (data.totalSessions === 0) {
    return (
      <div className={cn('flex items-center justify-center h-36 text-sm text-gray-400', className)}>
        No session data for this period
      </div>
    );
  }

  const chartData = STAGES.map(s => ({
    stage: s.label,
    count: data[s.key],
    pct: Math.round((data[s.key] / data.totalSessions) * 100),
    color: s.color,
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={148}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<FunnelTooltip />} cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={52}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Pct legend row */}
      <div className="flex items-center justify-around mt-1">
        {chartData.map(entry => (
          <div key={entry.stage} className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-semibold" style={{ color: entry.color }}>
              {entry.pct}%
            </span>
            <span className="text-[10px] text-gray-400">{entry.stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
