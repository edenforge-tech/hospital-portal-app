import { getApi } from '../api';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentId?: string;
  departmentName?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reasonForVisit?: string;
  duration: number; // minutes
}

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  patientId?: string;
  departmentId?: string;
  status?: string;
  appointmentType?: string;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  departmentId?: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  appointmentType: string;
  reasonForVisit?: string;
  notes?: string;
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {
  status?: string;
}

export const appointmentsApi = {
  // List appointments with filters
  getAll: async (filters?: AppointmentFilters) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.status) params.append('status', filters.status);
    
    return getApi().get<Appointment[]>(`/appointments?${params.toString()}`);
  },

  // Get single appointment
  getById: async (id: string) => {
    return getApi().get<Appointment>(`/appointments/${id}`);
  },

  // Create appointment
  create: async (data: CreateAppointmentDto) => {
    return getApi().post<Appointment>('/appointments', data);
  },

  // Update appointment
  update: async (id: string, data: UpdateAppointmentDto) => {
    return getApi().put<Appointment>(`/appointments/${id}`, data);
  },

  // Delete/Cancel appointment
  cancel: async (id: string) => {
    return getApi().delete(`/appointments/${id}`);
  },

  // Change status
  updateStatus: async (id: string, status: string) => {
    return getApi().put(`/appointments/${id}/status`, { status });
  },

  // Get calendar view data
  getCalendarData: async (startDate: string, endDate: string) => {
    return getApi().get<Appointment[]>(`/appointments/calendar?startDate=${startDate}&endDate=${endDate}`);
  },

  // Check availability (optional)
  checkAvailability: async (doctorId: string, date: string, startTime: string, duration: number) => {
    return getApi().get(`/appointments/availability?doctorId=${doctorId}&date=${date}&startTime=${startTime}&duration=${duration}`);
  }
};
