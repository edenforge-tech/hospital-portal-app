import { getApi } from '../api';

// Types matching backend PatientAllergy model
export interface PatientAllergy {
  id: string;
  patientId: string;
  tenantId?: string;
  allergenName: string;
  allergenType: string; // medication, food, environmental, latex, other
  severity: string; // mild, moderate, severe, life_threatening
  reaction?: string;
  onsetDate?: string;
  verified: boolean;
  verifiedBy?: string;
  notes?: string;
  status: string; // active, inactive, resolved
  createdAt: string;
  updatedAt?: string;
}

export interface PatientAllergyFormData {
  patientId: string;
  allergenName: string;
  allergenType: string;
  severity: string;
  reaction?: string;
  onsetDate?: string;
  verified?: boolean;
  verifiedBy?: string;
  notes?: string;
  status?: string;
}

export const patientAllergiesApi = {
  async getByPatient(patientId: string) {
    const api = getApi();
    return api.get<PatientAllergy[]>(`/patient-allergies/patient/${patientId}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<PatientAllergy>(`/patient-allergies/${id}`);
  },

  async create(data: PatientAllergyFormData) {
    const api = getApi();
    return api.post<PatientAllergy>('/patient-allergies', data);
  },

  async update(id: string, data: Partial<PatientAllergyFormData>) {
    const api = getApi();
    return api.put<PatientAllergy>(`/patient-allergies/${id}`, data);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/patient-allergies/${id}`);
  },
};
