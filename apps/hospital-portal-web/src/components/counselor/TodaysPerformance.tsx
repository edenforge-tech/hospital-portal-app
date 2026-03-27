/**
 * Today's Performance Panel
 * Single source of truth for counselor stats (NO DUPLICATES)
 * Created: March 6, 2026
 */

'use client';

import React from 'react';
import { CheckCircle, Clock, DollarSign, TrendingUp, Activity } from 'lucide-react';

interface TodaysPerformanceProps {
  completedSessions: number;
  avgDurationMinutes: number;
  totalRevenue: number;
  surgeriesScheduled: number;
  isLoading?: boolean;
}

export function TodaysPerformance({
  completedSessions,
  avgDurationMinutes,
  totalRevenue,
  surgeriesScheduled,
  isLoading = false,
}: TodaysPerformanceProps) {
  // Format revenue for display
  const formatRevenue = (amount: number): string => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          ⏱️ Today's Performance
        </h3>
        <p className="text-xs text-gray-600 mt-0.5">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-3">
        {/* Completed Sessions */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Sessions Completed</p>
              <p className="text-2xl font-bold text-green-700">{completedSessions}</p>
            </div>
          </div>
        </div>

        {/* Avg Duration */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Avg Duration</p>
              <p className="text-2xl font-bold text-blue-700">{avgDurationMinutes}m</p>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Revenue</p>
              <p className="text-2xl font-bold text-emerald-700">{formatRevenue(totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Surgeries Scheduled */}
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Surgeries Scheduled</p>
              <p className="text-2xl font-bold text-purple-700">{surgeriesScheduled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          View Detailed Analytics →
        </button>
      </div>
    </div>
  );
}
