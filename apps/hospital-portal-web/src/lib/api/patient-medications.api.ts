import { getApi } from '../api';

export interface PatientMedication {
  id: string;
  patientId: string;
  tenantId?: string;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  route?: string; // oral, topical, injection, etc.
  startDate?: string;
  endDate?: string;
  prescribedBy?: string;
  status: string; // active, completed, discontinued
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PatientMedicationFormData {
  patientId: string;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  startDate?: string;
  endDate?: string;
  prescribedBy?: string;
  status?: string;
  notes?: string;
}

export const patientMedicationsApi = {
  async getByPatient(patientId: string) {
    const api = getApi();
    return api.get<PatientMedication[]>(`/patient-medications/patient/${patientId}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<PatientMedication>(`/patient-medications/${id}`);
  },

  async create(data: PatientMedicationFormData) {
    const api = getApi();
    return api.post<PatientMedication>('/patient-medications', data);
  },

  async update(id: string, data: Partial<PatientMedicationFormData>) {
    const api = getApi();
    return api.put<PatientMedication>(`/patient-medications/${id}`, data);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/patient-medications/${id}`);
  },
};
