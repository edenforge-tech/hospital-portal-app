import { getApi } from '../api';

export interface FamilyHistory {
  id: string;
  patientId: string;
  tenantId?: string;
  relation: string; // father, mother, sibling, grandparent, etc.
  condition: string;
  ageAtDiagnosis?: number;
  isDeceased?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface FamilyHistoryFormData {
  patientId: string;
  relation: string;
  condition: string;
  ageAtDiagnosis?: number;
  isDeceased?: boolean;
  notes?: string;
}

export const familyHistoryApi = {
  async getByPatient(patientId: string) {
    const api = getApi();
    return api.get<FamilyHistory[]>(`/family-history/patient/${patientId}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<FamilyHistory>(`/family-history/${id}`);
  },

  async create(data: FamilyHistoryFormData) {
    const api = getApi();
    return api.post<FamilyHistory>('/family-history', data);
  },

  async update(id: string, data: Partial<FamilyHistoryFormData>) {
    const api = getApi();
    return api.put<FamilyHistory>(`/family-history/${id}`, data);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/family-history/${id}`);
  },
};
