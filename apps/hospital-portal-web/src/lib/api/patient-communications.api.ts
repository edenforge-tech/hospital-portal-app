import { getApi } from '../api';

export interface PatientCommunication {
  id: string;
  patientId: string;
  tenantId?: string;
  communicationType: string; // sms, email, phone, in_person, portal_message
  direction: string; // inbound, outbound
  subject?: string;
  message: string;
  recipient?: string;
  sender?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  sentByUserId?: string;
  priority: string;
  category?: string;
  notes?: string;
  status: string; // draft, sent, delivered, read, failed, bounced
  createdAt: string;
  updatedAt?: string;
}

export interface PatientCommunicationFormData {
  patientId: string;
  communicationType: string;
  direction: string;
  subject?: string;
  message: string;
  recipient?: string;
  sender?: string;
  priority?: string;
  category?: string;
  notes?: string;
  status?: string;
}

export const patientCommunicationsApi = {
  async getByPatient(patientId: string, type?: string) {
    const api = getApi();
    const query = type ? `?type=${type}` : '';
    return api.get<PatientCommunication[]>(`/patient-communications/patient/${patientId}${query}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<PatientCommunication>(`/patient-communications/${id}`);
  },

  async create(data: PatientCommunicationFormData) {
    const api = getApi();
    return api.post<PatientCommunication>('/patient-communications', data);
  },

  async update(id: string, data: Partial<PatientCommunicationFormData>) {
    const api = getApi();
    return api.put<PatientCommunication>(`/patient-communications/${id}`, data);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/patient-communications/${id}`);
  },
};
