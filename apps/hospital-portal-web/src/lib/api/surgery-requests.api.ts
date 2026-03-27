import { getApi } from '../api';

export interface SurgeryRequest {
  id: string;
  tenantId?: string;
  branchId: string;
  surgeonId: string;
  patientName: string;
  patientMobile: string;
  procedureType: string;
  requestType: string; // quick-note, direct-support
  urgency: string; // routine, urgent, emergency
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  specialInstructions?: string;
  status: string; // pending, approved, rejected, completed, cancelled
  surgeonResponse?: string;
  scheduledDate?: string;
  requestDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SurgeryRequestFormData {
  branchId: string;
  surgeonId: string;
  patientName: string;
  patientMobile: string;
  procedureType: string;
  requestType?: string;
  urgency?: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  specialInstructions?: string;
}

export const surgeryRequestsApi = {
  async getAll(params?: { status?: string; urgency?: string; surgeonId?: string }) {
    const api = getApi();
    const queryParts: string[] = [];
    if (params?.status) queryParts.push(`status=${params.status}`);
    if (params?.urgency) queryParts.push(`urgency=${params.urgency}`);
    if (params?.surgeonId) queryParts.push(`surgeonId=${params.surgeonId}`);
    const query = queryParts.length ? `?${queryParts.join('&')}` : '';
    return api.get<SurgeryRequest[]>(`/surgery-requests${query}`);
  },

  async getByPatientName(patientName: string) {
    const api = getApi();
    return api.get<SurgeryRequest[]>(`/surgery-requests/patient/${encodeURIComponent(patientName)}`);
  },

  async getByBranch(branchId: string, status?: string) {
    const api = getApi();
    const query = status ? `?status=${status}` : '';
    return api.get<SurgeryRequest[]>(`/surgery-requests/branch/${branchId}${query}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<SurgeryRequest>(`/surgery-requests/${id}`);
  },

  async create(data: SurgeryRequestFormData) {
    const api = getApi();
    return api.post<SurgeryRequest>('/surgery-requests', data);
  },

  async update(id: string, data: Partial<SurgeryRequestFormData>) {
    const api = getApi();
    return api.put<SurgeryRequest>(`/surgery-requests/${id}`, data);
  },

  async approve(id: string, data: { scheduledDate?: string; response?: string }) {
    const api = getApi();
    return api.post<SurgeryRequest>(`/surgery-requests/${id}/approve`, data);
  },

  async reject(id: string, reason?: string) {
    const api = getApi();
    return api.post<SurgeryRequest>(`/surgery-requests/${id}/reject`, { reason });
  },

  async complete(id: string) {
    const api = getApi();
    return api.post<SurgeryRequest>(`/surgery-requests/${id}/complete`);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/surgery-requests/${id}`);
  },
};
