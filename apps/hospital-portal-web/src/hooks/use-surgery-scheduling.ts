/**
 * Surgery Scheduling React Query Hooks
 * Hooks for OR booking, surgeon availability, and pre-op checklist
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { surgerySchedulingApi } from '@/lib/api/surgery-scheduling.api';
import type {
  OTTheaterDto,
  OTScheduleDto,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ConfirmBookingRequest,
  ScheduleFilters,
  AvailabilityCheckDto,
  TimeSlotDto,
  BookingResultDto,
  PreOpChecklistDto,
} from '@/types/surgery-scheduling';

// ============================================================================
// Query Keys
// ============================================================================

export const surgerySchedulingKeys = {
  all: ['surgeryScheduling'] as const,
  theaters: () => [...surgerySchedulingKeys.all, 'theaters'] as const,
  theater: (id: string) => [...surgerySchedulingKeys.theaters(), id] as const,
  schedules: () => [...surgerySchedulingKeys.all, 'schedules'] as const,
  schedule: (id: string) => [...surgerySchedulingKeys.schedules(), id] as const,
  sessionSchedules: (sessionId: string) => [...surgerySchedulingKeys.schedules(), 'session', sessionId] as const,
  surgeonSchedule: (surgeonId: string, start: Date, end: Date) =>
    [...surgerySchedulingKeys.schedules(), 'surgeon', surgeonId, start.toISOString(), end.toISOString()] as const,
  availability: () => [...surgerySchedulingKeys.all, 'availability'] as const,
  theaterAvailability: (theaterId: string, date: Date) =>
    [...surgerySchedulingKeys.availability(), 'theater', theaterId, date.toISOString()] as const,
  surgeonAvailability: (surgeonId: string, date: Date) =>
    [...surgerySchedulingKeys.availability(), 'surgeon', surgeonId, date.toISOString()] as const,
  slots: (theaterId: string, date: Date) =>
    [...surgerySchedulingKeys.availability(), 'slots', theaterId, date.toISOString()] as const,
};

// ============================================================================
// Theater Query Hooks
// ============================================================================

/**
 * Get all operation theaters
 */
export function useTheaters(
  params?: { branchId?: string; specialization?: string },
  options?: Omit<UseQueryOptions<OTTheaterDto[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: surgerySchedulingKeys.theaters(),
    queryFn: () => surgerySchedulingApi.getTheaters(params),
    staleTime: 5 * 60 * 1000, // 5 minutes (theaters rarely change)
    ...options,
  });
}

/**
 * Get theater by ID
 */
