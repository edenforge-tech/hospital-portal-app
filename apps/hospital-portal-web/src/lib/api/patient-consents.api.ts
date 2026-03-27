import { getApi } from '../api';

export interface PatientConsent {
  id: string;
  patientId: string;
  tenantId?: string;
  consentType: string; // treatment, hipaa, photo, research, telehealth, data_sharing
  consentName: string;
  description?: string;
  isGranted: boolean;
  grantedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  witnessName?: string;
  documentUrl?: string;
  signatureUrl?: string;
  ipAddress?: string;
  notes?: string;
  status: string; // active, expired, revoked
  createdAt: string;
  updatedAt?: string;
}

export interface PatientConsentFormData {
  patientId: string;
  consentType: string;
  consentName: string;
  description?: string;
  isGranted: boolean;
  grantedAt?: string;
  expiresAt?: string;
  witnessName?: string;
  documentUrl?: string;
  signatureUrl?: string;
  notes?: string;
  status?: string;
}

export const patientConsentsApi = {
  async getByPatient(patientId: string) {
    const api = getApi();
    return api.get<PatientConsent[]>(`/patient-consents/patient/${patientId}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<PatientConsent>(`/patient-consents/${id}`);
  },

  async create(data: PatientConsentFormData) {
    const api = getApi();
    return api.post<PatientConsent>('/patient-consents', data);
  },

  async update(id: string, data: Partial<PatientConsentFormData>) {
    const api = getApi();
    return api.put<PatientConsent>(`/patient-consents/${id}`, data);
  },

  async revoke(id: string) {
    const api = getApi();
    return api.post<PatientConsent>(`/patient-consents/${id}/revoke`);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/patient-consents/${id}`);
  },
};
