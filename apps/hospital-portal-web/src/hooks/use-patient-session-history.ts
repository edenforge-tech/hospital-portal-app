/**
 * Hook: use-patient-session-history
 * Fetches all counseling sessions for a given patient (sorted oldest→newest).
 * Used to build the session history timeline in the session detail page.
 */

import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export interface PatientSessionSummary {
  id: string;
  sessionNumber?: string;
  sessionType: string; // Initial | Followup | Recheck | Urgent | AttenderCounseling
  sessionDate: string;
  status: string; // Scheduled | InProgress | Completed | Cancelled | NoShow
  counselorName?: string;
  counselorId?: string;
  patientPresent: boolean;
  attenderName?: string;
  attenderRelation?: string;
  attenderIsDecisionMaker: boolean;
  // Outcome
  patientAgreedToSurgery?: boolean;
  pendingDecision: boolean;
  reasonsForDelay?: string;
  decisionDate?: string;
  // Package / Procedure discussed
  recommendedSurgery?: string;
  packageAmount?: number;
  selectedPackageId?: string;
  // Notes snapshot
  additionalNotes?: string;
  durationMinutes?: number;
}

export function usePatientSessionHistory(patientId: string | undefined) {
  const { tenantId } = useAuthStore();

  return useQuery<PatientSessionSummary[]>({
    queryKey: ['patient-session-history', patientId],
    enabled: !!patientId && !!tenantId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!patientId || !tenantId) return [];
      const api = getApi();
      const res = await api.get('/counseling/sessions', {
        params: { patientId, tenantId, pageSize: 50 },
      });

      const items: any[] = res.data?.data ?? res.data?.items ?? res.data ?? [];
      // Sort oldest → newest
      return items
        .map((s: any) => ({
          id: s.id,
          sessionNumber: s.sessionNumber,
          sessionType: s.sessionType ?? 'Initial',
          sessionDate: s.sessionDate,
          status: s.status ?? 'Scheduled',
          counselorName: s.counselorName,
          counselorId: s.counselorId,
          patientPresent: s.patientPresent ?? true,
          attenderName: s.attenderName,
          attenderRelation: s.attenderRelation,
          attenderIsDecisionMaker: s.attenderIsDecisionMaker ?? false,
          patientAgreedToSurgery: s.patientAgreedToSurgery,
          pendingDecision: s.pendingDecision ?? false,
          reasonsForDelay: s.reasonsForDelay,
          decisionDate: s.decisionDate,
          recommendedSurgery: s.recommendedSurgery,
          packageAmount: s.packageAmount,
          selectedPackageId: s.selectedPackageId,
          additionalNotes: s.additionalNotes,
          durationMinutes: s.durationMinutes,
        }))
        .sort((a, b) =>
          new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
        );
    },
  });
}
