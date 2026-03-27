// Follow-Up Appointments API Client
import { getApi } from '../api';

export interface FollowUpAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  followUpType: string;
  relatedProcedure?: string;
  procedureDate?: string;
  scheduledDate: string;
  scheduledTime?: string;
  status: string;
  priority: string;
  assignedDoctorId: string;
  assignedDoctorName: string;
  departmentId: string;
  departmentName: string;
  notes?: string;
  remindersSent: number;
  lastReminderDate?: string;
  completedDate?: string;
  outcome?: string;
}

export interface FollowUpFilters {
  status?: string;
  priority?: string;
  fromDate?: string;
  toDate?: string;
  departmentId?: string;
  doctorId?: string;
}

export interface CreateFollowUpRequest {
  patientId: string;
  followUpType: string;
  relatedProcedure?: string;
  procedureDate?: string;
  scheduledDate: string;
  scheduledTime?: string;
  priority?: string;
  assignedDoctorId: string;
  departmentId: string;
  notes?: string;
}

export interface UpdateFollowUpRequest {
  scheduledDate?: string;
  scheduledTime?: string;
  status?: string;
  priority?: string;
  notes?: string;
  outcome?: string;
}

export interface CompleteFollowUpRequest {
  outcome: string;
}

export interface RescheduleFollowUpRequest {
  newDate: string;
  newTime?: string;
}

export interface FollowUpsResponse {
  followUps: FollowUpAppointment[];
  total: number;
}

export const followUpApi = {
  /**
   * Get all follow-up appointments with optional filters
   */
  getAll: (filters?: FollowUpFilters): Promise<FollowUpsResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);

    return getApi()
      .get(`/followups?${params.toString()}`)
      .then((res) => res.data.data || res.data.followUps || res.data);
  },

  /**
   * Get follow-up appointment by ID
   */
  getById: (id: string): Promise<FollowUpAppointment> => {
    return getApi()
      .get(`/followups/${id}`)
      .then((res) => res.data.data || res.data);
  },

  /**
   * Create new follow-up appointment
   */
  create: (data: CreateFollowUpRequest): Promise<FollowUpAppointment> => {
    return getApi()
      .post('/followups', data)
      .then((res) => res.data.data || res.data);
  },

  /**
   * Update follow-up appointment
   */
  update: (id: string, data: UpdateFollowUpRequest): Promise<FollowUpAppointment> => {
    return getApi()
      .put(`/followups/${id}`, data)
      .then((res) => res.data.data || res.data);
  },

  /**
   * Complete follow-up appointment
   */
  complete: (id: string, outcome: string): Promise<FollowUpAppointment> => {
    return getApi()
      .post(`/followups/${id}/complete`, { outcome })
      .then((res) => res.data.data || res.data);
  },

  /**
   * Reschedule follow-up appointment
   */
  reschedule: (id: string, newDate: string, newTime?: string): Promise<FollowUpAppointment> => {
    return getApi()
      .post(`/followups/${id}/reschedule`, { newDate, newTime })
      .then((res) => res.data.data || res.data);
  },

  /**
   * Delete follow-up appointment
   */
  delete: (id: string): Promise<{ message: string }> => {
    return getApi()
      .delete(`/followups/${id}`)
      .then((res) => res.data);
  },
};
