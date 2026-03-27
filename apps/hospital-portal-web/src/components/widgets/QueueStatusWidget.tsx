/**
 * Queue Status Widget
 * Displays current queue stats and "Call Next Patient" action
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Users, Phone as PhoneCall, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { useCounselingQueueStats } from '@/hooks/use-counseling-sessions';
import { useAuthStore } from '@/lib/auth-store';

export default function QueueStatusWidget({
  size,
  data,
  onAction,
}: WidgetProps) {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  
  // Use real-time queue stats from API
  const { data: statsData, isLoading, error } = useCounselingQueueStats(branchId, undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const queueStats = {
    waiting: statsData?.totalWaiting || 0,
    called: statsData?.totalCalled || 0,
    inProgress: statsData?.totalInProgress || 0,
    completed: statsData?.totalCompletedToday || 0,
    averageWaitMinutes: statsData?.averageWaitTimeMinutes || 0,
    longestWaitMinutes: statsData?.longestWaitMinutes || 0,
  };

  const handleCallNext = () => {
    onAction?.({
      type: 'CALL_NEXT_PATIENT',
      timestamp: new Date(),
    });
  };

  const handleViewQueue = () => {
    onAction?.({
      type: 'VIEW_QUEUE',
      timestamp: new Date(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Activity className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading queue...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600 text-sm">
        <p>Failed to load queue stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary Action - Call Next Patient */}
      <button
        onClick={handleCallNext}
        disabled={queueStats.waiting === 0}
        className={cn(
          'w-full py-4 px-6 rounded-lg font-semibold text-white',
          'flex items-center justify-center gap-3',
          'transition-all duration-200',
          queueStats.waiting > 0
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
            : 'bg-gray-300 cursor-not-allowed'
        )}
      >
        <PhoneCall className="h-5 w-5" />
        <span className="text-lg">
          Call Next Patient
        </span>
        {queueStats.waiting > 0 && (
          <span className="ml-2 px-2.5 py-0.5 bg-white/20 rounded-full text-sm">
            {queueStats.waiting} waiting
          </span>
        )}
      </button>

      {/* Queue Statistics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Waiting */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Waiting</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{queueStats.waiting}</div>
        </div>

        {/* Called */}
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <PhoneCall className="h-4 w-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-900">Called</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700">{queueStats.called}</div>
        </div>

        {/* In Progress */}
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-900">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">{queueStats.inProgress}</div>
        </div>

        {/* Completed */}
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-900">Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{queueStats.completed}</div>
        </div>
      </div>

      {/* Wait Time Statistics */}
      {size !== 'small' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">Avg. Wait</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {queueStats.averageWaitMinutes} min
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">Longest Wait</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {queueStats.longestWaitMinutes} min
            </div>
          </div>
        </div>
      )}

      {/* View Full Queue Button */}
      <button
        onClick={handleViewQueue}
        className="w-full py-2 px-4 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
      >
        View Full Queue
      </button>
    </div>
  );
}
