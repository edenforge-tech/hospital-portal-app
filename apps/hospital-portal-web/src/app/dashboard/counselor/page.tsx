'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCounselingQueue, useCounselingQueueStats, useCallNextPatient, useStartQueueSession, useCreateCounselingSession, useStartCounselingSession, counselingQueueKeys } from '@/hooks/use-counseling-sessions';
import { startSessionFromQueue } from '@/lib/api/counseling-queue.api';
import { useQueryClient } from '@tanstack/react-query';
import { CallNextPatientModal } from '@/components/counselor/CallNextPatientModal';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';
import { Activity, AlertCircle } from 'lucide-react';
// Existing layout components
import { CounselorHeaderNew, type CounselorTab } from '@/components/counselor/CounselorHeaderNew';
import { PatientSearchBarEnhanced } from '@/components/counselor/PatientSearchBarEnhanced';
// â”€â”€ New enhanced dashboard components (March 10, 2026 redesign) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { CounselorSmartStats, type CounselorQueueStats } from '@/components/counselor/CounselorSmartStats';
import { EnhancedQueueCard, type EnhancedPatientData } from '@/components/counselor/EnhancedQueueCard';
import { DailyGoalWidget } from '@/components/counselor/DailyGoalWidget';
import { PendingActionsWidget, type PendingAction } from '@/components/counselor/PendingActionsWidget';
import { ConversionBreakdown, type ConversionData } from '@/components/counselor/ConversionBreakdown';
import { SurgeryConfirmedTab } from '@/components/counselor/SurgeryConfirmedTab';
import { SurgeryFollowupTab } from '@/components/counselor/SurgeryFollowupTab';
import { CounselorAnalyticsTab } from '@/components/counselor/CounselorAnalyticsTab';
import { useSurgeryConfirmed } from '@/hooks/use-surgery-confirmed';
import { usePendingDecisions } from '@/hooks/use-pending-decisions';

/**
 * Counselor Dashboard — Queue & Stats Workspace
 * Shows assigned patients, smart stats, and navigates to session pages.
 */

/**
 * Counselor dashboard â€” queue view only.
 * Session workflow opens as a dedicated page (/dashboard/counselor/sessions/[id]).
 */
function CounselorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, tenantId: storeTenantId } = useAuthStore();

  // Local state
  const [showCallNextModal, setShowCallNextModal] = useState(false);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CounselorTab>('queue');

  // Deep-link: ?tab=surgery-confirmed&scheduleId=X&panel=coordination
  // (fired when user clicks a SurgeryConfirmed / DeptCoordResponse notification toast)
  const deepLinkScheduleId = searchParams.get('scheduleId') ?? undefined;
  const deepLinkPanel     = searchParams.get('panel') ?? undefined;
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'surgery-confirmed') {
      setActiveTab('surgery-confirmed');
    }
  }, []);  // run once on mount — intentionally omit searchParams to avoid re-running on every keystroke
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  // â”€â”€ New state for enhanced dashboard (March 10, 2026) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [queueStatusFilter, setQueueStatusFilter] = useState<string>('All');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Queue data - fetch ALL items to calculate proper stats (don't filter by status)
  const { data: queueItems = [], isLoading: queueLoading } = useCounselingQueue(
    user?.branchId || '', 
    undefined // Don't filter - get all items for accurate stats
  );
  
  // Filter to show only assigned patients for current counselor
  // Handle both camelCase and snake_case property names from backend
  const assignedPatients = (() => {
    const filtered = queueItems.filter((item: any) => {
      const counselorId = item.assignedCounselorId || item.assigned_counselor_id || item.counselorId;
      const matches = counselorId === user?.id;
      console.log('ðŸ” [Filter] Checking queue item:', { 
        patientName: item.patientName,
        assignedCounselorId: counselorId,
        currentUserId: user?.id,
        matches 
      });
      return matches;
    });
    // Fallback: if no items are assigned to me but queue has items, show all
    // (handles case where counselor_id not set or user ID mismatch in dev)
    if (filtered.length === 0 && queueItems.length > 0) {
      console.warn('âš ï¸ [Filter] No patients assigned to current user â€” showing all queue items as fallback');
      return queueItems;
    }
    return filtered;
  })();
  
  // Only fetch stats when branchId exists (prevents 400 error with empty ID)
  const { data: queueStats } = useCounselingQueueStats(
    user?.branchId || '', 
    undefined
  );
  const queryClient = useQueryClient();
  const callNextMutation = useCallNextPatient();
  const startQueueSessionMutation = useStartQueueSession();
  const createSessionMutation = useCreateCounselingSession();
  const startSessionMutation = useStartCounselingSession();

  // Badge counts for new tabs
  const { data: confirmedPatients = [] } = useSurgeryConfirmed(user?.branchId, 'upcoming');
  const { data: pendingPatients = [] } = usePendingDecisions(user?.branchId);
  const confirmedCount = confirmedPatients.length;
  const followupCount = pendingPatients.length;
  
  // Calculate derived stats - ONLY for assigned patients
  const waitingCount = assignedPatients.filter((i: any) => (i.queueStatus || i.status) === 'Waiting').length;
  const calledCount = assignedPatients.filter((i: any) => (i.queueStatus || i.status) === 'Called').length;
  const inProgressCount = assignedPatients.filter((i: any) => (i.queueStatus || i.status) === 'InProgress').length;
  const completedCount = assignedPatients.filter((i: any) => (i.queueStatus || i.status) === 'Completed').length;
  
  // Real performance stats derived from queue stats API
  const avgDuration = queueStats?.averageSessionDurationMinutes ?? 0;
  const totalRevenue = 0; // Revenue tracked at billing level - not available in queue stats
  const surgeriesScheduled = 0; // Tracked in surgery scheduling module
  
  /**
   * Handle patient selection from queue.
   *
   * 1. If the queue item is already InProgress and has a linked session →
   *    resume: navigate to /dashboard/counselor/sessions/[id].
   * 2. Otherwise → create session → mark queue item InProgress →
   *    mark session InProgress → navigate to session page.
   */
  const handleSelectPatient = async (queueItem: any) => {
    console.log('ðŸŽ¯ [handleSelectPatient] Queue item:', queueItem);

    const currentStatus = queueItem.queueStatus || queueItem.status || '';
    // 'mock-' = dev mock queue item; 'search-' = patient found via global search (no queue row exist)
    const isMockItem = String(queueItem.id).startsWith('mock-') || String(queueItem.id).startsWith('search-');

    // â”€â”€ Resume an already-active session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const existingSessionId = queueItem.sessionId;
    if (
      (currentStatus === 'InProgress' || currentStatus === 'In Progress') &&
      existingSessionId &&
      !existingSessionId.startsWith('temp-') &&
      !existingSessionId.startsWith('mock-')
    ) {
      console.log('â†© Resuming existing session', existingSessionId);
      toast.success(`Resuming session for ${queueItem.patientName || 'patient'}`);
      router.push(`/dashboard/counselor/sessions/${existingSessionId}`);
      return;
    }

    // â”€â”€ Start a new session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    setIsLoadingSession(true);
    const loadingToast = toast.loading(
      `Starting session for ${queueItem.patientName || 'patient'}â€¦`
    );

    try {
      const tenantId = storeTenantId || user?.tenantId || queueItem.tenantId || '';
      const counselorId = user?.id || '';

      // Step 1 â€” create (or reuse) counseling session record
      let sessionId: string;
      if (
        existingSessionId &&
        !existingSessionId.startsWith('temp-') &&
        !existingSessionId.startsWith('mock-')
      ) {
        sessionId = existingSessionId;
        console.log('â™»ï¸  Reusing session', sessionId);
      } else {
        const created = await createSessionMutation.mutateAsync({
          tenantId,
          branchId: user?.branchId,
          patientId: queueItem.patientId,
          counselorId,
          referredByDoctorId:
            queueItem.referredByDoctorId || queueItem.doctorId || counselorId,
          sessionType: queueItem.sessionType || 'Initial',
          patientType: queueItem.patientType || 'Cash',
          urgency: queueItem.urgencyLevel || 'Routine',
          sessionDate: new Date().toISOString(),
          addToQueue: false,
        });
        sessionId = created.id;
        console.log('âœ… Session created', sessionId);
      }

      // Step 2 â€” mark queue item as InProgress (skip for mock items)
      if (!isMockItem) {
        try {
          await startSessionFromQueue(queueItem.id, {
            queueItemId: queueItem.id,
            counselorId,
            notes: 'Session started from Counselor Dashboard',
          });
          console.log('âœ… Queue item marked InProgress');
        } catch (qErr) {
          // Non-fatal â€” queue badge will lag until the next 10 s auto-refresh
          console.warn('âš ï¸ Could not mark queue item InProgress:', qErr);
        }
      }

      // Step 3 — mark session as InProgress on the backend
      if (sessionId && !String(sessionId).startsWith('mock-')) {
        try {
          await startSessionMutation.mutateAsync(sessionId);
          console.log('✅ Session marked InProgress');
        } catch (sErr) {
          console.warn('⚠️ Could not mark session InProgress:', sErr);
        }
      }

      // Step 4 â€” invalidate queue cache so the card updates its badge immediately
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.lists() });

      toast.dismiss(loadingToast);
      toast.success(`Session started for ${queueItem.patientName || 'patient'}`);
      router.push(`/dashboard/counselor/sessions/${sessionId}`);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        'Failed to start session';
      toast.error(errMsg);
      console.error('âŒ handleSelectPatient failed:', err?.response?.data || err);
    } finally {
      setIsLoadingSession(false);
    }
  };
  
  /**
   * Handle calling next patient and starting session
   */
  const handleCallAndStart = async (queueItem: any) => {
    if (!user?.id || !user?.branchId) {
      toast.error('User information not available');
      return;
    }

    try {
      // Call the patient (fixing API param name)
      const callResult = await callNextMutation.mutateAsync({
        branchId: user.branchId,
        counselorId: user.id,
        queueType: 'Counselor',
      } as any);

      if (callResult.success) {
        toast.success(`Called ${queueItem.patientName}`);
        
        // Start the session (fixing API param names)
        await startQueueSessionMutation.mutateAsync({
          queueItemId: queueItem.id,
          request: {
            notes: 'Session started from queue',
          } as any
        });

        toast.success('Session started successfully');
        
        // Load patient in workspace
        handleSelectPatient(queueItem);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start session');
      throw error;
    }
  };
  
  // Handle refresh queue
  const handleRefreshQueue = () => {
    // Trigger query refetch
    window.location.reload();
  };

  // â”€â”€ Auto-refresh every 30 seconds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Lightweight refetch â€” rely on React Query's refetch rather than full reload
      // The query hook will refetch automatically via the interval
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // â”€â”€ Filtered queue for smart chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredQueuePatients = (() => {
    if (queueStatusFilter === 'All') return assignedPatients;
    if (queueStatusFilter === 'Waiting') {
      return assignedPatients.filter((p: any) => {
        const s = p.queueStatus || p.status || '';
        return s === 'Waiting';
      });
    }
    if (queueStatusFilter === 'InProgress') {
      return assignedPatients.filter((p: any) => {
        const s = p.queueStatus || p.status || '';
        return s === 'InProgress' || s === 'In Progress';
      });
    }
    if (queueStatusFilter === 'Completed') {
      return assignedPatients.filter((p: any) => {
        const s = p.queueStatus || p.status || '';
        return s === 'Completed';
      });
    }
    if (queueStatusFilter === 'Urgent') {
      return assignedPatients.filter((p: any) => {
        const u = p.urgencyLevel || p.urgency || '';
        return u === 'Critical' || u === 'High' || u === 'Urgent' || u === 'Emergency';
      });
    }
    if (queueStatusFilter === 'FollowUp') {
      return assignedPatients.filter((p: any) => {
        const t = p.sessionType || '';
        return t === 'Followup' || t === 'Follow-up';
      });
    }
    return assignedPatients;
  })();
  // Split filtered queue into active vs completed for separate rendering
  const activeQueuePatients = filteredQueuePatients.filter(
    (p: any) => (p.queueStatus || p.status || '') !== 'Completed'
  );
  const completedQueuePatients = filteredQueuePatients.filter(
    (p: any) => (p.queueStatus || p.status || '') === 'Completed'
  );


  // â”€â”€ Smart stats for the chips bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const smartStats: CounselorQueueStats = {
    waiting: assignedPatients.filter((p: any) => (p.queueStatus || p.status) === 'Waiting').length,
    inProgress: assignedPatients.filter((p: any) => {
      const s = p.queueStatus || p.status || '';
      return s === 'InProgress' || s === 'In Progress';
    }).length,
    completed: completedCount,
    urgent: assignedPatients.filter((p: any) => {
      const u = p.urgencyLevel || p.urgency || '';
      return u === 'Critical' || u === 'High' || u === 'Urgent' || u === 'Emergency';
    }).length,
    avgWaitMinutes: avgDuration,
    sessionTarget: 8, // TODO: fetch from counselor profile / shift settings
    revenueTarget: 200000, // â‚¹2L daily target â€” TODO: fetch from settings
    revenueActual: totalRevenue,
    autoRefresh,
  };

  // Pending actions derived from queue items (surgical consent + financial counseling required)
  const pendingActions: PendingAction[] = [
    ...assignedPatients
      .filter((item: any) =>
        item.requiresSurgicalConsent &&
        (item.queueStatus || item.status) !== 'Completed' &&
        (item.queueStatus || item.status) !== 'Cancelled'
      )
      .map((item: any) => ({
        id: `consent-${item.id}`,
        category: 'consent' as const,
        priority: (item.urgencyLevel === 'Critical' || item.urgencyLevel === 'High') ? 'urgent' as const : 'high' as const,
        title: 'Surgical consent required',
        patientName: item.patientName || 'Patient',
        patientMrn: item.mrn || '',
        dueAt: 'Before surgery',
        actionLabel: 'Get Signature',
      })),
    ...assignedPatients
      .filter((item: any) =>
        item.requiresFinancialCounseling &&
        (item.queueStatus || item.status) !== 'Completed' &&
        (item.queueStatus || item.status) !== 'Cancelled'
      )
      .map((item: any) => ({
        id: `financial-${item.id}`,
        category: 'insurance' as const,
        priority: 'high' as const,
        title: 'Financial counseling pending',
        patientName: item.patientName || 'Patient',
        patientMrn: item.mrn || '',
        dueAt: 'Today',
        actionLabel: 'Start Counseling',
      })),
  ].slice(0, 5);

  // Conversion breakdown from queue stats API
  const conversionData: ConversionData = {
    cash: queueStats?.byPatientType?.cash ?? 0,
    insurance: (queueStats?.byPatientType?.insurance ?? 0) + (queueStats?.byPatientType?.coPay ?? 0),
    government: queueStats?.byPatientType?.governmentScheme ?? 0,
    camp: queueStats?.byPatientType?.corporate ?? 0,
    pending: assignedPatients.filter((p: any) => {
      const s = p.queueStatus || p.status || '';
      return s === 'Waiting' || s === 'Called';
    }).length,
  };

  return (
    <div className="flex flex-col h-full p-3 gap-3 overflow-hidden">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ZONE 1 â€” Header: Workspace title + tabs + date + refresh
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex-shrink-0">
        <CounselorHeaderNew
          activeTab={activeTab}
          onTabChange={setActiveTab}
          assignedCount={assignedPatients.filter((p: any) => {
              const s = p.queueStatus || p.status || '';
              return s !== 'Completed';
            }).length}
          confirmedCount={confirmedCount}
          followupCount={followupCount}
          onRefresh={handleRefreshQueue}
          isRefreshing={false}
        />
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ZONE 2 â€” Smart Stats Chips Bar (CLICKABLE queue filters)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === 'queue' && (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex-shrink-0">
        <CounselorSmartStats
          stats={smartStats}
          activeFilter={queueStatusFilter}
          onFilterChange={setQueueStatusFilter}
          onRefreshToggle={() => setAutoRefresh((v) => !v)}
          onCallNext={() => setShowCallNextModal(true)}
        />
      </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ZONE 3 â€” Body (relative container for Session Drawer overlay)
          Left 30% = queue (ALWAYS VISIBLE, never hidden by session)
          Right 70% = tab-driven content panel
          Drawer = absolute overlay on right when session is active
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="flex-1 min-h-0 flex gap-3 overflow-hidden">

        {/* â”€â”€ LEFT PANEL (30%) â€” Prioritised Work Queue â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            Always visible. User can switch patients even during a session.
        â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeTab === 'queue' && (
        <div className="w-[30%] flex-shrink-0 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0 relative">

          {/* Session-start loading overlay */}
          {isLoadingSession && (
            <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-3 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-gray-900">Starting Sessionâ€¦</p>
                <p className="text-xs text-gray-500 mt-1">Loading patient workspace</p>
              </div>
            </div>
          )}

          {/* Global patient search */}
          <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <PatientSearchBarEnhanced onSelectPatient={handleSelectPatient} />
          </div>

          {/* Patient queue (filtered + enhanced cards) */}
          <div className="flex-1 overflow-y-auto">
            {queueLoading ? (
              <div className="flex items-center justify-center h-40">
                <Activity className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : filteredQueuePatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-700">
                  {queueStatusFilter === 'All' ? 'No patients assigned' : `No ${queueStatusFilter} patients`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {queueStatusFilter === 'All'
                    ? 'Patients assigned to you will appear here'
                    : 'Try clearing the filter to see all patients'}
                </p>
                {queueStatusFilter !== 'All' && (
                  <button
                    onClick={() => setQueueStatusFilter('All')}
                    className="mt-3 text-xs text-blue-600 font-medium hover:text-blue-700"
                  >
                    Clear filter â†’
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Active patients (Waiting / InProgress) — always shown */}
                {activeQueuePatients.map((patient: any) => (
                  <EnhancedQueueCard
                    key={patient.id}
                    patient={patient as EnhancedPatientData}
                    isSelected={selectedQueueId === patient.id}
                    onStartSession={handleSelectPatient}
                  />
                ))}

                {/* Completed Today section — only shown when Completed filter is active */}
                {queueStatusFilter === 'Completed' && completedQueuePatients.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-green-50 border-y border-green-200 flex items-center justify-between sticky top-0 z-10">
                      <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                        ✓ Completed Today ({completedQueuePatients.length})
                      </span>
                    </div>
                    {completedQueuePatients.map((patient: any) => (
                      <EnhancedQueueCard
                        key={patient.id}
                        patient={patient as EnhancedPatientData}
                        isSelected={selectedQueueId === patient.id}
                        onStartSession={handleSelectPatient}
                      />
                    ))}
                  </>
                )}

                {/* Empty state when Completed filter is active but no active patients match */}
                {queueStatusFilter === 'Completed' && activeQueuePatients.length === 0 && completedQueuePatients.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-center px-6">
                    <p className="text-sm text-gray-400">No completed patients yet today</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer: avg wait + count */}
          {assignedPatients.length > 0 && (
            <div className="flex-shrink-0 px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex justify-between text-xs text-gray-600">
              <span>Avg Wait: <strong>{smartStats.avgWaitMinutes}m</strong></span>
              <span className="text-gray-400">
                {queueStatusFilter === 'Completed'
                  ? `${completedQueuePatients.length} completed`
                  : `${activeQueuePatients.length} active`}
              </span>
            </div>
          )}
        </div>
        )}

        {/* â”€â”€ RIGHT PANEL (70%) â€” Tab-driven context workspace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            Content changes based on the active tab.
            Always visible â€” Session Drawer slides OVER this panel.
        â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {/* ── RIGHT PANEL (70%) — Tab-driven context workspace ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* â”€â”€ My Queue tab â”€â”€ */}
          {activeTab === 'queue' && (
            <div className="grid grid-cols-2 gap-3 content-start">
              <div className="col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
                <PendingActionsWidget actions={pendingActions} />
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <DailyGoalWidget
                  completedSessions={completedCount}
                  sessionTarget={smartStats.sessionTarget}
                  revenueActual={totalRevenue}
                  revenueTarget={smartStats.revenueTarget}
                  avgDurationMinutes={avgDuration}
                  surgeriesScheduled={surgeriesScheduled}
                />
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <ConversionBreakdown data={conversionData} />
              </div>
            </div>
          )}

          {/* Surgery Confirmed tab */}
          {activeTab === 'surgery-confirmed' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full">
              <SurgeryConfirmedTab
                initialScheduleId={deepLinkScheduleId}
                initialPanel={deepLinkPanel as 'overview' | 'workflow' | 'coordination' | undefined}
              />
            </div>
          )}

          {/* Surgery Followup tab */}
          {activeTab === 'surgery-followup' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full">
              <SurgeryFollowupTab />
            </div>
          )}

          {/* Analytics tab */}
          {activeTab === 'analytics' && (
            <div className="bg-gray-50 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
              <CounselorAnalyticsTab />
            </div>
          )}
        </div>

      </div>

      {/* â•â•â• Modals â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}

      <CallNextPatientModal
        isOpen={showCallNextModal}
        onClose={() => setShowCallNextModal(false)}
        nextPatient={queueItems.filter((i: any) => i.queueStatus === 'Waiting')[0] || null}
        onCallAndStart={handleCallAndStart}
        onCallOnly={async () => {}}
        isLoading={callNextMutation.isPending || startQueueSessionMutation.isPending}
      />

    </div>
  );
}

/**
 * Main dashboard component
 */
export default function CounselorDashboard() {
  return <CounselorDashboardContent />;
}

