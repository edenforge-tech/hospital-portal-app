import { getApi } from '../api';

// Types - Aligned with backend ExaminationDto
export interface Examination {
  id: string;
  patientId: string;
  patientName?: string;
  examinationType: string;
  examinationDate: string;
  findings?: string;
  diagnosis?: string;
  prescriptions?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  examinedById: string;
  examinedByName?: string;
  status: string;
  notes?: string;
  attachments?: string[];
  followUpRequired?: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ExaminationFormData {
  patientId: string;
  examinationType: string;
  examinationDate: string;
  findings?: string;
  diagnosis?: string;
  prescriptions?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  examinedById: string;
  status?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

// Finalization types
export interface FinalizeExaminationRequest {
  pin: string; // 4-6 digit PIN for digital signature
  followUpDate?: string;
  followUpReason?: string;
}

export interface FinalizeExaminationResponse {
  success: boolean;
  message: string;
  digitalSignature: string;
  signedAt: string;
  followUpAppointmentId?: string;
}

/**
 * API client for examination operations
 */
export const examinationApi = {
  /**
   * Get all examinations with optional filtering
   */
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    patientId?: string;
    examinationType?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const api = getApi();
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.patientId) queryParams.append('patientId', params.patientId);
    if (params?.examinationType) queryParams.append('examinationType', params.examinationType);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    
    const query = queryParams.toString();
    return api.get<Examination[]>(`/Examinations${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single examination by ID
   */
  async getById(id: string) {
    const api = getApi();
    return api.get<Examination>(`/Examinations/${id}`);
  },

  /**
   * Get examinations for a specific patient
   */
  async getByPatient(patientId: string) {
    const api = getApi();
    return api.get<Examination[]>(`/Examinations/patient/${patientId}`);
  },

  /**
   * Create a new examination
   */
  async create(data: ExaminationFormData) {
    const api = getApi();
    return api.post<Examination>('/Examinations', data);
  },

  /**
   * Update an existing examination
   */
  async update(id: string, data: Partial<ExaminationFormData>) {
    const api = getApi();
    return api.put<Examination>(`/Examinations/${id}`, data);
  },

  /**
   * Delete an examination (soft delete)
   */
  async delete(id: string) {
    const api = getApi();
    return api.delete(`/Examinations/${id}`);
  },

  /**
   * Finalize examination with digital signature (PIN-based)
   */
  async finalize(id: string, request: FinalizeExaminationRequest) {
    const api = getApi();
    return api.post<FinalizeExaminationResponse>(`/Examinations/${id}/finalize`, request);
  }
};
