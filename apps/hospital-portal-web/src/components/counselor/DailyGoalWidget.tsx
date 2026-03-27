/**
 * Daily Goal Widget
 * Cross-pollinated from Surgeon Dashboard goal-tracking pattern.
 * Shows sessions target vs actual and revenue target vs actual with
 * animated progress bars and a colour shift (green at ≥80%).
 * Created: March 10, 2026
 */

'use client';

import React from 'react';
import { Target, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalBarProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
  formatValue?: (v: number) => string;
  formatTarget?: (v: number) => string;
}

function GoalBar({ label, value, target, unit = '', formatValue, formatTarget }: GoalBarProps) {
  const pct = target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0;
  const colour =
    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : pct >= 25 ? 'bg-amber-500' : 'bg-red-500';
  const textColour =
    pct >= 80 ? 'text-emerald-700' : pct >= 50 ? 'text-blue-700' : pct >= 25 ? 'text-amber-700' : 'text-red-600';

  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;
  const displayTarget = formatTarget ? formatTarget(target) : `${target}${unit}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={cn('font-bold', textColour)}>
          {displayValue} <span className="font-normal text-gray-400">/ {displayTarget}</span>
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', colour)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={cn('text-[10px] font-semibold', textColour)}>{pct}% complete</p>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  bg: string;
  iconBg: string;
}

function StatCard({ icon, label, value, sub, bg, iconBg }: StatCardProps) {
  return (
    <div className={cn('rounded-lg p-3 flex items-center gap-3', bg)}>
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-gray-600 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

interface DailyGoalWidgetProps {
  completedSessions: number;
  sessionTarget: number;
  revenueActual: number;
  revenueTarget: number;
  avgDurationMinutes: number;
  surgeriesScheduled: number;
  isLoading?: boolean;
}

function formatRevenue(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export function DailyGoalWidget({
  completedSessions,
  sessionTarget,
  revenueActual,
  revenueTarget,
  avgDurationMinutes,
  surgeriesScheduled,
  isLoading = false,
}: DailyGoalWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Daily Goals</h3>
        </div>
        <span className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Progress Bars */}
        <GoalBar
          label="Sessions Completed"
          value={completedSessions}
          target={sessionTarget}
          unit=""
          formatValue={(v) => `${v}`}
          formatTarget={(t) => `${t} sessions`}
        />
        <GoalBar
          label="Revenue Generated"
          value={revenueActual}
          target={revenueTarget}
          formatValue={formatRevenue}
          formatTarget={formatRevenue}
        />

        {/* Quick stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Clock className="w-4 h-4 text-blue-600" />}
            label="Avg Session"
            value={`${avgDurationMinutes}m`}
            sub="per patient"
            bg="bg-blue-50"
            iconBg="bg-blue-100"
          />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4 text-purple-600" />}
            label="Surgeries Booked"
            value={`${surgeriesScheduled}`}
            sub="today"
            bg="bg-purple-50"
            iconBg="bg-purple-100"
          />
        </div>

        {/* Motivational note */}
        {completedSessions > 0 && completedSessions < sessionTarget && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            💪 {sessionTarget - completedSessions} more session{sessionTarget - completedSessions !== 1 ? 's' : ''} to hit your daily target!
          </div>
        )}
        {completedSessions >= sessionTarget && (
          <div className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
            🎉 Daily session target achieved! Great work today.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50">
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          View Detailed Analytics →
        </button>
      </div>
    </div>
  );
}
