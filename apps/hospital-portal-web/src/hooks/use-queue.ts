// Queue Management Hooks - React Query
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import * as queueApi from '@/lib/api/queue.api';
import type { 
  QueueItem, 
  AllQueuesResponse,
  QueueDisplayData,
  CallPatientRequest,
  TransferQueueRequest
} from '@/lib/api/queue.api';

// ============================================================================
// Query Keys
// ============================================================================

export const queueKeys = {
  all: ['queue'] as const,
  allQueues: (branchId: string) => [...queueKeys.all, 'all', branchId] as const,
  display: (branchId?: string, departmentId?: string, queueType?: string) => 
    [...queueKeys.all, 'display', branchId, departmentId, queueType] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all queues with stats for a branch
 */
export function useAllQueues(
  branchId: string,
  options?: Omit<UseQueryOptions<AllQueuesResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queueKeys.allQueues(branchId),
    queryFn: () => queueApi.getAllQueues(branchId),
    enabled: !!branchId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    ...options,
  });
}

/**
 * Get queue display data for a specific queue type
 */
export function useQueueDisplay(
  branchId?: string,
  departmentId?: string,
  queueType?: string,
  options?: Omit<UseQueryOptions<QueueDisplayData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queueKeys.display(branchId, departmentId, queueType),
    queryFn: () => queueApi.getQueueDisplay(branchId, departmentId, queueType),
    enabled: !!branchId,
    staleTime: 20 * 1000, // 20 seconds
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 20 * 1000, // Auto-refresh every 20 seconds
    ...options,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Call a patient from the queue
 */
export function useCallPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      queueItemId, 
      request 
    }: { 
      queueItemId: string; 
      request: CallPatientRequest;
    }) => queueApi.callPatient(queueItemId, request),
    onSuccess: () => {
      // Invalidate all queue queries to refresh data
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
    },
  });
}

/**
 * Mark patient as absent (no-show)
 */
export function useMarkPatientAbsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queueItemId: string) => queueApi.markPatientAbsent(queueItemId),
    onSuccess: () => {
      // Invalidate all queue queries to refresh data
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
    },
  });
}

/**
 * Transfer patient to another queue
 */
export function useTransferQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      queueItemId, 
      request 
    }: { 
      queueItemId: string; 
      request: TransferQueueRequest;
    }) => queueApi.transferQueue(queueItemId, request),
    onSuccess: () => {
      // Invalidate all queue queries to refresh data
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
    },
  });
}
