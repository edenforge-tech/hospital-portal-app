/**
 * Counselor Header Component - 3-Tab Lifecycle Navigation
 * Tabs: Live Queue | Surgery Confirmed | Surgery Followup
 * Updated: March 16, 2026
 */

'use client';

import React from 'react';
import { Activity } from 'lucide-react';

export type CounselorTab = 'queue' | 'surgery-confirmed' | 'surgery-followup' | 'analytics';

interface CounselorHeaderProps {
  activeTab: CounselorTab;
  onTabChange: (tab: CounselorTab) => void;
  /** Count of active waiting/in-progress queue items */
  assignedCount: number;
  /** Count of patients with surgery confirmed but pre-admission pending */
  confirmedCount?: number;
  /** Count of patients pending surgery decision (followup needed) */
  followupCount?: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function CounselorHeaderNew({
  activeTab,
  onTabChange,
  assignedCount,
  confirmedCount = 0,
  followupCount = 0,
  onRefresh,
  isRefreshing,
}: CounselorHeaderProps) {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const tabs: { id: CounselorTab; label: string; icon: string; count?: number; countColor?: string }[] = [
    { id: 'queue',              label: 'My Queue',          icon: '📋', count: assignedCount,  countColor: 'bg-blue-200 text-blue-800' },
    { id: 'surgery-confirmed',  label: 'Surgery Confirmed', icon: '✅', count: confirmedCount, countColor: 'bg-green-200 text-green-800' },
    { id: 'surgery-followup',   label: 'Surgery Followup',  icon: '⏳', count: followupCount,  countColor: followupCount > 0 ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-500' },
    { id: 'analytics',          label: 'Analytics',         icon: '📊' },
  ];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Date + Tabs */}
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">{dateString}</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 ml-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab.countColor}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <Activity className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
