import { getApi } from '../api';

export interface ChronicCondition {
  id: string;
  patientId: string;
  tenantId?: string;
  condition: string;
  diagnosedDate?: string;
  severity: string; // mild, moderate, severe
  status: string; // active, managed, resolved
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ChronicConditionFormData {
  patientId: string;
  condition: string;
  diagnosedDate?: string;
  severity: string;
  status?: string;
  notes?: string;
}

export const chronicConditionsApi = {
  async getByPatient(patientId: string) {
    const api = getApi();
    return api.get<ChronicCondition[]>(`/chronic-conditions/patient/${patientId}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<ChronicCondition>(`/chronic-conditions/${id}`);
  },

  async create(data: ChronicConditionFormData) {
    const api = getApi();
    return api.post<ChronicCondition>('/chronic-conditions', data);
  },

  async update(id: string, data: Partial<ChronicConditionFormData>) {
    const api = getApi();
    return api.put<ChronicCondition>(`/chronic-conditions/${id}`, data);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/chronic-conditions/${id}`);
  },
};
