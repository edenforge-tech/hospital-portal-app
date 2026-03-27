import { getApi } from '../api';

export interface PatientNote {
  id: string;
  patientId: string;
  visitId?: string;
  tenantId?: string;
  noteType: string; // general, clinical, progress, discharge, nursing, consult, procedure, follow_up
  title: string;
  content: string;
  isFlagged: boolean;
  flagReason?: string;
  priority: string;
  authorId?: string;
  authorName?: string;
  isConfidential: boolean;
  status: string; // active, archived, draft
  createdAt: string;
  updatedAt?: string;
}

export interface PatientNoteFormData {
  patientId: string;
  visitId?: string;
  noteType: string;
  title: string;
  content: string;
  isFlagged?: boolean;
  flagReason?: string;
  priority?: string;
  authorName?: string;
  isConfidential?: boolean;
  status?: string;
}

export const patientNotesApi = {
  async getByPatient(patientId: string, params?: { noteType?: string; flaggedOnly?: boolean }) {
    const api = getApi();
    const queryParts: string[] = [];
    if (params?.noteType) queryParts.push(`noteType=${params.noteType}`);
    if (params?.flaggedOnly) queryParts.push('flaggedOnly=true');
    const query = queryParts.length ? `?${queryParts.join('&')}` : '';
    return api.get<PatientNote[]>(`/patient-notes/patient/${patientId}${query}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<PatientNote>(`/patient-notes/${id}`);
  },

  async create(data: PatientNoteFormData) {
    const api = getApi();
    return api.post<PatientNote>('/patient-notes', data);
  },

  async update(id: string, data: Partial<PatientNoteFormData>) {
    const api = getApi();
    return api.put<PatientNote>(`/patient-notes/${id}`, data);
  },

  async toggleFlag(id: string, reason?: string) {
    const api = getApi();
    return api.post<PatientNote>(`/patient-notes/${id}/flag`, reason ? { reason } : {});
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/patient-notes/${id}`);
  },
};
