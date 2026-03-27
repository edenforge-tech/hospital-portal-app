import { getApi } from '../api';

// ============================================================================
// Types
// ============================================================================

export interface Referral {
  id: string;
  tenantId: string;
  referralNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientDob: string;
  referringProviderId: string;
  referringProviderName: string;
  referringDepartment?: string;
  referredToProviderId?: string;
  referredToProviderName?: string;
  referredToSpecialty: string;
  referredToFacility?: string;
  referredToOrganizationId?: string;
  priority: 'routine' | 'urgent' | 'stat';
  type: 'internal' | 'external';
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'rejected' | 'expired';
  reason: string;
  diagnosis?: string;
  clinicalNotes?: string;
  urgencyReason?: string;
  attachments: ReferralAttachment[];
  appointmentId?: string;
  appointmentDate?: string;
  scheduledDate?: string;
  completedDate?: string;
  expirationDate?: string;
  insurance?: {
    authorizationRequired: boolean;
    authorizationNumber?: string;
    authorizationStatus?: 'pending' | 'approved' | 'denied';
    authorizationDate?: string;
  };
  followUp: {
    required: boolean;
    dueDate?: string;
    completedDate?: string;
    notes?: string;
  };
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralAttachment {
  id: string;
  referralId: string;
  documentId: string;
  documentName: string;
  documentType: string;
  documentUrl: string;
  uploadedById: string;
  uploadedAt: string;
}

export interface ReferralTemplate {
  id: string;
  tenantId: string;
  name: string;
  specialty: string;
  defaultPriority: Referral['priority'];
  defaultNotes?: string;
  requiredDocuments: string[];
  authorizationRequired: boolean;
  expirationDays: number;
  isActive: boolean;
}

export interface CreateReferralRequest {
  patientId: string;
  referringProviderId: string;
  referredToProviderId?: string;
  referredToSpecialty: string;
  referredToFacility?: string;
  priority: Referral['priority'];
  type: Referral['type'];
  reason: string;
  diagnosis?: string;
  clinicalNotes?: string;
  urgencyReason?: string;
  attachmentIds?: string[];
  insurance?: Referral['insurance'];
}

export interface ReferralListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  patientId?: string;
  referringProviderId?: string;
  referredToProviderId?: string;
  specialty?: string;
  priority?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Referrals API
// ============================================================================

export const referralsApi = {
  list: async (params?: ReferralListParams): Promise<PaginatedResponse<Referral>> => {
    const api = getApi();
    const response = await api.get('/referrals', { params });
    return response.data;
  },

  get: async (id: string): Promise<Referral> => {
    const api = getApi();
    const response = await api.get(`/referrals/${id}`);
    return response.data;
  },

  create: async (data: CreateReferralRequest): Promise<Referral> => {
    const api = getApi();
    const response = await api.post('/referrals', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateReferralRequest>): Promise<Referral> => {
    const api = getApi();
    const response = await api.put(`/referrals/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/referrals/${id}`);
  },

  schedule: async (id: string, appointmentDate: string): Promise<Referral> => {
    const api = getApi();
    const response = await api.post(`/referrals/${id}/schedule`, { appointmentDate });
    return response.data;
  },

  accept: async (id: string, notes?: string): Promise<Referral> => {
    const api = getApi();
    const response = await api.post(`/referrals/${id}/accept`, { notes });
    return response.data;
  },

  reject: async (id: string, reason: string): Promise<Referral> => {
    const api = getApi();
    const response = await api.post(`/referrals/${id}/reject`, { reason });
    return response.data;
  },

  complete: async (id: string, notes?: string): Promise<Referral> => {
    const api = getApi();
    const response = await api.post(`/referrals/${id}/complete`, { notes });
    return response.data;
  },

  cancel: async (id: string, reason: string): Promise<Referral> => {
    const api = getApi();
    const response = await api.post(`/referrals/${id}/cancel`, { reason });
    return response.data;
  },

  addAttachment: async (id: string, documentId: string): Promise<ReferralAttachment> => {
    const api = getApi();
    const response = await api.post(`/referrals/${id}/attachments`, { documentId });
    return response.data;
  },

  removeAttachment: async (id: string, attachmentId: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/referrals/${id}/attachments/${attachmentId}`);
  },

  requestAuthorization: async (id: string): Promise<Referral> => {
    const api = getApi();
    const response = await api.post(`/referrals/${id}/request-authorization`);
    return response.data;
  },

  updateAuthorization: async (id: string, data: { authorizationNumber: string; status: string }): Promise<Referral> => {
    const api = getApi();
    const response = await api.patch(`/referrals/${id}/authorization`, data);
    return response.data;
  },

  getByPatient: async (patientId: string): Promise<Referral[]> => {
    const api = getApi();
    const response = await api.get(`/referrals/patient/${patientId}`);
    return response.data;
  },

  getPending: async (): Promise<Referral[]> => {
    const api = getApi();
    const response = await api.get('/referrals/pending');
    return response.data;
  },

  getExpiring: async (daysAhead: number = 7): Promise<Referral[]> => {
    const api = getApi();
    const response = await api.get('/referrals/expiring', { params: { daysAhead } });
    return response.data;
  },

  getStats: async (params?: { dateFrom?: string; dateTo?: string }): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    bySpecialty: Record<string, number>;
    pending: number;
    overdue: number;
    completionRate: number;
  }> => {
    const api = getApi();
    const response = await api.get('/referrals/stats', { params });
    return response.data;
  },
};

// ============================================================================
// Templates API
// ============================================================================

export const referralTemplatesApi = {
  list: async (): Promise<ReferralTemplate[]> => {
    const api = getApi();
    const response = await api.get('/referrals/templates');
    return response.data;
  },

  get: async (id: string): Promise<ReferralTemplate> => {
    const api = getApi();
    const response = await api.get(`/referrals/templates/${id}`);
    return response.data;
  },

  create: async (data: Omit<ReferralTemplate, 'id' | 'tenantId'>): Promise<ReferralTemplate> => {
    const api = getApi();
    const response = await api.post('/referrals/templates', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ReferralTemplate>): Promise<ReferralTemplate> => {
    const api = getApi();
    const response = await api.put(`/referrals/templates/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/referrals/templates/${id}`);
  },

  createFromTemplate: async (templateId: string, data: { patientId: string; referringProviderId: string }): Promise<Referral> => {
    const api = getApi();
    const response = await api.post(`/referrals/templates/${templateId}/create`, data);
    return response.data;
  },
};
