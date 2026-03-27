import { getApi } from '../api';

// ============================================================================
// Types
// ============================================================================

export interface PatientPortalUser {
  id: string;
  patientId: string;
  email: string;
  username: string;
  isActive: boolean;
  isVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  preferences: {
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    language: string;
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PortalAppointment {
  id: string;
  providerId: string;
  providerName: string;
  specialty: string;
  appointmentType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
  location: {
    facilityName: string;
    address: string;
    room?: string;
  };
  reason?: string;
  notes?: string;
  telehealth?: {
    enabled: boolean;
    meetingUrl?: string;
    meetingId?: string;
  };
  canCancel: boolean;
  canReschedule: boolean;
  cancellationDeadline?: string;
}

export interface AvailableSlot {
  providerId: string;
  providerName: string;
  specialty: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  duration: number;
  isAvailable: boolean;
}

export interface PortalDocument {
  id: string;
  name: string;
  type: 'lab_result' | 'imaging' | 'prescription' | 'visit_summary' | 'discharge_summary' | 'consent_form' | 'other';
  category: string;
  date: string;
  provider?: string;
  isNew: boolean;
  canDownload: boolean;
  url?: string;
}

export interface PortalMessage {
  id: string;
  subject: string;
  body: string;
  senderId: string;
  senderName: string;
  senderType: 'patient' | 'provider' | 'staff' | 'system';
  recipientId: string;
  isRead: boolean;
  readAt?: string;
  threadId?: string;
  attachments?: { id: string; name: string; url: string }[];
  createdAt: string;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  prescribedBy: string;
  pharmacy?: string;
  refillsRemaining: number;
  lastFilledDate?: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'discontinued';
  canRequestRefill: boolean;
}

export interface HealthRecord {
  allergies: { name: string; reaction: string; severity: string; recordedDate: string }[];
  medications: { name: string; dosage: string; frequency: string; startDate: string; status: string }[];
  conditions: { name: string; diagnosedDate: string; status: string; notes?: string }[];
  immunizations: { name: string; date: string; provider: string; nextDueDate?: string }[];
  vitals: {
    date: string;
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  }[];
  labResults: {
    id: string;
    testName: string;
    date: string;
    result: string;
    status: string;
    isAbnormal: boolean;
  }[];
}

export interface BillingStatement {
  id: string;
  statementNumber: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  items: {
    description: string;
    date: string;
    provider: string;
    amount: number;
    insurance: number;
    patientResponsibility: number;
  }[];
  canPayOnline: boolean;
}

export interface InsuranceInfo {
  id: string;
  provider: string;
  planName: string;
  memberId: string;
  groupNumber?: string;
  effectiveDate: string;
  expirationDate?: string;
  isPrimary: boolean;
  status: 'active' | 'inactive' | 'pending_verification';
}

// ============================================================================
// Portal Authentication API
// ============================================================================

export const portalAuthApi = {
  register: async (data: { email: string; password: string; patientId: string }): Promise<{ user: PatientPortalUser; token: string }> => {
    const api = getApi();
    const response = await api.post('/portal/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<{ user: PatientPortalUser; token: string }> => {
    const api = getApi();
    const response = await api.post('/portal/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    const api = getApi();
    await api.post('/portal/auth/logout');
  },

  verifyEmail: async (token: string): Promise<void> => {
    const api = getApi();
    await api.post('/portal/auth/verify-email', { token });
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    const api = getApi();
    await api.post('/portal/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const api = getApi();
    await api.post('/portal/auth/reset-password', { token, newPassword });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const api = getApi();
    await api.post('/portal/auth/change-password', { currentPassword, newPassword });
  },
};

// ============================================================================
// Appointments API
// ============================================================================

export const portalAppointmentsApi = {
  list: async (params?: { status?: string; dateFrom?: string; dateTo?: string }): Promise<PortalAppointment[]> => {
    const api = getApi();
    const response = await api.get('/portal/appointments', { params });
    return response.data;
  },

  get: async (id: string): Promise<PortalAppointment> => {
    const api = getApi();
    const response = await api.get(`/portal/appointments/${id}`);
    return response.data;
  },

  getAvailableSlots: async (params: { providerId?: string; specialty?: string; date: string; appointmentType?: string }): Promise<AvailableSlot[]> => {
    const api = getApi();
    const response = await api.get('/portal/appointments/available-slots', { params });
    return response.data;
  },

  book: async (data: { providerId: string; date: string; startTime: string; appointmentType: string; reason: string }): Promise<PortalAppointment> => {
    const api = getApi();
    const response = await api.post('/portal/appointments/book', data);
    return response.data;
  },

  cancel: async (id: string, reason: string): Promise<PortalAppointment> => {
    const api = getApi();
    const response = await api.post(`/portal/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  reschedule: async (id: string, newDate: string, newStartTime: string): Promise<PortalAppointment> => {
    const api = getApi();
    const response = await api.post(`/portal/appointments/${id}/reschedule`, { newDate, newStartTime });
    return response.data;
  },

  confirm: async (id: string): Promise<PortalAppointment> => {
    const api = getApi();
    const response = await api.post(`/portal/appointments/${id}/confirm`);
    return response.data;
  },

  joinTelehealth: async (id: string): Promise<{ meetingUrl: string; meetingId: string }> => {
    const api = getApi();
    const response = await api.post(`/portal/appointments/${id}/join-telehealth`);
    return response.data;
  },
};

// ============================================================================
// Documents API
// ============================================================================

export const portalDocumentsApi = {
  list: async (params?: { type?: string; dateFrom?: string; dateTo?: string }): Promise<PortalDocument[]> => {
    const api = getApi();
    const response = await api.get('/portal/documents', { params });
    return response.data;
  },

  get: async (id: string): Promise<PortalDocument> => {
    const api = getApi();
    const response = await api.get(`/portal/documents/${id}`);
    return response.data;
  },

  download: async (id: string): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/portal/documents/${id}/download`, { responseType: 'blob' });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    const api = getApi();
    await api.post(`/portal/documents/${id}/mark-read`);
  },
};

// ============================================================================
// Messages API
// ============================================================================

export const portalMessagesApi = {
  list: async (params?: { isRead?: boolean }): Promise<PortalMessage[]> => {
    const api = getApi();
    const response = await api.get('/portal/messages', { params });
    return response.data;
  },

  get: async (id: string): Promise<PortalMessage> => {
    const api = getApi();
    const response = await api.get(`/portal/messages/${id}`);
    return response.data;
  },

  send: async (data: { recipientId: string; subject: string; body: string; attachmentIds?: string[] }): Promise<PortalMessage> => {
    const api = getApi();
    const response = await api.post('/portal/messages', data);
    return response.data;
  },

  reply: async (threadId: string, body: string): Promise<PortalMessage> => {
    const api = getApi();
    const response = await api.post(`/portal/messages/${threadId}/reply`, { body });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    const api = getApi();
    await api.post(`/portal/messages/${id}/mark-read`);
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/portal/messages/${id}`);
  },
};

// ============================================================================
// Health Records API
// ============================================================================

export const portalHealthRecordsApi = {
  get: async (): Promise<HealthRecord> => {
    const api = getApi();
    const response = await api.get('/portal/health-records');
    return response.data;
  },

  getAllergies: async (): Promise<HealthRecord['allergies']> => {
    const api = getApi();
    const response = await api.get('/portal/health-records/allergies');
    return response.data;
  },

  getMedications: async (): Promise<HealthRecord['medications']> => {
    const api = getApi();
    const response = await api.get('/portal/health-records/medications');
    return response.data;
  },

  getConditions: async (): Promise<HealthRecord['conditions']> => {
    const api = getApi();
    const response = await api.get('/portal/health-records/conditions');
    return response.data;
  },

  getVitals: async (): Promise<HealthRecord['vitals']> => {
    const api = getApi();
    const response = await api.get('/portal/health-records/vitals');
    return response.data;
  },

  getLabResults: async (): Promise<HealthRecord['labResults']> => {
    const api = getApi();
    const response = await api.get('/portal/health-records/lab-results');
    return response.data;
  },

  exportHealthRecord: async (): Promise<Blob> => {
    const api = getApi();
    const response = await api.get('/portal/health-records/export', { responseType: 'blob' });
    return response.data;
  },
};

// ============================================================================
// Prescriptions API
// ============================================================================

export const portalPrescriptionsApi = {
  list: async (params?: { status?: string }): Promise<Prescription[]> => {
    const api = getApi();
    const response = await api.get('/portal/prescriptions', { params });
    return response.data;
  },

  get: async (id: string): Promise<Prescription> => {
    const api = getApi();
    const response = await api.get(`/portal/prescriptions/${id}`);
    return response.data;
  },

  requestRefill: async (id: string, pharmacy?: string): Promise<void> => {
    const api = getApi();
    await api.post(`/portal/prescriptions/${id}/request-refill`, { pharmacy });
  },
};

// ============================================================================
// Billing API
// ============================================================================

export const portalBillingApi = {
  getStatements: async (): Promise<BillingStatement[]> => {
    const api = getApi();
    const response = await api.get('/portal/billing/statements');
    return response.data;
  },

  getStatement: async (id: string): Promise<BillingStatement> => {
    const api = getApi();
    const response = await api.get(`/portal/billing/statements/${id}`);
    return response.data;
  },

  downloadStatement: async (id: string): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/portal/billing/statements/${id}/download`, { responseType: 'blob' });
    return response.data;
  },

  makePayment: async (statementId: string, amount: number, paymentMethod: string): Promise<{ success: boolean; transactionId: string }> => {
    const api = getApi();
    const response = await api.post('/portal/billing/make-payment', { statementId, amount, paymentMethod });
    return response.data;
  },

  getInsurance: async (): Promise<InsuranceInfo[]> => {
    const api = getApi();
    const response = await api.get('/portal/billing/insurance');
    return response.data;
  },

  addInsurance: async (data: Omit<InsuranceInfo, 'id' | 'status'>): Promise<InsuranceInfo> => {
    const api = getApi();
    const response = await api.post('/portal/billing/insurance', data);
    return response.data;
  },

  updateInsurance: async (id: string, data: Partial<InsuranceInfo>): Promise<InsuranceInfo> => {
    const api = getApi();
    const response = await api.put(`/portal/billing/insurance/${id}`, data);
    return response.data;
  },
};

// ============================================================================
// Profile API
// ============================================================================

export const portalProfileApi = {
  get: async (): Promise<PatientPortalUser> => {
    const api = getApi();
    const response = await api.get('/portal/profile');
    return response.data;
  },

  update: async (data: Partial<PatientPortalUser>): Promise<PatientPortalUser> => {
    const api = getApi();
    const response = await api.put('/portal/profile', data);
    return response.data;
  },

  updatePreferences: async (preferences: PatientPortalUser['preferences']): Promise<PatientPortalUser> => {
    const api = getApi();
    const response = await api.patch('/portal/profile/preferences', preferences);
    return response.data;
  },

  getDashboard: async (): Promise<{
    upcomingAppointments: PortalAppointment[];
    recentDocuments: PortalDocument[];
    unreadMessages: number;
    activePrescriptions: number;
    pendingBills: number;
  }> => {
    const api = getApi();
    const response = await api.get('/portal/dashboard');
    return response.data;
  },
};
