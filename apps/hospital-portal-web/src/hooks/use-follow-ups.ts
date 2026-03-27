// Follow-Up Appointments React Query Hooks
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  followUpApi,
  type FollowUpAppointment,
  type FollowUpFilters,
  type CreateFollowUpRequest,
  type UpdateFollowUpRequest,
  type FollowUpsResponse,
} from '@/lib/api/follow-up.api';

// ============================================================================
// Query Keys
// ============================================================================

export const followUpKeys = {
  all: ['follow-ups'] as const,
  lists: () => [...followUpKeys.all, 'list'] as const,
  list: (filters?: FollowUpFilters) => [...followUpKeys.lists(), filters] as const,
  details: () => [...followUpKeys.all, 'detail'] as const,
  detail: (id: string) => [...followUpKeys.details(), id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all follow-up appointments with optional filters
 */
export function useFollowUps(
  filters?: FollowUpFilters,
  options?: Omit<UseQueryOptions<FollowUpsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: followUpKeys.list(filters),
    queryFn: () => followUpApi.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get follow-up appointment by ID
 */
export function useFollowUp(
  id: string,
  options?: Omit<UseQueryOptions<FollowUpAppointment>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: followUpKeys.detail(id),
    queryFn: () => followUpApi.getById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new follow-up appointment
 */
export function useCreateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpRequest) => followUpApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followUpKeys.lists() });
    },
  });
}

/**
 * Update follow-up appointment
 */
export function useUpdateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFollowUpRequest }) =>
      followUpApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: followUpKeys.lists() });
      queryClient.invalidateQueries({ queryKey: followUpKeys.detail(variables.id) });
    },
  });
}

/**
 * Complete follow-up appointment
 */
export function useCompleteFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: string }) =>
      followUpApi.complete(id, outcome),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: followUpKeys.lists() });
      queryClient.invalidateQueries({ queryKey: followUpKeys.detail(variables.id) });
    },
  });
}

/**
 * Reschedule follow-up appointment
 */
export function useRescheduleFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDate, newTime }: { id: string; newDate: string; newTime?: string }) =>
      followUpApi.reschedule(id, newDate, newTime),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: followUpKeys.lists() });
      queryClient.invalidateQueries({ queryKey: followUpKeys.detail(variables.id) });
    },
  });
}

/**
 * Delete follow-up appointment
 */
export function useDeleteFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => followUpApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followUpKeys.lists() });
    },
  });
}
