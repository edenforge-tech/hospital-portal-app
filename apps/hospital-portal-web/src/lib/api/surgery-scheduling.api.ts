/**
 * Surgery Scheduling API Client
 * Handles OR booking, surgeon availability, and pre-op checklist operations
 */

import { getApi } from '@/lib/api';
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
// Theater Management
// ============================================================================

/**
 * Get all operation theaters
 */
export async function getTheaters(params?: { branchId?: string; specialization?: string }): Promise<OTTheaterDto[]> {
  const queryParams = new URLSearchParams();
  if (params?.branchId) queryParams.append('branchId', params.branchId);
  if (params?.specialization) queryParams.append('specialization', params.specialization);

  const response = await getApi().get<OTTheaterDto[]>(`/otbooking/theaters?${queryParams}`);
  return response.data;
}

/**
 * Get theater by ID
 */
export async function getTheaterById(id: string): Promise<OTTheaterDto> {
  const response = await getApi().get<OTTheaterDto>(`/otbooking/theaters/${id}`);
  return response.data;
}

// ============================================================================
// Schedule Management
// ============================================================================

/**
 * Get schedules with filters
 */
export async function getSchedules(
  filters?: ScheduleFilters,
  pageNumber = 1,
  pageSize = 50
): Promise<{ schedules: OTScheduleDto[]; totalRecords: number }> {
  const queryParams = new URLSearchParams();
  if (filters?.theaterId) queryParams.append('theaterId', filters.theaterId);
  if (filters?.surgeonId) queryParams.append('surgeonId', filters.surgeonId);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate.toISOString());
  if (filters?.endDate) queryParams.append('endDate', filters.endDate.toISOString());
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.surgeryType) queryParams.append('surgeryType', filters.surgeryType);
  queryParams.append('pageNumber', pageNumber.toString());
  queryParams.append('pageSize', pageSize.toString());

  const response = await getApi().get<{ schedules: OTScheduleDto[]; totalRecords: number }>(
    `/otbooking/schedules?${queryParams}`
  );
  return response.data;
}

/**
 * Get schedule by ID
 */
export async function getScheduleById(id: string): Promise<OTScheduleDto> {
  const response = await getApi().get<OTScheduleDto>(`/otbooking/schedules/${id}`);
  return response.data;
}

/**
 * Get schedules for a specific surgeon
 */
export async function getSurgeonSchedule(
  surgeonId: string,
  startDate: Date,
  endDate: Date
): Promise<OTScheduleDto[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('startDate', startDate.toISOString());
  queryParams.append('endDate', endDate.toISOString());

  const response = await getApi().get<OTScheduleDto[]>(
    `/otbooking/schedules/surgeon/${surgeonId}?${queryParams}`
  );
  return response.data;
}

/**
 * Get schedules for a specific session (link counseling session to OR booking)
 */
export async function getSessionSchedules(sessionId: string): Promise<OTScheduleDto[]> {
  const filters: ScheduleFilters = { sessionId };
  const result = await getSchedules(filters, 1, 100);
  return result.schedules;
}

/**
 * Create new OR schedule
 */
export async function createSchedule(request: CreateScheduleRequest): Promise<BookingResultDto> {
  const response = await getApi().post<BookingResultDto>('/otbooking/schedules', request);
  return response.data;
}

/**
 * Update existing schedule
 */
export async function updateSchedule(id: string, request: UpdateScheduleRequest): Promise<OTScheduleDto> {
  const response = await getApi().put<OTScheduleDto>(`/otbooking/schedules/${id}`, request);
  return response.data;
}

/**
 * Confirm OR booking
 */
export async function confirmBooking(id: string, request: ConfirmBookingRequest): Promise<BookingResultDto> {
  const response = await getApi().post<BookingResultDto>(`/otbooking/schedules/${id}/confirm`, request);
  return response.data;
}

/**
 * Cancel OR schedule
 */
export async function cancelSchedule(id: string, reason: string): Promise<void> {
  await getApi().post(`/otbooking/schedules/${id}/cancel`, { cancellationReason: reason });
}

// ============================================================================
// Availability Checking
// ============================================================================

/**
 * Check theater availability for a specific date/time
 */
export async function checkTheaterAvailability(
  theaterId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeScheduleId?: string
): Promise<AvailabilityCheckDto> {
  const queryParams = new URLSearchParams();
  queryParams.append('theaterId', theaterId);
  queryParams.append('date', date.toISOString().split('T')[0]); // YYYY-MM-DD
  queryParams.append('startTime', startTime);
  queryParams.append('endTime', endTime);
  if (excludeScheduleId) queryParams.append('excludeScheduleId', excludeScheduleId);

  const response = await getApi().get<AvailabilityCheckDto>(`/otbooking/availability/check?${queryParams}`);
  return response.data;
}

/**
 * Check surgeon availability for a specific date/time
 */
export async function checkSurgeonAvailability(
  surgeonId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<AvailabilityCheckDto> {
  const queryParams = new URLSearchParams();
  queryParams.append('date', date.toISOString().split('T')[0]); // YYYY-MM-DD
  queryParams.append('startTime', startTime);
  queryParams.append('endTime', endTime);

  const response = await getApi().get<AvailabilityCheckDto>(
    `/otbooking/availability/surgeon/${surgeonId}?${queryParams}`
  );
  return response.data;
}

/**
 * Get available time slots for a theater on a specific date
 */
export async function getAvailableSlots(theaterId: string, date: Date): Promise<TimeSlotDto[]> {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const response = await getApi().get<TimeSlotDto[]>(`/otbooking/availability/slots/${theaterId}/date/${dateStr}`);
  return response.data;
}

// ============================================================================
// Pre-Op Checklist (via Surgery API)
// ============================================================================

/**
 * Generate pre-op checklist for surgery
 */
export async function generatePreOpChecklist(dto: PreOpChecklistDto): Promise<{ checklist: string[]; totalItems: number }> {
  const response = await getApi().post<{ checklist: string[]; totalItems: number }>('/surgery/generate-preop-checklist', dto);
  return response.data;
}

// ============================================================================
// Export all functions
// ============================================================================

export const surgerySchedulingApi = {
  // Theater management
  getTheaters,
  getTheaterById,

  // Schedule management
  getSchedules,
  getScheduleById,
  getSurgeonSchedule,
  getSessionSchedules,
  createSchedule,
  updateSchedule,
  confirmBooking,
  cancelSchedule,

  // Availability checking
  checkTheaterAvailability,
  checkSurgeonAvailability,
  getAvailableSlots,

  // Pre-op checklist
  generatePreOpChecklist,
};
