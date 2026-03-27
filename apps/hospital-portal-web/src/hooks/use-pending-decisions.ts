/**
 * Hook: use-pending-decisions
 * Fetches completed counseling sessions where no surgery has been confirmed.
 * Used for the Surgery Followup tab.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export type DelayReason =
  | 'Financial'
  | 'Fear'
  | 'Family'
  | 'Travel'
  | 'Competitor'
  | 'Medical'
  | 'Unknown';

export type FollowupSubFilter = 'all' | 'agreed' | 'undecided' | 'declined';

export interface PendingDecisionPatient {
  sessionId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  patientPhone?: string;
  age?: number;
  gender?: string;
  // Session info
  sessionDate: string; // counseling session date
  sessionType: string;
  counselorName?: string;
  counselorId?: string;
  // Outcome
  patientAgreedToSurgery?: boolean; // true=agreed, false=declined, undefined=undecided
  pendingDecision: boolean;
  reasonsForDelay?: string;
  // Procedure discussed
  recommendedSurgery?: string;
  packageAmount?: number;
  patientType?: string;
  // Communication tracking
  lastContactDate?: string; // from session notes tagged 'communication'
  nextCallbackDate?: string; // from follow_up_appointments
  callbackCount: number;     // how many times we've called
  // Computed
  daysSinceSession: number;
  daysSinceContact: number;
  subFilter: FollowupSubFilter;
  // Attender info (if counseled via attender)
  attenderName?: string;
  attenderRelation?: string;
}

export function usePendingDecisions(branchId?: string, subFilter: FollowupSubFilter = 'all') {
  const { tenantId } = useAuthStore();

  return useQuery<PendingDecisionPatient[]>({
    queryKey: ['pending-decisions', branchId, subFilter],
    enabled: !!tenantId,
    staleTime: 30_000,
    refetchInterval: 120_000,
    queryFn: async () => {
      const api = getApi();
      const params: Record<string, string> = {
        status: 'Completed',
        pendingDecision: 'true',
      };
      if (branchId) params.branchId = branchId;

      const res = await api.get('/counseling/sessions', { params });
      const sessions: any[] = Array.isArray(res.data)
        ? res.data
        : res.data?.sessions ?? res.data?.data ?? res.data?.items ?? [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return sessions
        .map((s: any): PendingDecisionPatient => {
          const sessionDate = new Date(s.sessionDate);
          sessionDate.setHours(0, 0, 0, 0);
          const daysSinceSession = Math.floor(
            (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const lastContact = s.lastContactDate ? new Date(s.lastContactDate) : null;
          const daysSinceContact = lastContact
            ? Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
            : daysSinceSession;

          // Classify sub-filter
          let sf: FollowupSubFilter = 'undecided';
          if (s.patientAgreedToSurgery === true) sf = 'agreed';
          else if (s.patientAgreedToSurgery === false && !s.pendingDecision) sf = 'declined';

          return {
            sessionId: s.id,
            patientId: s.patientId,
            patientName: s.patientName || 'Unknown',
            mrn: s.patientMrn || s.mrn || '',
            patientPhone: s.patientPhone,
            age: s.age,
            gender: s.gender,
            sessionDate: s.sessionDate,
            sessionType: s.sessionType,
            counselorName: s.counselorName,
            counselorId: s.counselorId,
            patientAgreedToSurgery: s.patientAgreedToSurgery,
            pendingDecision: s.pendingDecision ?? true,
            reasonsForDelay: s.reasonsForDelay,
            recommendedSurgery: s.recommendedSurgery,
            packageAmount: s.packageAmount,
            patientType: s.patientType,
            lastContactDate: s.lastContactDate,
            nextCallbackDate: s.nextCallbackDate,
            callbackCount: s.callbackCount ?? 0,
            daysSinceSession,
            daysSinceContact,
            subFilter: sf,
            attenderName: s.attenderName,
            attenderRelation: s.attenderRelation,
          };
        })
        .filter(p =>
          subFilter === 'all' ? true : p.subFilter === subFilter
        )
        .sort((a, b) => b.daysSinceSession - a.daysSinceSession); // Most overdue first
    },
  });
}

/** Log a communication interaction (saves as session note with tag 'communication') */
export function useLogCommunication() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      channel: 'Call' | 'WhatsApp' | 'SMS' | 'Email' | 'InPerson';
      outcome: 'Reached' | 'Unreachable' | 'CallbackRequested';
      notes: string;
      nextActionDate?: string;
    }) => {
      const api = getApi();
      return api.post(`/counseling/sessions/${payload.sessionId}/notes`, {
        noteText: `[${payload.channel}] Outcome: ${payload.outcome}. ${payload.notes}${payload.nextActionDate ? ` | Next action: ${payload.nextActionDate}` : ''}`,
        noteType: 'communication',
        tags: ['communication', payload.channel.toLowerCase(), payload.outcome.toLowerCase()],
        createdByUserId: user?.id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-decisions'] });
    },
  });
}

/** Update the delay reason on a session */
export function useUpdateDelayReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { sessionId: string; reason: DelayReason }) => {
      const api = getApi();
      return api.put(`/counseling/sessions/${payload.sessionId}`, {
        reasonsForDelay: payload.reason,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-decisions'] });
    },
  });
}
