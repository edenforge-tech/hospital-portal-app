/**
 * Recent Activity Timeline
 * Shows last 5 completed sessions
 * Created: March 6, 2026
 */

'use client';

import React from 'react';
import { CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RecentSession {
  id: string;
  patientName: string;
  mrn: string;
  completedAt: string; // ISO datetime
  durationMinutes: number;
  outcome: 'completed' | 'referred' | 'pending-review';
  procedureType?: string;
  packageAmount?: number;
}

interface RecentActivityProps {
  sessions: RecentSession[];
  isLoading?: boolean;
}

export function RecentActivity({ sessions, isLoading = false }: RecentActivityProps) {
  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Get outcome badge
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' };
      case 'referred':
        return { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Referred' };
      default:
        return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Pending' };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">📋 Recent Activity</h3>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          📋 Recent Activity
          <span className="text-xs text-gray-500 font-normal">({sessions.length})</span>
        </h3>
      </div>

      {/* Sessions List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-900 mb-1">No recent sessions</p>
            <p className="text-xs text-gray-500">
              Completed sessions will appear here
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const badge = getOutcomeBadge(session.outcome);
            const Icon = badge.icon;

            return (
              <div
                key={session.id}
                className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Outcome Icon */}
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', badge.bg)}>
                    <Icon className={cn('h-4 w-4', badge.color)} />
                  </div>

                  {/* Session Details */}
                  <div className="flex-1 min-w-0">
                    {/* Patient Name + Time */}
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {session.patientName}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTimeAgo(session.completedAt)}
                      </span>
                    </div>

                    {/* MRN */}
                    <p className="text-xs text-gray-500 font-mono mb-1">{session.mrn}</p>

                    {/* Procedure + Amount */}
                    <div className="flex items-center justify-between">
                      {session.procedureType && (
                        <p className="text-xs text-blue-600 font-medium">
                          {session.procedureType}
                        </p>
                      )}
                      {session.packageAmount && (
                        <p className="text-xs font-bold text-emerald-600 ml-2">
                          ₹{session.packageAmount.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Outcome Badge + Duration */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        badge.bg,
                        badge.color
                      )}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        ⏱️ {session.durationMinutes}m
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {sessions.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View Full History →
          </button>
        </div>
      )}
    </div>
  );
}
