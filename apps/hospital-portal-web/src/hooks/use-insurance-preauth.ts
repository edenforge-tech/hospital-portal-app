'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PreauthStatus =
  | 'Draft'
  | 'Applied'
  | 'UnderReview'
  | 'PendingDocs'
  | 'InitialApproved'
  | 'FinalApproved'
  | 'Approved'
  | 'Rejected'
  | 'Expired'
  | 'Cancelled';

export interface InsurancePreauthRecord {
  id: string;
  sessionId: string;
  scheduleId?: string;
  patientId?: string;
  insuranceProvider: string;
  tpaName?: string;
  policyNumber: string;
  memberId?: string;
  groupNumber?: string;
  preauthRequestNumber?: string;
  insurerReferenceNumber?: string;
  proposedSurgeryName?: string;
  proposedIcdCode?: string;
  estimatedCost?: number;
  requestedAmount?: number;
  preauthStatus: PreauthStatus;
  appliedAt?: string;
  lastStatusChangeAt?: string;
  respondedAt?: string;
  expiryDate?: string;
  approvedAmount?: number;
  rejectionReason?: string;
  rejectionCode?: string;
  insurerContactName?: string;
  insurerContactPhone?: string;
  insurerContactEmail?: string;
  notes?: string;
  documentsSubmitted: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreauthPayload {
  sessionId: string;
  scheduleId?: string;
  patientId?: string;
  insuranceProvider: string;
  tpaName?: string;
  policyNumber: string;
  memberId?: string;
  proposedSurgeryName?: string;
  estimatedCost?: number;
  requestedAmount?: number;
  notes?: string;
}

export interface UpdateStatusPayload {
  status: PreauthStatus;
  approvedAmount?: number;
  rejectionReason?: string;
  rejectionCode?: string;
  expiryDate?: string;
  insurerReferenceNumber?: string;
  notes?: string;
}

// ── Patient types that need pre-auth ─────────────────────────────────────────

export const PREAUTH_REQUIRED_TYPES = ['Insurance', 'CoPay', 'CGHS', 'ESH', 'SGHS', 'Railway'];

// ── Hook: fetch by session ────────────────────────────────────────────────────

export function useInsurancePreauth(sessionId: string | undefined) {
  return useQuery<InsurancePreauthRecord[]>({
    queryKey: ['insurance-preauth-v2', sessionId],
    enabled: !!sessionId,
    staleTime: 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get(`/insurance-preauth/session/${sessionId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

// ── Hook: create new preauth ──────────────────────────────────────────────────

export function useCreateInsurancePreauth(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePreauthPayload) => {
      const api = getApi();
      const res = await api.post('/insurance-preauth', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insurance-preauth-v2', sessionId] });
    },
  });
}

// ── Hook: update preauth status ───────────────────────────────────────────────

export function useUpdatePreauthStatus(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateStatusPayload }) => {
      const api = getApi();
      const res = await api.patch(`/insurance-preauth/${id}/status`, payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insurance-preauth-v2', sessionId] });
    },
  });
}

// ── Hook: fetch by schedule ───────────────────────────────────────────────────

export function useInsurancePreauthBySchedule(scheduleId: string | undefined) {
  return useQuery<InsurancePreauthRecord[]>({
    queryKey: ['insurance-preauth-schedule', scheduleId],
    enabled: !!scheduleId,
    staleTime: 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get(`/insurance-preauth/schedule/${scheduleId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}
