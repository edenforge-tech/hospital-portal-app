/**
 * Staff Scheduling & Management API Service
 * Shift management, workforce optimization, time tracking
 */

import { getApi } from '../api';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface StaffMember {
  id: string;
  tenantId: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId: string;
  departmentName: string;
  position: string;
  jobTitle: string;
  employmentType: EmploymentType;
  status: StaffStatus;
  hireDate: string;
  terminationDate?: string;
  supervisorId?: string;
  supervisorName?: string;
  credentials?: Credential[];
  skills?: string[];
  certifications?: Certification[];
  workPreferences?: WorkPreferences;
  payRate?: number;
  payType: 'hourly' | 'salary';
  overtimeEligible: boolean;
  maxHoursPerWeek: number;
  minHoursPerWeek?: number;
  profileImageUrl?: string;
  emergencyContact?: EmergencyContact;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EmploymentType = 'full_time' | 'part_time' | 'per_diem' | 'contract' | 'temporary' | 'intern';
export type StaffStatus = 'active' | 'on_leave' | 'suspended' | 'terminated' | 'inactive';

export interface Credential {
  id: string;
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'pending_renewal' | 'suspended';
  verifiedAt?: string;
  verifiedById?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  certificateNumber?: string;
  documentUrl?: string;
}

export interface WorkPreferences {
  preferredShifts: ShiftType[];
  preferredDays: number[];
  maxConsecutiveDays?: number;
  minDaysOff?: number;
  unavailableDates?: string[];
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
}

export interface Shift {
  id: string;
  tenantId: string;
  name: string;
  shiftType: ShiftType;
  departmentId: string;
  departmentName: string;
  locationId?: string;
  locationName?: string;
  startTime: string;
  endTime: string;
  duration: number;
  breakDuration?: number;
  date: string;
  status: ShiftStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  requiredRole: string;
  requiredSkills?: string[];
  requiredCertifications?: string[];
  minStaffCount?: number;
  maxStaffCount?: number;
  currentStaffCount?: number;
  isOvertime?: boolean;
  isPremiumPay?: boolean;
  premiumRate?: number;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export type ShiftType = 
  | 'day'
  | 'evening'
  | 'night'
  | 'overnight'
  | 'morning'
  | 'afternoon'
  | 'split'
  | 'on_call'
  | 'custom';

export type ShiftStatus = 
  | 'open'
  | 'assigned'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Schedule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  departmentId: string;
  departmentName: string;
  startDate: string;
  endDate: string;
  status: ScheduleStatus;
  publishedAt?: string;
  publishedById?: string;
  shifts: Shift[];
  staffAssignments: StaffAssignment[];
  coverage: ScheduleCoverage;
  conflicts: ScheduleConflict[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleStatus = 'draft' | 'pending_approval' | 'approved' | 'published' | 'archived';

export interface StaffAssignment {
  id: string;
  shiftId: string;
  staffId: string;
  staffName: string;
  status: AssignmentStatus;
  assignedAt: string;
  confirmedAt?: string;
  clockInTime?: string;
  clockOutTime?: string;
  actualHours?: number;
  notes?: string;
}

export type AssignmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'clocked_in'
  | 'clocked_out'
  | 'no_show'
  | 'cancelled';

export interface ScheduleCoverage {
  totalShifts: number;
  assignedShifts: number;
  openShifts: number;
  coveragePercentage: number;
  byRole: {
    role: string;
    required: number;
    assigned: number;
    coverage: number;
  }[];
  byDay: {
    date: string;
    required: number;
    assigned: number;
    coverage: number;
  }[];
}

export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  severity: 'error' | 'warning' | 'info';
  staffId?: string;
  staffName?: string;
  shiftIds: string[];
  description: string;
  resolution?: string;
  resolvedAt?: string;
}

export type ConflictType = 
  | 'double_booking'
  | 'overtime_violation'
  | 'rest_period_violation'
  | 'consecutive_days_violation'
  | 'unavailability_conflict'
  | 'credential_expired'
  | 'skill_mismatch'
  | 'understaffed';

export interface TimeEntry {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  shiftId?: string;
  type: TimeEntryType;
  clockIn: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  breakDuration?: number;
  status: TimeEntryStatus;
  location?: string;
  ipAddress?: string;
  geoLocation?: { latitude: number; longitude: number };
  notes?: string;
  approvedById?: string;
  approvedAt?: string;
  modifiedById?: string;
  modifiedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type TimeEntryType = 'regular' | 'overtime' | 'on_call' | 'training' | 'meeting' | 'other';
export type TimeEntryStatus = 'pending' | 'approved' | 'rejected' | 'modified';

export interface TimeOffRequest {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalHours: number;
  status: TimeOffStatus;
  reason?: string;
  notes?: string;
  attachmentUrl?: string;
  requestedAt: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TimeOffType = 
  | 'vacation'
  | 'sick'
  | 'personal'
  | 'bereavement'
  | 'jury_duty'
  | 'military'
  | 'maternity'
  | 'paternity'
  | 'fmla'
  | 'unpaid'
  | 'other';

export type TimeOffStatus = 'pending' | 'approved' | 'denied' | 'cancelled';

export interface TimeOffBalance {
  staffId: string;
  balances: {
    type: TimeOffType;
    accrued: number;
    used: number;
    pending: number;
    available: number;
    carryOver?: number;
  }[];
  asOfDate: string;
}

export interface ShiftSwapRequest {
  id: string;
  tenantId: string;
  requesterId: string;
  requesterName: string;
  requesterShiftId: string;
  targetStaffId?: string;
  targetStaffName?: string;
  targetShiftId?: string;
  type: 'swap' | 'giveaway' | 'pickup';
  status: SwapStatus;
  reason?: string;
  requestedAt: string;
  respondedAt?: string;
  approvedById?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export type SwapStatus = 
  | 'pending_response'
  | 'pending_approval'
  | 'approved'
  | 'denied'
  | 'cancelled'
  | 'expired';

export interface ShiftTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  departmentId: string;
  shifts: {
    dayOfWeek: number;
    shiftType: ShiftType;
    startTime: string;
    endTime: string;
    requiredRole: string;
    minStaff: number;
    maxStaff: number;
  }[];
  isDefault: boolean;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffingRequirement {
  id: string;
  tenantId: string;
  departmentId: string;
  departmentName: string;
  effectiveDate: string;
  expirationDate?: string;
  requirements: {
    role: string;
    shiftType: ShiftType;
    minCount: number;
    optimalCount: number;
    skills?: string[];
    certifications?: string[];
  }[];
  patientRatio?: {
    role: string;
    patientsPerStaff: number;
  }[];
  notes?: string;
  createdById: string;
  createdAt: string;
}

export interface SchedulingDashboardMetrics {
  totalStaff: number;
  activeStaff: number;
  onLeaveStaff: number;
  openShifts: number;
  upcomingShifts: number;
  pendingTimeOffRequests: number;
  pendingSwapRequests: number;
  overtimeHoursThisWeek: number;
  coverageRate: number;
  staffUtilization: number;
  expiringCredentials: number;
  scheduleConflicts: number;
  byDepartment: {
    departmentId: string;
    departmentName: string;
    totalStaff: number;
    openShifts: number;
    coverage: number;
  }[];
  shiftDistribution: {
    shiftType: ShiftType;
    total: number;
    assigned: number;
    open: number;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// API Functions
// ============================================================================

export const staffApi = {
  // List staff
  list: async (
    page = 1,
    pageSize = 20,
    filters?: {
      departmentId?: string;
      status?: StaffStatus;
      employmentType?: EmploymentType;
      search?: string;
    }
  ): Promise<PaginatedResponse<StaffMember>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.departmentId && { departmentId: filters.departmentId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.employmentType && { employmentType: filters.employmentType }),
      ...(filters?.search && { search: filters.search }),
    });
    const response = await api.get(`/staff?${params}`);
    return response.data;
  },

  // Get staff member
  get: async (id: string): Promise<StaffMember> => {
    const api = getApi();
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },

  // Create staff member
  create: async (data: Partial<StaffMember>): Promise<StaffMember> => {
    const api = getApi();
    const response = await api.post('/staff', data);
    return response.data;
  },

  // Update staff member
  update: async (id: string, data: Partial<StaffMember>): Promise<StaffMember> => {
    const api = getApi();
    const response = await api.put(`/staff/${id}`, data);
    return response.data;
  },

  // Get staff schedule
  getSchedule: async (staffId: string, startDate: string, endDate: string): Promise<Shift[]> => {
    const api = getApi();
    const response = await api.get(`/staff/${staffId}/schedule?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Get available staff for shift
  getAvailable: async (shiftId: string): Promise<StaffMember[]> => {
    const api = getApi();
    const response = await api.get(`/staff/available-for-shift/${shiftId}`);
    return response.data;
  },

  // Update credentials
  updateCredentials: async (staffId: string, credentials: Credential[]): Promise<StaffMember> => {
    const api = getApi();
    const response = await api.put(`/staff/${staffId}/credentials`, { credentials });
    return response.data;
  },

  // Get expiring credentials
  getExpiringCredentials: async (daysAhead = 30): Promise<{
    staffId: string;
    staffName: string;
    credential: Credential;
  }[]> => {
    const api = getApi();
    const response = await api.get(`/staff/expiring-credentials?daysAhead=${daysAhead}`);
    return response.data;
  },
};

export const shiftsApi = {
  // List shifts
  list: async (
    startDate: string,
    endDate: string,
    filters?: {
      departmentId?: string;
      status?: ShiftStatus;
      shiftType?: ShiftType;
      staffId?: string;
    }
  ): Promise<Shift[]> => {
    const api = getApi();
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(filters?.departmentId && { departmentId: filters.departmentId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.shiftType && { shiftType: filters.shiftType }),
      ...(filters?.staffId && { staffId: filters.staffId }),
    });
    const response = await api.get(`/shifts?${params}`);
    return response.data;
  },

  // Get shift
  get: async (id: string): Promise<Shift> => {
    const api = getApi();
    const response = await api.get(`/shifts/${id}`);
    return response.data;
  },

  // Create shift
  create: async (data: Partial<Shift>): Promise<Shift> => {
    const api = getApi();
    const response = await api.post('/shifts', data);
    return response.data;
  },

  // Update shift
  update: async (id: string, data: Partial<Shift>): Promise<Shift> => {
    const api = getApi();
    const response = await api.put(`/shifts/${id}`, data);
    return response.data;
  },

  // Delete shift
  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/shifts/${id}`);
  },

  // Assign staff to shift
  assignStaff: async (shiftId: string, staffId: string): Promise<Shift> => {
    const api = getApi();
    const response = await api.post(`/shifts/${shiftId}/assign`, { staffId });
    return response.data;
  },

  // Unassign staff from shift
  unassignStaff: async (shiftId: string): Promise<Shift> => {
    const api = getApi();
    const response = await api.post(`/shifts/${shiftId}/unassign`);
    return response.data;
  },

  // Get open shifts
  getOpen: async (departmentId?: string): Promise<Shift[]> => {
    const api = getApi();
    const params = departmentId ? `?departmentId=${departmentId}` : '';
    const response = await api.get(`/shifts/open${params}`);
    return response.data;
  },

  // Bulk create shifts from template
  createFromTemplate: async (templateId: string, startDate: string, endDate: string): Promise<Shift[]> => {
    const api = getApi();
    const response = await api.post('/shifts/create-from-template', { templateId, startDate, endDate });
    return response.data;
  },
};

export const schedulesApi = {
  // List schedules
  list: async (
    departmentId?: string,
    status?: ScheduleStatus
  ): Promise<Schedule[]> => {
    const api = getApi();
    const params = new URLSearchParams();
    if (departmentId) params.append('departmentId', departmentId);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params}` : '';
    const response = await api.get(`/schedules${queryString}`);
    return response.data;
  },

  // Get schedule
  get: async (id: string): Promise<Schedule> => {
    const api = getApi();
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  // Create schedule
  create: async (data: Partial<Schedule>): Promise<Schedule> => {
    const api = getApi();
    const response = await api.post('/schedules', data);
    return response.data;
  },

  // Update schedule
  update: async (id: string, data: Partial<Schedule>): Promise<Schedule> => {
    const api = getApi();
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },

  // Publish schedule
  publish: async (id: string, notifyStaff = true): Promise<Schedule> => {
    const api = getApi();
    const response = await api.post(`/schedules/${id}/publish`, { notifyStaff });
    return response.data;
  },

  // Auto-schedule (AI-assisted)
  autoSchedule: async (id: string, options?: {
    respectPreferences?: boolean;
    balanceHours?: boolean;
    minimizeOvertime?: boolean;
  }): Promise<Schedule> => {
    const api = getApi();
    const response = await api.post(`/schedules/${id}/auto-schedule`, options);
    return response.data;
  },

  // Validate schedule
  validate: async (id: string): Promise<ScheduleConflict[]> => {
    const api = getApi();
    const response = await api.post(`/schedules/${id}/validate`);
    return response.data;
  },

  // Get coverage report
  getCoverage: async (id: string): Promise<ScheduleCoverage> => {
    const api = getApi();
    const response = await api.get(`/schedules/${id}/coverage`);
    return response.data;
  },
};

export const timeEntriesApi = {
  // List time entries
  list: async (
    page = 1,
    pageSize = 20,
    filters?: {
      staffId?: string;
      departmentId?: string;
      status?: TimeEntryStatus;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedResponse<TimeEntry>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.staffId && { staffId: filters.staffId }),
      ...(filters?.departmentId && { departmentId: filters.departmentId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });
    const response = await api.get(`/time-entries?${params}`);
    return response.data;
  },

  // Clock in
  clockIn: async (shiftId?: string, notes?: string): Promise<TimeEntry> => {
    const api = getApi();
    const response = await api.post('/time-entries/clock-in', { shiftId, notes });
    return response.data;
  },

  // Clock out
  clockOut: async (entryId: string, notes?: string): Promise<TimeEntry> => {
    const api = getApi();
    const response = await api.post(`/time-entries/${entryId}/clock-out`, { notes });
    return response.data;
  },

  // Start break
  startBreak: async (entryId: string): Promise<TimeEntry> => {
    const api = getApi();
    const response = await api.post(`/time-entries/${entryId}/start-break`);
    return response.data;
  },

  // End break
  endBreak: async (entryId: string): Promise<TimeEntry> => {
    const api = getApi();
    const response = await api.post(`/time-entries/${entryId}/end-break`);
    return response.data;
  },

  // Approve entry
  approve: async (entryId: string): Promise<TimeEntry> => {
    const api = getApi();
    const response = await api.post(`/time-entries/${entryId}/approve`);
    return response.data;
  },

  // Bulk approve
  bulkApprove: async (entryIds: string[]): Promise<{ approved: number; errors: string[] }> => {
    const api = getApi();
    const response = await api.post('/time-entries/bulk-approve', { entryIds });
    return response.data;
  },

  // Modify entry
  modify: async (entryId: string, data: Partial<TimeEntry>, reason: string): Promise<TimeEntry> => {
    const api = getApi();
    const response = await api.put(`/time-entries/${entryId}`, { ...data, modifiedReason: reason });
    return response.data;
  },

  // Get timesheet
  getTimesheet: async (staffId: string, startDate: string, endDate: string): Promise<{
    entries: TimeEntry[];
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
    status: 'draft' | 'submitted' | 'approved';
  }> => {
    const api = getApi();
    const response = await api.get(`/time-entries/timesheet/${staffId}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};

export const timeOffApi = {
  // List requests
  list: async (
    page = 1,
    pageSize = 20,
    filters?: {
      staffId?: string;
      status?: TimeOffStatus;
      type?: TimeOffType;
    }
  ): Promise<PaginatedResponse<TimeOffRequest>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.staffId && { staffId: filters.staffId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
    });
    const response = await api.get(`/time-off?${params}`);
    return response.data;
  },

  // Create request
  create: async (data: Partial<TimeOffRequest>): Promise<TimeOffRequest> => {
    const api = getApi();
    const response = await api.post('/time-off', data);
    return response.data;
  },

  // Approve request
  approve: async (id: string, notes?: string): Promise<TimeOffRequest> => {
    const api = getApi();
    const response = await api.post(`/time-off/${id}/approve`, { notes });
    return response.data;
  },

  // Deny request
  deny: async (id: string, notes: string): Promise<TimeOffRequest> => {
    const api = getApi();
    const response = await api.post(`/time-off/${id}/deny`, { notes });
    return response.data;
  },

  // Cancel request
  cancel: async (id: string): Promise<TimeOffRequest> => {
    const api = getApi();
    const response = await api.post(`/time-off/${id}/cancel`);
    return response.data;
  },

  // Get balance
  getBalance: async (staffId: string): Promise<TimeOffBalance> => {
    const api = getApi();
    const response = await api.get(`/time-off/balance/${staffId}`);
    return response.data;
  },

  // Get calendar (for viewing team time off)
  getCalendar: async (departmentId: string, month: string): Promise<{
    date: string;
    requests: { staffId: string; staffName: string; type: TimeOffType }[];
  }[]> => {
    const api = getApi();
    const response = await api.get(`/time-off/calendar?departmentId=${departmentId}&month=${month}`);
    return response.data;
  },
};

export const shiftSwapApi = {
  // List swap requests
  list: async (
    status?: SwapStatus
  ): Promise<ShiftSwapRequest[]> => {
    const api = getApi();
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/shift-swaps${params}`);
    return response.data;
  },

  // Create swap request
  create: async (data: Partial<ShiftSwapRequest>): Promise<ShiftSwapRequest> => {
    const api = getApi();
    const response = await api.post('/shift-swaps', data);
    return response.data;
  },

  // Respond to swap (target staff)
  respond: async (id: string, accept: boolean): Promise<ShiftSwapRequest> => {
    const api = getApi();
    const response = await api.post(`/shift-swaps/${id}/respond`, { accept });
    return response.data;
  },

  // Approve swap (manager)
  approve: async (id: string): Promise<ShiftSwapRequest> => {
    const api = getApi();
    const response = await api.post(`/shift-swaps/${id}/approve`);
    return response.data;
  },

  // Deny swap (manager)
  deny: async (id: string, reason: string): Promise<ShiftSwapRequest> => {
    const api = getApi();
    const response = await api.post(`/shift-swaps/${id}/deny`, { reason });
    return response.data;
  },
};

export const shiftTemplatesApi = {
  // List templates
  list: async (departmentId?: string): Promise<ShiftTemplate[]> => {
    const api = getApi();
    const params = departmentId ? `?departmentId=${departmentId}` : '';
    const response = await api.get(`/shift-templates${params}`);
    return response.data;
  },

  // Get template
  get: async (id: string): Promise<ShiftTemplate> => {
    const api = getApi();
    const response = await api.get(`/shift-templates/${id}`);
    return response.data;
  },

  // Create template
  create: async (data: Partial<ShiftTemplate>): Promise<ShiftTemplate> => {
    const api = getApi();
    const response = await api.post('/shift-templates', data);
    return response.data;
  },

  // Update template
  update: async (id: string, data: Partial<ShiftTemplate>): Promise<ShiftTemplate> => {
    const api = getApi();
    const response = await api.put(`/shift-templates/${id}`, data);
    return response.data;
  },

  // Delete template
  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/shift-templates/${id}`);
  },
};

export const staffingRequirementsApi = {
  // List requirements
  list: async (departmentId?: string): Promise<StaffingRequirement[]> => {
    const api = getApi();
    const params = departmentId ? `?departmentId=${departmentId}` : '';
    const response = await api.get(`/staffing-requirements${params}`);
    return response.data;
  },

  // Get requirement
  get: async (id: string): Promise<StaffingRequirement> => {
    const api = getApi();
    const response = await api.get(`/staffing-requirements/${id}`);
    return response.data;
  },

  // Create requirement
  create: async (data: Partial<StaffingRequirement>): Promise<StaffingRequirement> => {
    const api = getApi();
    const response = await api.post('/staffing-requirements', data);
    return response.data;
  },

  // Update requirement
  update: async (id: string, data: Partial<StaffingRequirement>): Promise<StaffingRequirement> => {
    const api = getApi();
    const response = await api.put(`/staffing-requirements/${id}`, data);
    return response.data;
  },
};

export const schedulingDashboardApi = {
  // Get dashboard metrics
  getMetrics: async (): Promise<SchedulingDashboardMetrics> => {
    const api = getApi();
    const response = await api.get('/scheduling/dashboard');
    return response.data;
  },

  // Get overtime report
  getOvertimeReport: async (startDate: string, endDate: string): Promise<{
    staffId: string;
    staffName: string;
    department: string;
    regularHours: number;
    overtimeHours: number;
    totalHours: number;
  }[]> => {
    const api = getApi();
    const response = await api.get(`/scheduling/reports/overtime?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Get attendance report
  getAttendanceReport: async (startDate: string, endDate: string): Promise<{
    staffId: string;
    staffName: string;
    department: string;
    scheduledShifts: number;
    attendedShifts: number;
    noShows: number;
    lateArrivals: number;
    attendanceRate: number;
  }[]> => {
    const api = getApi();
    const response = await api.get(`/scheduling/reports/attendance?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};
