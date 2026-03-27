'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useCounselingQueue, useCounselingQueueStats, useCounselingSessions } from '@/hooks/use-counseling-sessions';
import { useFollowUps } from '@/hooks/use-follow-ups';
import { useQueueUpdates } from '@/hooks/useQueueUpdates';
import { QueueWidget } from '@/components/counselor/workspace/QueueWidget';
import { FollowUpsWidget } from '@/components/counselor/workspace/FollowUpsWidget';
import { RecentSessionsWidget } from '@/components/counselor/workspace/RecentSessionsWidget';
import { QuickActionsWidget } from '@/components/counselor/workspace/QuickActionsWidget';
import { AudioRecorderPanel } from '@/components/counselor/AudioRecorderPanel';
import { ErrorBoundaryWrapper } from '@/components/common/WidgetErrorBoundary';
import { 
  QueueWidgetSkeleton, 
  FollowUpsWidgetSkeleton, 
  RecentSessionsWidgetSkeleton, 
  QuickActionsWidgetSkeleton 
} from '@/components/common/LoadingSkeletons';
import { useCounselorWorkspaceShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Activity as RotateCw, Activity as Grid3x3, Activity as Wifi, Activity as WifiOff, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { startSessionFromQueue, getCounselingQueueItem } from '@/lib/api/counseling-queue.api';

/**
 * Counselor Workspace - Unified Dashboard
 * Overview page showing key metrics, queue status, follow-ups, and quick actions
 * Phase 4.1: Real-time SignalR updates (instant push instead of polling)
 */
export default function CounselorWorkspacePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Session recording state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionNumber, setActiveSessionNumber] = useState<string | null>(null);
  const [recordingActive, setRecordingActive] = useState(false);
  
  // Enable keyboard shortcuts
  useCounselorWorkspaceShortcuts();
  
  // Enable real-time SignalR updates (Phase 4.1)
  const { isConnected, connectionError } = useQueueUpdates();
  
  // Fetch data for widgets
  // Note: Polling disabled when SignalR connected (real-time push updates instead)
  const { 
    data: queueItems = [], 
    isLoading: queueLoading,
    refetch: refetchQueue 
  } = useCounselingQueue(
    user?.branchId || '', // Pass empty string if no branchId (backend will fetch all for tenant)
    { status: 'Waiting' },
    { 
      enabled: true, // Always enabled - backend handles empty branchId
      refetchInterval: isConnected ? false : 10 * 1000, // Disable polling when SignalR connected
    }
  );
  
  const { 
    data: queueStats,
    isLoading: statsLoading 
  } = useCounselingQueueStats(
    user?.branchId || '', // Pass empty string if no branchId
    undefined,
    { 
      enabled: true, // Always enabled
      refetchInterval: isConnected ? false : 30 * 1000, // Disable polling when SignalR connected
    }
  );
  
  // Get follow-ups for the next 7 days
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const { 
    data: followUpsData,
    isLoading: followUpsLoading 
  } = useFollowUps({
    status: 'scheduled',
    fromDate: today.toISOString().split('T')[0],
    toDate: nextWeek.toISOString().split('T')[0],
  });
  
  const followUps = followUpsData?.followUps || [];
  
  // Get recent sessions (last 10)
  const { 
    data: sessionsData,
    isLoading: sessionsLoading 
  } = useCounselingSessions(
    { 
      pageNumber: 1, 
      pageSize: 10
    }
  );
  
  const recentSessions = sessionsData?.sessions || [];
  
  // Calculate queue statistics
  const waitingCount = queueItems.filter((i: any) => i.queueStatus === 'Waiting').length;
  const calledCount = queueItems.filter((i: any) => i.queueStatus === 'Called').length;
  const inProgressCount = queueItems.filter((i: any) => i.queueStatus === 'InProgress').length;
  const completedCount = queueItems.filter((i: any) => i.queueStatus === 'Completed').length;
  
  // Handle starting session from queue (triggers audio recording)
  const handleStartSession = async (queueItemId: string) => {
    console.log('🎬 Starting session for queue item:', queueItemId);
    
    try {
      // Get queue item details first
      const queueItem = await getCounselingQueueItem(queueItemId);
      console.log('📋 Queue item details:', queueItem);
      
      if (!queueItem) {
        toast.error('Queue item not found');
        return;
      }
      
      // Start session from queue via backend API
      const result = await startSessionFromQueue(queueItemId, {
        queueItemId,
        counselorId: user?.id || '',
      });
      
      console.log('✅ Session start result:', result);
      
      if (result.success && result.sessionId) {
        setActiveSessionId(result.sessionId);
        setActiveSessionNumber(queueItem.sessionNumber || queueItem.tokenNumber);
        setRecordingActive(true);
        
        console.log('🎙️ Recording activated for session:', result.sessionId);
        
        toast.success(`Session started for ${queueItem.patientName || 'Patient'}`);
        
        // Refetch queue to update status
        refetchQueue();
      } else {
        toast.error(result.message || 'Failed to start session');
      }
    } catch (error: any) {
      console.error('❌ Error starting session:', error);
      toast.error('Failed to start session. Please try again.');
    }
  };
  
  // Handle refresh all data
  const handleRefreshAll = async () => {
    toast.promise(
      Promise.all([
        refetchQueue(),
        // Add other refetch calls if available
      ]),
      {
        loading: 'Refreshing dashboard...',
        success: 'Dashboard updated',
        error: 'Failed to refresh dashboard',
      }
    );
  };
  
  // Handle recording complete
  const handleRecordingComplete = (audioUrl: string) => {
    console.log('Recording completed:', audioUrl);
    // Recording auto-uploaded by AudioRecorderPanel
  };
  
  // Handle complete session
  const handleCompleteSession = () => {
    if (activeSessionId) {
      router.push(`/dashboard/counselor/sessions/${activeSessionId}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Grid3x3 className="h-8 w-8 text-cyan-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Counselor Workspace</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user?.firstName || 'Counselor'} • {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Real-time Connection Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600 animate-pulse" />
                    <span className="text-xs font-medium text-green-700">Live Updates</span>
                  </>
                ) : connectionError ? (
                  <>
                    <WifiOff className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Polling Mode</span>
                  </>
                ) : (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                    <span className="text-xs font-medium text-gray-600">Connecting...</span>
                  </>
                )}
              </div>
              
              {/* Active Session Recording Panel */}
              {activeSessionId && recordingActive && (
                <AudioRecorderPanel
                  sessionId={activeSessionId}
                  sessionNumber={activeSessionNumber || undefined}
                  autoStart={true}
                  onRecordingComplete={handleRecordingComplete}
                  onError={(error) => console.error('Recording error:', error)}
                />
              )}
              
              {/* Session Controls (when session active) */}
              {activeSessionId && (
                <button
                  onClick={handleCompleteSession}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Activity className="h-4 w-4" />
                  View Session
                </button>
              )}
              
              <button
                onClick={handleRefreshAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Grid - 4 columns on large screens, responsive on smaller screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Queue Widget - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <ErrorBoundaryWrapper fallbackMessage="Failed to load queue widget">
              {queueLoading || statsLoading ? (
                <QueueWidgetSkeleton />
              ) : (
                <QueueWidget
                  queueItems={queueItems as any}
                  stats={{
                    waiting: waitingCount,
                    called: calledCount,
                    inProgress: inProgressCount,
                    completed: completedCount,
                  }}
                  isLoading={queueLoading || statsLoading}
                  onViewQueue={() => router.push('/dashboard/counselor/queue')}
                  onStartSession={handleStartSession}
                />
              )}
            </ErrorBoundaryWrapper>
          </div>
          
          {/* Quick Actions Widget - 1 column */}
          <div className="xl:col-span-1">
            <ErrorBoundaryWrapper fallbackMessage="Failed to load quick actions">
              <QuickActionsWidget
                onNewSession={() => router.push('/dashboard/counselor')}
                onScheduleFollowUp={() => router.push('/dashboard/counselor/follow-ups')}
                onViewSessions={() => router.push('/dashboard/counselor/sessions')}
                onManageAdmissions={() => router.push('/dashboard/counselor/admissions')}
              />
            </ErrorBoundaryWrapper>
          </div>
          
          {/* Follow-ups Widget - 1 column */}
          <div className="xl:col-span-1">
            <ErrorBoundaryWrapper fallbackMessage="Failed to load follow-ups widget">
              {followUpsLoading ? (
                <FollowUpsWidgetSkeleton />
              ) : (
                <FollowUpsWidget
                  followUps={followUps}
                  isLoading={followUpsLoading}
                  onViewAll={() => router.push('/dashboard/counselor/follow-ups')}
                />
              )}
            </ErrorBoundaryWrapper>
          </div>
          
          {/* Recent Sessions Widget - Takes full width on second row */}
          <div className="xl:col-span-4">
            <ErrorBoundaryWrapper fallbackMessage="Failed to load recent sessions">
              {sessionsLoading ? (
                <RecentSessionsWidgetSkeleton />
              ) : (
                <RecentSessionsWidget
                  sessions={recentSessions as any}
                  isLoading={sessionsLoading}
                  onViewSession={(sessionId: string) => router.push(`/dashboard/counselor/sessions/${sessionId}`)}
                  onViewAll={() => router.push('/dashboard/counselor/sessions')}
                />
              )}
            </ErrorBoundaryWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
