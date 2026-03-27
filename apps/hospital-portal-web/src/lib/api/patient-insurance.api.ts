import { getApi } from '../api';

export interface PatientInsurance {
  id: string;
  patientId: string;
  tenantId?: string;
  providerName: string;
  policyNumber: string;
  groupNumber?: string;
  policyType: string; // primary, secondary, tertiary
  planName?: string;
  subscriberName?: string;
  subscriberId?: string;
  subscriberRelation?: string;
  startDate?: string;
  endDate?: string;
  copayAmount?: number;
  deductibleAmount?: number;
  deductibleMet?: number;
  outOfPocketMax?: number;
  outOfPocketMet?: number;
  coverageDetails?: string;
  preAuthRequired: boolean;
  preAuthNumber?: string;
  contactPhone?: string;
  notes?: string;
  status: string; // active, inactive, expired, pending_verification
  createdAt: string;
  updatedAt?: string;
}

export interface PatientInsuranceFormData {
  patientId: string;
  providerName: string;
  policyNumber: string;
  groupNumber?: string;
  policyType: string;
  planName?: string;
  subscriberName?: string;
  subscriberId?: string;
  subscriberRelation?: string;
  startDate?: string;
  endDate?: string;
  copayAmount?: number;
  deductibleAmount?: number;
  coverageDetails?: string;
  preAuthRequired?: boolean;
  preAuthNumber?: string;
  contactPhone?: string;
  notes?: string;
  status?: string;
}

export const patientInsuranceApi = {
  async getByPatient(patientId: string, policyType?: string) {
    const api = getApi();
    const query = policyType ? `?policyType=${policyType}` : '';
    return api.get<PatientInsurance[]>(`/patient-insurance/patient/${patientId}${query}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<PatientInsurance>(`/patient-insurance/${id}`);
  },

  async create(data: PatientInsuranceFormData) {
    const api = getApi();
    return api.post<PatientInsurance>('/patient-insurance', data);
  },

  async update(id: string, data: Partial<PatientInsuranceFormData>) {
    const api = getApi();
    return api.put<PatientInsurance>(`/patient-insurance/${id}`, data);
  },

  async verify(id: string) {
    const api = getApi();
    return api.post<PatientInsurance>(`/patient-insurance/${id}/verify`);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/patient-insurance/${id}`);
  },
};
