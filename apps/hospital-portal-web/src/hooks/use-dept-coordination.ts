/**
 * Hook: use-dept-coordination
 * CRUD operations for department coordination requests tied to OT schedules / counseling sessions.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

// ── Types ──────────────────────────────────────────────────────────────────────

export type DeptCoordinationDepartment =
  | 'Admissions'
  | 'Billing'
  | 'Lab'
  | 'Surgeon'
  | 'Anesthesia'
  | 'OT'
  | 'Pharmacy'
  | 'Radiology'
  | 'Nursing';

export const ALL_DEPARTMENTS: DeptCoordinationDepartment[] = [
  'Admissions', 'Billing', 'Lab', 'Surgeon', 'Anesthesia',
  'OT', 'Pharmacy', 'Radiology', 'Nursing',
];

export type DeptRequestStatus =
  | 'None'
  | 'Pending'
  | 'Sent'
  | 'InProgress'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type DeptRequestPriority = 'normal' | 'urgent' | 'critical';

export interface DeptCoordinationRequestDto {
  id: string;
  tenantId: string;
  branchId?: string;
  sessionId?: string;
  scheduleId?: string;
  patientId: string;
  department: DeptCoordinationDepartment;
  requestStatus: DeptRequestStatus;
  requestMessage?: string;
  responseMessage?: string;
  responseData?: Record<string, unknown>;
  requestedBy?: string;
  requestedByName?: string;
  respondedBy?: string;
  respondedByName?: string;
  patientName?: string;
  requestedAt?: string;
  respondedAt?: string;
  requestType: string;
  autoCreated: boolean;
  priority: DeptRequestPriority;
  externalRef?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  workflowStep?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeptStatusInfo {
  status: DeptRequestStatus;
  lastUpdated?: string;
  latestMessage?: string;
  latestRequestId?: string;
}

export interface DeptCoordinationSummaryDto {
  departments: Record<DeptCoordinationDepartment, DeptStatusInfo | null>;
}

export interface DeptWorkflowStatusDto {
  scheduleId: string;
  totalSteps: number;
  stepsCompleted: number;
  onHold: boolean;
  holdReason?: string;
  allDeptsClear: boolean;
  departments: Record<DeptCoordinationDepartment, DeptStatusInfo>;
}

export interface CreateDeptCoordinationRequestDto {
  patientId: string;
  sessionId?: string;
  scheduleId?: string;
  department: DeptCoordinationDepartment;
  requestMessage?: string;
  requestData?: Record<string, unknown>;
  requestType?: string;
  priority?: DeptRequestPriority;
  workflowStep?: number;
}

export interface UpdateDeptCoordinationRequestDto {
  requestStatus?: DeptRequestStatus;
  responseMessage?: string;
  responseData?: Record<string, unknown>;
  externalRef?: string;
}

// ── Queries ────────────────────────────────────────────────────────────────────

/** Get all dept coordination requests for a given OT schedule */
export function useGetDeptRequests(scheduleId?: string) {
  const { tenantId } = useAuthStore();

  return useQuery<DeptCoordinationRequestDto[]>({
    queryKey: ['deptCoordination', 'requests', scheduleId],
    enabled: !!tenantId && !!scheduleId,
    staleTime: 30_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/dept-coordination', { params: { scheduleId } });
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    },
  });
}

/** Get a per-department status summary for a given OT schedule */
export function useGetDeptSummary(scheduleId?: string) {
  const { tenantId } = useAuthStore();

  return useQuery<DeptCoordinationSummaryDto>({
    queryKey: ['deptCoordination', 'summary', scheduleId],
    enabled: !!tenantId && !!scheduleId,
    staleTime: 30_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/dept-coordination/summary', { params: { scheduleId } });
      return res.data as DeptCoordinationSummaryDto;
    },
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

/** Send a new coordination request to a department */
export function useSendDeptRequest(scheduleId?: string) {
  const qc = useQueryClient();

  return useMutation<DeptCoordinationRequestDto, Error, CreateDeptCoordinationRequestDto>({
    mutationFn: async (body) => {
      const api = getApi();
      const res = await api.post('/dept-coordination', body);
      return res.data as DeptCoordinationRequestDto;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deptCoordination', 'requests', scheduleId] });
      qc.invalidateQueries({ queryKey: ['deptCoordination', 'summary', scheduleId] });
    },
  });
}

/** Update (respond to) an existing coordination request */
export function useRespondDeptRequest(scheduleId?: string) {
  const qc = useQueryClient();

  return useMutation<
    DeptCoordinationRequestDto,
    Error,
    { id: string; body: UpdateDeptCoordinationRequestDto }
  >({
    mutationFn: async ({ id, body }) => {
      const api = getApi();
      const res = await api.put(`/dept-coordination/${id}`, body);
      return res.data as DeptCoordinationRequestDto;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deptCoordination', 'requests', scheduleId] });
      qc.invalidateQueries({ queryKey: ['deptCoordination', 'summary', scheduleId] });
      qc.invalidateQueries({ queryKey: ['deptCoordination', 'workflow', scheduleId] });
    },
  });
}

/**
 * Get step-grouped workflow status (9 depts) for a schedule.
 * Used by the Surgery Overview panel to show blocking indicators.
 */
export function useDeptWorkflowStatus(scheduleId?: string) {
  const { tenantId } = useAuthStore();

  return useQuery<DeptWorkflowStatusDto>({
    queryKey: ['deptCoordination', 'workflow', scheduleId],
    enabled: !!tenantId && !!scheduleId,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/dept-coordination/workflow-status', { params: { scheduleId } });
      return res.data as DeptWorkflowStatusDto;
    },
  });
}

/**
 * Mutation: trigger auto-creation of dept requests for all 9 departments.
 * Called when a booking is confirmed from the frontend (idempotent on backend).
 */
export function useAutoCreateDeptRequests(scheduleId?: string) {
  const qc = useQueryClient();

  return useMutation<
    { created: number; requests: DeptCoordinationRequestDto[] },
    Error,
    { patientId: string; sessionId?: string }
  >({
    mutationFn: async ({ patientId, sessionId }) => {
      const api = getApi();
      const params = new URLSearchParams({ scheduleId: scheduleId!, patientId });
      if (sessionId) params.append('sessionId', sessionId);
      const res = await api.post(`/dept-coordination/auto-create-all?${params.toString()}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deptCoordination', 'requests', scheduleId] });
      qc.invalidateQueries({ queryKey: ['deptCoordination', 'summary', scheduleId] });
      qc.invalidateQueries({ queryKey: ['deptCoordination', 'workflow', scheduleId] });
    },
  });
}
