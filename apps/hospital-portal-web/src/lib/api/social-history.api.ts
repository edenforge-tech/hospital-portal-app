import { getApi } from '../api';

export interface SocialHistory {
  id: string;
  patientId: string;
  tenantId?: string;
  smokingStatus: string; // never, former, current
  alcoholUse: string; // never, occasional, moderate, heavy
  occupation?: string;
  exerciseFrequency?: string; // sedentary, light, moderate, active
  diet?: string;
  substanceUse?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SocialHistoryFormData {
  patientId: string;
  smokingStatus: string;
  alcoholUse: string;
  occupation?: string;
  exerciseFrequency?: string;
  diet?: string;
  substanceUse?: string;
  notes?: string;
}

export const socialHistoryApi = {
  async getByPatient(patientId: string) {
    const api = getApi();
    return api.get<SocialHistory[]>(`/social-history/patient/${patientId}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<SocialHistory>(`/social-history/${id}`);
  },

  async create(data: SocialHistoryFormData) {
    const api = getApi();
    return api.post<SocialHistory>('/social-history', data);
  },

  async update(id: string, data: Partial<SocialHistoryFormData>) {
    const api = getApi();
    return api.put<SocialHistory>(`/social-history/${id}`, data);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/social-history/${id}`);
  },
};
