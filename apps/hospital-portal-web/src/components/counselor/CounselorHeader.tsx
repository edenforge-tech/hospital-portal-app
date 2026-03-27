/**
 * Counselor Header Component
 * Unified header with queue stats, actions, and user info
 */

'use client';

import React from 'react';
import { Clock, Phone, Activity, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';

interface CounselorHeaderProps {
  waitingCount: number;
  calledCount: number;
  inProgressCount: number;
  completedCount: number;
  onCallNext: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function CounselorHeader({
  waitingCount,
  calledCount,
  inProgressCount,
  completedCount,
  onCallNext,
  onRefresh,
  isRefreshing = false,
  className,
}: CounselorHeaderProps) {
  const { user } = useAuthStore();

  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      {/* Top Bar - Title and User Info */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">🏥 Counselor Workspace</h1>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
            Live
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Activity className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Menu */}
          <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.userName || 'User'}</p>
              <p className="text-xs text-gray-500">Counselor</p>
            </div>
            <span className="text-xs">▼</span>
          </div>
        </div>
      </div>

      {/* Stats and Actions Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Queue Stats */}
          <div className="flex items-center gap-6">
            {/* Waiting */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-100 rounded-lg">
                <Clock className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-600">{waitingCount}</p>
                <p className="text-xs text-gray-600 font-medium">Waiting</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* Called */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-100 rounded-lg">
                <Phone className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{calledCount}</p>
                <p className="text-xs text-gray-600 font-medium">Called</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* In Progress */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{inProgressCount}</p>
                <p className="text-xs text-gray-600 font-medium">In Progress</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-gray-200"></div>

            {/* Completed Today */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                <p className="text-xs text-gray-600 font-medium">Completed Today</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg',
                'text-sm font-medium text-gray-700 bg-white hover:bg-gray-50',
                'transition-all duration-200',
                isRefreshing && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Activity className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh
            </button>

            {/* Call Next Patient Button */}
            <button
              onClick={onCallNext}
              disabled={waitingCount === 0}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg',
                'text-sm font-semibold text-white',
                'transition-all duration-200 shadow-md hover:shadow-lg',
                waitingCount > 0
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  : 'bg-gray-300 cursor-not-allowed'
              )}
            >
              <Phone className="h-4 w-4" />
              Call Next Patient
              {waitingCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {waitingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
