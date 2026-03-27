/**
 * Active Session Widget
 * Displays session timer, type, and stage progress
 */

'use client';

import React, {useState, useEffect } from 'react';
import {
  Clock,
  Clock as Play,
  Clock as Pause,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps, SessionStage } from '@/lib/widgets/widget-types';
import { getApi } from '@/lib/api';

// Session stage display names and progress
const STAGE_INFO: Record<SessionStage, { name: string; step: number; total: number; color: string }> = {
  queue: { name: 'In Queue', step: 0, total: 8, color: 'gray' },
  initial: { name: 'Initial Consultation', step: 1, total: 8, color: 'blue' },
  'clinical-review': { name: 'Clinical Review', step: 2, total: 8, color: 'blue' },
  'package-selection': { name: 'Package Selection', step: 3, total: 8, color: 'indigo' },
  'iol-selection': { name: 'IOL Selection', step: 4, total: 8, color: 'indigo' },
  financial: { name: 'Financial Counseling', step: 5, total: 8, color: 'green' },
  consent: { name: 'Consent Signing', step: 6, total: 8, color: 'purple' },
  'pre-surgery': { name: 'Pre-Surgery Planning', step: 6, total: 8, color: 'purple' },
  scheduling: { name: 'Scheduling', step: 7, total: 8, color: 'orange' },
  admission: { name: 'Admission Planning', step: 7, total: 8, color: 'orange' },
  followup: { name: 'Follow-up', step: 8, total: 8, color: 'teal' },
  'post-operative-care': { name: 'Post-Op Care', step: 8, total: 8, color: 'purple' },
  'follow-up-scheduling': { name: 'Follow-Up Scheduling', step: 8, total: 8, color: 'pink' },
  'outcome-tracking': { name: 'Outcome Tracking', step: 8, total: 8, color: 'indigo' },
  completed: { name: 'Completed', step: 8, total: 8, color: 'green' },
};

export default function ActiveSessionWidget({
  sessionId,
  sessionStage,
  data,
  onAction,
}: WidgetProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session data from API
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getApi().get(`/counseling/sessions/${sessionId}`);
      setSession(response.data);
    } catch (err: any) {
      console.error('Failed to load session:', err);
      setError(err.message || 'Failed to load session data');
      // Fallback to mock data
      setSession({
        id: sessionId,
        sessionNumber: 'CS-001',
        sessionType: 'Initial Consultation',
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        status: 'in-progress',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate elapsed time
  useEffect(() => {
    if (!sessionId || isPaused || !session) return;

    const interval = setInterval(() => {
      const start = session.startTime ? new Date(session.startTime).getTime() : Date.now();
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, session, isPaused]);

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Activity className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No active session</p>
        <p className="text-xs text-gray-400 mt-1">Start a session to track progress</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Activity className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading session...</span>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadSessionData}
          className="mt-3 text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Activity className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No session data</p>
      </div>
    );
  }

  const stageInfo = STAGE_INFO[sessionStage];
  const progressPercent = (stageInfo.step / stageInfo.total) * 100;

  // Format elapsed time as HH:MM:SS
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    onAction?.({
      type: isPaused ? 'RESUME_SESSION' : 'PAUSE_SESSION',
      timestamp: new Date(),
    });
  };

  const handleCompleteStage = () => {
    onAction?.({
      type: 'COMPLETE_STAGE',
      payload: { currentStage: sessionStage },
      timestamp: new Date(),
    });
  };

  return (
    <div className="space-y-4">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">Session {session.sessionNumber}</p>
          <p className="text-sm font-semibold text-gray-900">{session.sessionType}</p>
        </div>
        <div className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          session.status === 'in-progress' && 'bg-green-100 text-green-700',
          session.status === 'paused' && 'bg-yellow-100 text-yellow-700',
          session.status === 'completed' && 'bg-gray-100 text-gray-700'
        )}>
          {isPaused ? 'Paused' : 'Active'}
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'h-5 w-5',
            isPaused ? 'text-yellow-600' : 'text-blue-600'
          )} />
          <span className="text-2xl font-mono font-bold text-gray-900">
            {timeString}
          </span>
        </div>
        <button
          onClick={handlePauseResume}
          className={cn(
            'p-2 rounded-full transition-colors',
            isPaused
              ? 'bg-green-100 hover:bg-green-200 text-green-700'
              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
          )}
          title={isPaused ? 'Resume session' : 'Pause session'}
        >
          {isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Stage Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            {stageInfo.name}
          </span>
          <span className="text-gray-500">
            Step {stageInfo.step} of {stageInfo.total}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'absolute top-0 left-0 h-full rounded-full transition-all duration-500',
              `bg-${stageInfo.color}-500`
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{Math.round(progressPercent)}% complete</span>
          {stageInfo.step < stageInfo.total && (
            <button
              onClick={handleCompleteStage}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Complete Stage
            </button>
          )}
        </div>
      </div>

      {/* Stage Milestones (Compact) */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
          <div
            key={step}
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all',
              step < stageInfo.step
                ? 'bg-green-500 text-white'
                : step === stageInfo.step
                ? `bg-${stageInfo.color}-500 text-white ring-2 ring-${stageInfo.color}-300`
                : 'bg-gray-200 text-gray-500'
            )}
            title={`Step ${step}`}
          >
            {step < stageInfo.step ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              step
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {elapsedSeconds > 1800 && ( // Show warning after 30 minutes
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800">
            Session duration: {Math.floor(elapsedSeconds / 60)} minutes. Consider completing or pausing if needed.
          </p>
        </div>
      )}
    </div>
  );
}
