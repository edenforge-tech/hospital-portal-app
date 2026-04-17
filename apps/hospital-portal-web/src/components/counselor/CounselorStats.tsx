/**
 * Counselor Stats Component
 * Displays today's performance metrics and recent sessions
 */

'use client';

import React from 'react';
import { Clock, CheckCircle, TrendingUp, DollarSign, Activity, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentSession {
  id: string;
  patientName: string;
  mrn: string;
  completedAt: string;
  duration: number; // minutes
  outcome: 'completed' | 'referred' | 'pending-review';
  packageSelected?: string;
  amount?: number;
}

interface CounselorStatsProps {
  todayStats: {
    completedSessions: number;
    avgDurationMinutes: number;
    totalRevenue: number;
    patientsReferred: number;
  };
  recentSessions: RecentSession[];
  className?: string;
}

export function CounselorStats({
  todayStats,
  recentSessions,
  className,
}: CounselorStatsProps) {
  
  // Get outcome icon and color
  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'completed':
        return { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
      case 'referred':
        return { Icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' };
      default:
        return { Icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' };
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Today's Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Completed Sessions */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.completedSessions}</p>
          <p className="text-xs text-gray-500 mt-0.5">sessions today</p>
        </div>

        {/* Average Duration */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Avg Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.avgDurationMinutes}m</p>
          <p className="text-xs text-gray-500 mt-0.5">per session</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-gray-600">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{(todayStats.totalRevenue / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-500 mt-0.5">collected today</p>
        </div>

        {/* Patients Referred */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">Referred</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.patientsReferred}</p>
          <p className="text-xs text-gray-500 mt-0.5">to specialists</p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">
            📋 Recent Sessions
            <span className="ml-2 text-gray-500">({recentSessions.length})</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
          {recentSessions.length === 0 ? (
            <div className="p-6 text-center">
              <Activity className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No recent sessions</p>
              <p className="text-xs text-gray-400 mt-1">Completed sessions will appear here</p>
            </div>
          ) : (
            recentSessions.map((session) => {
              const outcomeConfig = getOutcomeIcon(session.outcome);
              const Icon = outcomeConfig.Icon;

              return (
                <div key={session.id} className="p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {session.patientName}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mb-1">{session.mrn}</p>
                      
                      {session.packageSelected && (
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          {session.packageSelected}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration}m
                        </span>
                        {session.amount && (
                          <span className="font-semibold text-emerald-600">
                            ₹{session.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Outcome & Time */}
                    <div className="flex flex-col items-end gap-1 ml-3">
                      <div className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                        outcomeConfig.bg,
                        outcomeConfig.color
                      )}>
                        <Icon className="h-3 w-3" />
                        <span className="capitalize">
                          {session.outcome.replace('-', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(session.completedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
