/**
 * Surgery Scheduling Type Definitions
 * Types for OR booking, surgeon availability, and pre-op checklist
 */

// ============================================================================
// Theater Types
// ============================================================================

export interface OTTheaterDto {
  id: string;
  tenantId: string;
  branchId: string;
  theaterName: string;
  theaterCode?: string;
  floorNumber?: number;
  locationDescription?: string;
  specialization?: string;
  surgeryTypesSupported?: string[];
  equipmentList?: string;
  maxSurgeriesPerDay: number;
  standardSurgeryDurationMinutes: number;
  cleaningTimeBetweenSurgeriesMinutes: number;
  operationStartTime: string; // TimeSpan as string (HH:mm:ss)
  operationEndTime: string; // TimeSpan as string (HH:mm:ss)
  operatingDays?: string[]; // ["Monday", "Tuesday", etc.]
  isActive: boolean;
  isOperational: boolean;
  maintenanceMode: boolean;
  maintenanceReason?: string;
}

// ============================================================================
// Schedule Types
// ============================================================================

export interface OTScheduleDto {
  id: string;
  theaterId: string;
  theaterName?: string;
  sessionId?: string; // Link to counseling session
  bookingId?: string;
  patientId?: string;
  scheduleNumber?: string;
  scheduledDate: string; // ISO date string
  startTime: string; // TimeSpan as string (HH:mm:ss)
  endTime: string; // TimeSpan as string (HH:mm:ss)
  durationMinutes: number;
  surgeryType: string;
  procedureDescription?: string;
  eyeOperated?: string; // OD, OS, OU
  surgeonId: string;
  anesthesiologistId?: string;
  otTechnicianId?: string;
  nursingStaffIds?: string[];
  equipmentReserved?: string;
  iolReservedId?: string;
  status: ScheduleStatus;
  confirmationTimestamp?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  surgeryStartedAt?: string;
  surgeryCompletedAt?: string;
  actualDurationMinutes?: number;
  complications?: string;
  outcome?: string;
}

export type ScheduleStatus = 
  | 'Tentative' 
  | 'Booked' 
  | 'Confirmed' 
  | 'InProgress' 
  | 'Completed' 
  | 'Cancelled' 
  | 'NoShow';

export interface CreateScheduleRequest {
  theaterId: string;
  sessionId?: string; // Optional link to counseling session
  bookingId?: string;
  patientId?: string;
  scheduledDate: string; // ISO date string
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  surgeryType: string;
  procedureDescription?: string;
  eyeOperated?: string; // OD, OS, OU
  surgeonId: string;
  anesthesiologistId?: string;
  otTechnicianId?: string;
  nursingStaffIds?: string[];
  equipmentReserved?: string;
  iolReservedId?: string;
}

export interface UpdateScheduleRequest {
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  surgeryType?: string;
  procedureDescription?: string;
  eyeOperated?: string;
  surgeonId?: string;
  anesthesiologistId?: string;
  otTechnicianId?: string;
  nursingStaffIds?: string[];
  equipmentReserved?: string;
  iolReservedId?: string;
}

export interface ConfirmBookingRequest {
  confirmationNotes?: string;
}

export interface ScheduleFilters {
  theaterId?: string;
  surgeonId?: string;
  sessionId?: string; // Filter by counseling session
  startDate?: Date;
  endDate?: Date;
  status?: string;
  surgeryType?: string;
}

// ============================================================================
// Availability Types
// ============================================================================

export interface AvailabilityCheckDto {
  isAvailable: boolean;
  conflicts?: ConflictDto[];
  suggestedSlots?: TimeSlotDto[];
  message?: string;
}

export interface ConflictDto {
  scheduleId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  surgeryType: string;
  surgeonName?: string;
  patientName?: string;
}

export interface TimeSlotDto {
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  durationMinutes: number;
  isAvailable: boolean;
  occupiedBy?: string; // Description of what's booked
}

// ============================================================================
// Booking Result Types
// ============================================================================

export interface BookingResultDto {
  success: boolean;
  message: string;
  scheduleId?: string;
  warnings?: string[];
  errors?: string[];
}

// ============================================================================
// Pre-Op Checklist Types
// ============================================================================

export interface PreOpChecklistDto {
  surgeryType: string;
  procedureType: string;
  patientAge: number;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  onAnticoagulants: boolean;
  additionalItems?: string[];
}

export interface PreOpChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  completedByUserId?: string;
  notes?: string;
}

// ============================================================================
// Surgery Request Types (from backend)
// ============================================================================

export interface SurgeryRequestResponseDto {
  id: string;
  patientId: string;
  patientName: string;
  surgeryType: string;
  procedureType: string;
  eye: string;
  packageType: string;
  packagePrice?: number;
  status: string;
  urgency: string;
  preferredDate?: string;
  requestDate: string;
  preOpChecklist: string[];
  counselorReferralSent: boolean;
}

// ============================================================================
// Surgery Recommendation Types
// ============================================================================

export interface SurgeryRecommendationDto {
  patientId: string;
  surgeryType: string;
  procedureType: string;
  eye: string; // OD, OS, OU
  diagnosisCode?: string;
  diagnosisDescription?: string;
  packageType: string;
  packagePrice?: number;
  iolFormula?: string;
  iolPower?: number;
  iolType?: string;
  preOpChecklist: string[];
  urgency: string;
  notes?: string;
  specialInstructions?: string;
  preferredDate?: string;
  preferredTime?: string;
}
