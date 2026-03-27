/**
 * Multi-OR Dashboard
 * Real-time status board for all operation theaters with live surgery tracking
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity, CheckCircle, AlertCircle, XCircle, Users } from 'lucide-react';
import { useTheaters, useSchedulesByDateRange } from '@/hooks/use-surgery-scheduling';
import type { OTScheduleDto, OTTheaterDto, ScheduleStatus } from '@/types/surgery-scheduling';

interface MultiORDashboardProps {
  branchId?: string;
  autoRefresh?: boolean;
  refreshIntervalSeconds?: number;
}

interface TheaterStatus {
  theater: OTTheaterDto;
  currentSurgery?: OTScheduleDto;
  nextSurgery?: OTScheduleDto;
  todaySchedules: OTScheduleDto[];
  completedCount: number;
  remainingCount: number;
  status: 'Idle' | 'InProgress' | 'Cleaning' | 'Maintenance' | 'Offline';
  estimatedAvailableAt?: string;
}

export function MultiORDashboard({ branchId, autoRefresh = true, refreshIntervalSeconds = 30 }: MultiORDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto-refresh current time every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, refreshIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalSeconds]);

  // Fetch all theaters
  const { data: theaters = [], isLoading: loadingTheaters } = useTheaters({ branchId });

  // Fetch today's schedules
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const endOfDay = useMemo(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  }, []);

  const { data: schedules = [], isLoading: loadingSchedules, refetch } = useSchedulesByDateRange(today, endOfDay, {});

  // Calculate theater statuses
  const theaterStatuses = useMemo((): TheaterStatus[] => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;

    return theaters.map((theater) => {
      const theaterSchedules = schedules
        .filter((s) => s.theaterId === theater.id && s.status !== 'Cancelled' && s.status !== 'NoShow')
        .sort((a, b) => parseTimeSpan(a.startTime) - parseTimeSpan(b.startTime));

      const completedSchedules = theaterSchedules.filter((s) => s.status === 'Completed');
      const remainingSchedules = theaterSchedules.filter((s) => s.status !== 'Completed');

      // Find current surgery (InProgress)
      let currentSurgery = theaterSchedules.find((s) => s.status === 'InProgress');

      // If no InProgress, check if any confirmed surgery should be running now
      if (!currentSurgery) {
        currentSurgery = theaterSchedules.find((s) => {
          if (s.status !== 'Confirmed' && s.status !== 'Booked') return false;

          const start = parseTimeSpan(s.startTime);
          const end = parseTimeSpan(s.endTime);

          return start <= currentMinutes && currentMinutes < end;
        });
      }

      // Find next surgery
      let nextSurgery: OTScheduleDto | undefined;
      if (currentSurgery) {
        const currentEnd = parseTimeSpan(currentSurgery.endTime);
        nextSurgery = theaterSchedules.find((s) => {
          if (s.id === currentSurgery!.id) return false;
          if (s.status === 'Completed' || s.status === 'InProgress') return false;
          return parseTimeSpan(s.startTime) >= currentEnd;
        });
      } else {
        nextSurgery = theaterSchedules.find((s) => {
          if (s.status === 'Completed' || s.status === 'InProgress') return false;
          return parseTimeSpan(s.startTime) > currentMinutes;
        });
      }

      // Determine theater status
      let status: TheaterStatus['status'] = 'Idle';
      let estimatedAvailableAt: string | undefined;

      if (theater.maintenanceMode) {
        status = 'Maintenance';
      } else if (!theater.isOperational) {
        status = 'Offline';
      } else if (currentSurgery) {
        status = 'InProgress';
        estimatedAvailableAt = currentSurgery.endTime;
      } else if (completedSchedules.length > 0 && remainingSchedules.length > 0) {
        // Between surgeries - cleaning
        status = 'Cleaning';
        estimatedAvailableAt = nextSurgery?.startTime;
      }

      return {
        theater,
        currentSurgery,
        nextSurgery,
        todaySchedules: theaterSchedules,
        completedCount: completedSchedules.length,
        remainingCount: remainingSchedules.length,
        status,
        estimatedAvailableAt,
      };
    });
  }, [theaters, schedules, currentTime]);

  // Statistics
  const stats = useMemo(() => {
    return {
      totalTheaters: theaters.length,
      inProgress: theaterStatuses.filter((t) => t.status === 'InProgress').length,
      idle: theaterStatuses.filter((t) => t.status === 'Idle').length,
      maintenance: theaterStatuses.filter((t) => t.status === 'Maintenance').length,
      totalSurgeries: schedules.length,
      completedSurgeries: schedules.filter((s) => s.status === 'Completed').length,
      inProgressSurgeries: schedules.filter((s) => s.status === 'InProgress').length,
    };
  }, [theaters, theaterStatuses, schedules]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Multi-OR Dashboard - Real-Time Status
          </CardTitle>

          <div className="flex items-center gap-4">
            {/* Current Time */}
            <div className="text-sm text-gray-600">
              <Clock className="inline h-4 w-4 mr-1" />
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Theaters</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalTheaters}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Idle</div>
            <div className="text-2xl font-bold text-green-600">{stats.idle}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Surgeries Today</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalSurgeries}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.completedSurgeries} / {stats.totalSurgeries}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loadingTheaters || loadingSchedules ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading OR status...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {theaterStatuses.map((theaterStatus) => (
              <TheaterStatusCard key={theaterStatus.theater.id} theaterStatus={theaterStatus} currentTime={currentTime} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface TheaterStatusCardProps {
  theaterStatus: TheaterStatus;
  currentTime: Date;
}

function TheaterStatusCard({ theaterStatus, currentTime }: TheaterStatusCardProps) {
  const { theater, currentSurgery, nextSurgery, todaySchedules, completedCount, remainingCount, status, estimatedAvailableAt } = theaterStatus;

  const statusConfig = {
    Idle: { color: 'bg-green-100 border-green-500 text-green-700', icon: CheckCircle, label: 'Idle' },
    InProgress: { color: 'bg-purple-100 border-purple-500 text-purple-700', icon: Activity, label: 'Surgery in Progress' },
    Cleaning: { color: 'bg-blue-100 border-blue-500 text-blue-700', icon: Clock, label: 'Cleaning' },
    Maintenance: { color: 'bg-yellow-100 border-yellow-500 text-yellow-700', icon: AlertCircle, label: 'Maintenance' },
    Offline: { color: 'bg-red-100 border-red-500 text-red-700', icon: XCircle, label: 'Offline' },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  // Calculate progress
  const progressPercentage = todaySchedules.length > 0 ? Math.round((completedCount / todaySchedules.length) * 100) : 0;

  return (
    <div className={`border-2 rounded-lg p-4 ${config.color}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-lg">{theater.theaterName}</div>
          <div className="text-xs text-gray-600 mt-1">
            {theater.locationDescription} • Floor {theater.floorNumber}
          </div>
        </div>
        <Badge className={`${config.color} flex items-center gap-1`}>
          <IconComponent className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {/* Current Surgery */}
      {currentSurgery && (
        <div className="bg-white rounded-lg p-3 mb-3 border-2 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-purple-700">🔴 Current Surgery</div>
            <Badge className="text-xs">{currentSurgery.status}</Badge>
          </div>
          <div className="space-y-1 text-sm">
            <div className="font-medium">{currentSurgery.surgeryType}</div>
            <div className="text-gray-600">
              <Clock className="inline h-3 w-3 mr-1" />
              {currentSurgery.startTime.slice(0, 5)} - {currentSurgery.endTime.slice(0, 5)} ({currentSurgery.durationMinutes} min)
            </div>
            <div className="text-gray-600">
              <Users className="inline h-3 w-3 mr-1" />
              Surgeon ID: {currentSurgery.surgeonId.slice(0, 8)}...
            </div>
            {currentSurgery.eyeOperated && (
              <div className="text-gray-600">Eye: {currentSurgery.eyeOperated}</div>
            )}
          </div>
        </div>
      )}

      {/* Next Surgery */}
      {nextSurgery && (
        <div className="bg-white rounded-lg p-3 mb-3 border">
          <div className="text-sm font-semibold text-blue-700 mb-2">📝 Next Surgery</div>
          <div className="space-y-1 text-sm">
            <div className="font-medium">{nextSurgery.surgeryType}</div>
            <div className="text-gray-600">
              <Clock className="inline h-3 w-3 mr-1" />
              {nextSurgery.startTime.slice(0, 5)} - {nextSurgery.endTime.slice(0, 5)}
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Today's Progress</span>
          <span>
            {completedCount} / {todaySchedules.length} surgeries
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              status === 'InProgress' ? 'bg-purple-500' : status === 'Idle' ? 'bg-green-500' : 'bg-gray-400'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Estimated Availability */}
      {estimatedAvailableAt && (
        <div className="text-xs text-gray-600 mt-2">
          <Clock className="inline h-3 w-3 mr-1" />
          Available at: <span className="font-semibold">{estimatedAvailableAt.slice(0, 5)}</span>
        </div>
      )}

      {/* Maintenance Message */}
{theater.maintenanceMode && theater.maintenanceReason && (
        <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 rounded p-2">
          ⚠️ {theater.maintenanceReason}
        </div>
      )}

      {/* Remaining Surgeries */}
      {remainingCount > 0 && !currentSurgery && !nextSurgery && (
        <div className="mt-2 text-xs text-gray-600">
          {remainingCount} {remainingCount === 1 ? 'surgery' : 'surgeries'} scheduled for later
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseTimeSpan(timeStr: string): number {
  // Parse "HH:mm:ss" to minutes since midnight
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