export function useTheater(
  id: string,
  options?: Omit<UseQueryOptions<OTTheaterDto>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: surgerySchedulingKeys.theater(id),
    queryFn: () => surgerySchedulingApi.getTheaterById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Schedule Query Hooks
// ============================================================================

/**
 * Get schedules with filters
 */
export function useSchedules(
  filters?: ScheduleFilters,
  pageNumber = 1,
  pageSize = 50,
  options?: Omit<UseQueryOptions<{ schedules: OTScheduleDto[]; totalRecords: number }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...surgerySchedulingKeys.schedules(), filters, pageNumber, pageSize],
    queryFn: () => surgerySchedulingApi.getSchedules(filters, pageNumber, pageSize),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Get schedule by ID
 */
export function useSchedule(
  id: string,
  options?: Omit<UseQueryOptions<OTScheduleDto>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: surgerySchedulingKeys.schedule(id),
    queryFn: () => surgerySchedulingApi.getScheduleById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Get schedules for a specific session (counseling session → OR booking link)
 */
export function useSessionSchedules(
  sessionId: string,
  options?: Omit<UseQueryOptions<OTScheduleDto[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: surgerySchedulingKeys.sessionSchedules(sessionId),
    queryFn: () => surgerySchedulingApi.getSessionSchedules(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Get surgeon's schedule for a date range
 */
export function useSurgeonSchedule(
  surgeonId: string,
  startDate: Date,
  endDate: Date,
  options?: Omit<UseQueryOptions<OTScheduleDto[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: surgerySchedulingKeys.surgeonSchedule(surgeonId, startDate, endDate),
    queryFn: () => surgerySchedulingApi.getSurgeonSchedule(surgeonId, startDate, endDate),
    enabled: !!surgeonId,
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Get schedules for a date range (for calendar view)
 */
export function useSchedulesByDateRange(
  startDate: Date,
  endDate: Date,
  additionalFilters?: Omit<ScheduleFilters, 'startDate' | 'endDate'>,
  options?: Omit<UseQueryOptions<OTScheduleDto[]>, 'queryKey' | 'queryFn'>
) {
  const filters: ScheduleFilters = {
    ...additionalFilters,
    startDate,
    endDate,
  };

  return useQuery({
    queryKey: [...surgerySchedulingKeys.schedules(), 'dateRange', startDate.toISOString(), endDate.toISOString(), additionalFilters],
    queryFn: async () => {
      const result = await surgerySchedulingApi.getSchedules(filters, 1, 1000); // Large page size for calendar
      return result.schedules;
    },
    staleTime: 30 * 1000,
    ...options,
  });
}

// ============================================================================
// Availability Query Hooks
// ============================================================================

/**
 * Check theater availability
 */
export function useTheaterAvailability(
  theaterId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeScheduleId?: string,
  options?: Omit<UseQueryOptions<AvailabilityCheckDto>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...surgerySchedulingKeys.theaterAvailability(theaterId, date), startTime, endTime, excludeScheduleId],
    queryFn: () => surgerySchedulingApi.checkTheaterAvailability(theaterId, date, startTime, endTime, excludeScheduleId),
    enabled: !!theaterId && !!startTime && !!endTime,
    staleTime: 10 * 1000, // 10 seconds (availability changes frequently)
    ...options,
  });
}

/**
 * Check surgeon availability
 */
export function useSurgeonAvailability(
  surgeonId: string,
  date: Date,
  startTime: string,
  endTime: string,
  options?: Omit<UseQueryOptions<AvailabilityCheckDto>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...surgerySchedulingKeys.surgeonAvailability(surgeonId, date), startTime, endTime],
    queryFn: () => surgerySchedulingApi.checkSurgeonAvailability(surgeonId, date, startTime, endTime),
    enabled: !!surgeonId && !!startTime && !!endTime,
    staleTime: 10 * 1000,
    ...options,
  });
}

/**
 * Get available time slots for a theater
 */
export function useAvailableSlots(
  theaterId: string,
  date: Date,
  options?: Omit<UseQueryOptions<TimeSlotDto[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: surgerySchedulingKeys.slots(theaterId, date),
    queryFn: () => surgerySchedulingApi.getAvailableSlots(theaterId, date),
    enabled: !!theaterId,
    staleTime: 30 * 1000,
    ...options,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create OR schedule
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateScheduleRequest) => surgerySchedulingApi.createSchedule(request),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: surgerySchedulingKeys.schedules() });
      if (data.scheduleId) {
        queryClient.invalidateQueries({ queryKey: surgerySchedulingKeys.schedule(data.scheduleId) });
      }
    },
  });
}

/**
 * Update OR schedule
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateScheduleRequest }) =>
      surgerySchedulingApi.updateSchedule(id, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: surgerySchedulingKeys.schedule(data.id) });
      queryClient.invalidateQueries({ queryKey: surgerySchedulingKeys.schedules() });
    },
  });
}

/**
 * Confirm OR booking
 */
export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ConfirmBookingRequest }) =>
      surgerySchedulingApi.confirmBooking(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surgerySchedulingKeys.schedule(variables.id) });
      queryClient.invalidateQueries({ queryKey: surgerySchedulingKeys.schedules() });
    },
  });
}

/**
 * Cancel OR schedule
 */
export function useCancelSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      surgerySchedulingApi.cancelSchedule(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surgerySchedulingKeys.schedule(variables.id) });
      queryClient.invalidateQueries({ queryKey: surgerySchedulingKeys.schedules() });
    },
  });
}

/**
 * Generate pre-op checklist
 */
export function useGeneratePreOpChecklist() {
  return useMutation({
    mutationFn: (dto: PreOpChecklistDto) => surgerySchedulingApi.generatePreOpChecklist(dto),
  });
}

/**
 * Get checklist for session (from localStorage)
 */
export function useSessionChecklist(sessionId: string) {
  return useQuery({
    queryKey: ['preOpChecklist', sessionId],
    queryFn: () => {
      const { loadChecklistFromStorage } = require('@/types/preop-checklist');
      return loadChecklistFromStorage(sessionId);
    },
    staleTime: 1000, // 1 second - always check localStorage
    gcTime: 0, // Don't cache in React Query
  });
}
