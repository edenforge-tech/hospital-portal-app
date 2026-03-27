'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WorkflowStepItem {
  id: string;
  itemKey: string;
  itemLabel: string;
  description?: string;
  departmentOwner?: string;
  departmentColor?: string;
  isMandatory: boolean;
  isBlocking: boolean;
  requiresDocument: boolean;
  requiresDeptNotification: boolean;
  notificationDepartment?: string;
  isComplete: boolean;
  completedAt?: string;
  completedByDept?: string;
  documentUrl?: string;
  notes?: string;
  completionId?: string;
}

export interface WorkflowStep {
  step: number;
  stepTitle: string;
  widgetComponent?: string;
  isComplete: boolean;
  isBlocked: boolean;
  progressPercent: number;
  items: WorkflowStepItem[];
}

export interface PreAdmissionWorkflowData {
  scheduleId: string;
  totalSteps: number;
  completedSteps: number;
  overallProgress: number;
  steps: WorkflowStep[];
}

export interface StepItemUpdate {
  itemId: string;
  isComplete: boolean;
  notes?: string;
  completedByDept?: string;
  documentUrl?: string;
}

export interface UpdateWorkflowStepPayload {
  itemUpdates?: StepItemUpdate[];
  markAllComplete?: boolean;
  notes?: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Fetches the full 6-step pre-admission workflow for an OT schedule,
 * including per-item completion status.
 */
export function usePreAdmissionWorkflow(scheduleId: string | undefined) {
  return useQuery<PreAdmissionWorkflowData>({
    queryKey: ['pre-admission-workflow', scheduleId],
    enabled: !!scheduleId,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get(`/pre-admission-checklist/workflow/${scheduleId}`);
      return res.data as PreAdmissionWorkflowData;
    },
  });
}

/**
 * Mutation: update completion state for a specific workflow step.
 * Accepts per-item updates OR a bulk markAllComplete flag.
 */
export function useUpdateWorkflowStep(scheduleId: string | undefined) {
  const qc = useQueryClient();

  return useMutation<
    { scheduleId: string; stepNumber: number; updatedItems: number; message: string },
    Error,
    { stepNumber: number; payload: UpdateWorkflowStepPayload }
  >({
    mutationFn: async ({ stepNumber, payload }) => {
      const api = getApi();
      const res = await api.patch(
        `/pre-admission-checklist/workflow/${scheduleId}/step/${stepNumber}`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pre-admission-workflow', scheduleId] });
      // Also invalidate the legacy completion query if anything depends on it
      qc.invalidateQueries({ queryKey: ['pre-admission-completion', scheduleId] });
    },
  });
}

// ── Derived helpers ───────────────────────────────────────────────────────────

/** Returns the current active step (first incomplete step). */
export function getCurrentStep(workflow: PreAdmissionWorkflowData | undefined): number {
  if (!workflow) return 1;
  const first = workflow.steps.find((s) => !s.isComplete);
  return first?.step ?? workflow.totalSteps;
}

/** Returns true if ALL mandatory items across ALL steps are done. */
export function isWorkflowComplete(workflow: PreAdmissionWorkflowData | undefined): boolean {
  if (!workflow) return false;
  return workflow.completedSteps >= workflow.totalSteps;
}

/** Returns any blocking items that are incomplete — these prevent surgery scheduling. */
export function getBlockers(workflow: PreAdmissionWorkflowData | undefined): WorkflowStepItem[] {
  if (!workflow) return [];
  return workflow.steps.flatMap((s) => s.items).filter((i) => i.isBlocking && !i.isComplete);
}
