/**
 * Counselor Smart Stats Bar
 * Clickable stat chips that filter the patient queue.
 * Cross-pollinated from the Optometrist dashboard pattern.
 * Created: March 10, 2026
 */

'use client';

import React from 'react';
import {
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Timer,
  RefreshCw,
  Target,
} from 'lucide-react';

export interface CounselorQueueStats {
  waiting: number;
  inProgress: number;
  completed: number;
  urgent: number;
  avgWaitMinutes: number;
  sessionTarget: number;
  revenueTarget: number;
  revenueActual: number;
  autoRefresh: boolean;
}

interface CounselorSmartStatsProps {
  stats: CounselorQueueStats;
  activeFilter: string; // 'All' | 'Waiting' | 'InProgress' | 'Completed' | 'Urgent' | 'FollowUp'
  onFilterChange: (filter: string) => void;
  onRefreshToggle: () => void;
  onCallNext: () => void;
}

interface StatChipProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  filterKey: string;
  colorClassActive: string;
  colorClassIdle: string;
  isActive: boolean;
  onClick: () => void;
  subtitle?: string;
}

function StatChip({
  label,
  value,
  icon,
  colorClassActive,
  colorClassIdle,
  isActive,
  onClick,
  subtitle,
}: StatChipProps) {
  return (
    <button
      onClick={onClick}
      title={`Click to filter by ${label}`}
      className={`flex items-center gap-3 rounded-lg px-5 py-3 flex-1 transition-all text-left ${
        isActive ? colorClassActive : colorClassIdle
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
        <p className="text-2xl font-bold leading-none mt-0.5">{value}</p>
        {subtitle && <p className="text-[10px] mt-0.5 opacity-70">{subtitle}</p>}
      </div>
    </button>
  );
}

export function CounselorSmartStats({
  stats,
  activeFilter,
  onFilterChange,
  onRefreshToggle,
  onCallNext,
}: CounselorSmartStatsProps) {
  const isActive = (key: string) => activeFilter === key;
  const toggle = (key: string) => onFilterChange(activeFilter === key ? 'All' : key);

  const sessionPct = stats.sessionTarget > 0
    ? Math.round((stats.completed / stats.sessionTarget) * 100)
    : 0;
  const revPct = stats.revenueTarget > 0
    ? Math.round((stats.revenueActual / stats.revenueTarget) * 100)
    : 0;

  return (
    <div className="bg-white px-5 py-3">
      <div className="flex items-center gap-3">
        {/* --- Waiting --- */}
        <StatChip
          label="Waiting"
          value={stats.waiting}
          filterKey="Waiting"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          colorClassActive="bg-amber-100 border-2 border-amber-400 ring-2 ring-amber-200 shadow-sm text-amber-900"
          colorClassIdle="bg-amber-50 border border-amber-200 hover:border-amber-300 hover:shadow-sm text-amber-900"
          isActive={isActive('Waiting')}
          onClick={() => toggle('Waiting')}
        />

        {/* --- In Progress --- */}
        <StatChip
          label="In Progress"
          value={stats.inProgress}
          filterKey="InProgress"
          icon={<Activity className="w-5 h-5 text-blue-500" />}
          colorClassActive="bg-blue-100 border-2 border-blue-400 ring-2 ring-blue-200 shadow-sm text-blue-900"
          colorClassIdle="bg-blue-50 border border-blue-200 hover:border-blue-300 hover:shadow-sm text-blue-900"
          isActive={isActive('InProgress')}
          onClick={() => toggle('InProgress')}
        />

        {/* --- Done vs Target (non-clickable progress indicator) --- */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-3 flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Done Today</p>
            <p className="text-2xl font-bold text-emerald-900 leading-none mt-0.5">{stats.completed}<span className="text-sm font-medium text-emerald-600">/{stats.sessionTarget}</span></p>
            <p className="text-[10px] mt-0.5 text-emerald-600">{sessionPct}% of target</p>
          </div>
        </div>

        {/* --- Completed (clickable — filters queue) --- */}
        <StatChip
          label="Completed"
          value={stats.completed}
          filterKey="Completed"
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          colorClassActive="bg-green-100 border-2 border-green-500 ring-2 ring-green-200 shadow-sm text-green-900"
          colorClassIdle="bg-green-50 border border-green-300 hover:border-green-400 hover:shadow-sm text-green-900"
          isActive={isActive('Completed')}
          onClick={() => toggle('Completed')}
        />

        {/* --- Urgent --- */}
        <StatChip
          label="Urgent"
          value={stats.urgent}
          filterKey="Urgent"
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          colorClassActive="bg-red-100 border-2 border-red-400 ring-2 ring-red-200 shadow-sm text-red-900"
          colorClassIdle="bg-red-50 border border-red-200 hover:border-red-300 hover:shadow-sm text-red-900"
          isActive={isActive('Urgent')}
          onClick={() => toggle('Urgent')}
        />

        {/* --- Avg Wait (non-clickable) --- */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-5 py-3 flex-shrink-0">
          <Timer className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Avg Wait</p>
            <p className="text-2xl font-bold text-slate-900 leading-none mt-0.5">
              {stats.avgWaitMinutes}<span className="text-sm font-medium ml-0.5">m</span>
            </p>
          </div>
        </div>

        {/* --- Revenue Target chip (non-clickable) --- */}
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-lg px-5 py-3 flex-shrink-0">
          <Target className="w-5 h-5 text-teal-500" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-600">Revenue</p>
            <p className="text-2xl font-bold text-teal-900 leading-none mt-0.5">
              {revPct}<span className="text-sm font-medium ml-0.5">%</span>
            </p>
            <p className="text-[10px] text-teal-700 mt-0.5">of daily target</p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <button
            onClick={onRefreshToggle}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
              stats.autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 ${stats.autoRefresh ? 'animate-spin' : ''}`}
              style={stats.autoRefresh ? { animationDuration: '3s' } : {}}
            />
            {stats.autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={onCallNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ▶ Call Next
          </button>
        </div>
      </div>
    </div>
  );
}
