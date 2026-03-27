import { getApi } from '../api';

export interface SurgicalHistory {
  id: string;
  patientId: string;
  tenantId?: string;
  procedureName: string;
  surgeryDate?: string;
  surgeon?: string;
  hospital?: string;
  outcome?: string; // successful, complications, failed
  complications?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SurgicalHistoryFormData {
  patientId: string;
  procedureName: string;
  surgeryDate?: string;
  surgeon?: string;
  hospital?: string;
  outcome?: string;
  complications?: string;
  notes?: string;
}

export const surgicalHistoryApi = {
  async getByPatient(patientId: string) {
    const api = getApi();
    return api.get<SurgicalHistory[]>(`/surgical-history/patient/${patientId}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<SurgicalHistory>(`/surgical-history/${id}`);
  },

  async create(data: SurgicalHistoryFormData) {
    const api = getApi();
    return api.post<SurgicalHistory>('/surgical-history', data);
  },

  async update(id: string, data: Partial<SurgicalHistoryFormData>) {
    const api = getApi();
    return api.put<SurgicalHistory>(`/surgical-history/${id}`, data);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/surgical-history/${id}`);
  },
};
