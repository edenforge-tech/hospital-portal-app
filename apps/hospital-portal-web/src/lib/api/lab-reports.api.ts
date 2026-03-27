import { getApi } from '../api';

export interface LabReport {
  id: string;
  patientId: string;
  visitId?: string;
  tenantId?: string;
  testName: string;
  testCode?: string;
  testCategory: string; // hematology, biochemistry, microbiology, pathology, ophthalmology
  orderedByName?: string;
  orderedById?: string;
  orderedAt?: string;
  sampleCollectedAt?: string;
  completedAt?: string;
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  interpretation?: string; // normal, abnormal, critical, high, low
  labName?: string;
  technicianName?: string;
  verifiedByName?: string;
  specimenType?: string;
  priority: string;
  notes?: string;
  reportUrl?: string;
  status: string; // ordered, sample_collected, in_progress, completed, cancelled, on_hold
  createdAt: string;
  updatedAt?: string;
}

export interface LabReportFormData {
  patientId: string;
  visitId?: string;
  testName: string;
  testCode?: string;
  testCategory: string;
  orderedByName?: string;
  orderedById?: string;
  orderedAt?: string;
  specimenType?: string;
  priority?: string;
  notes?: string;
  status?: string;
}

export interface LabReportResultData {
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  interpretation?: string;
}

export const labReportsApi = {
  async getByPatient(patientId: string, params?: { status?: string; category?: string }) {
    const api = getApi();
    const queryParts: string[] = [];
    if (params?.status) queryParts.push(`status=${params.status}`);
    if (params?.category) queryParts.push(`category=${params.category}`);
    const query = queryParts.length ? `?${queryParts.join('&')}` : '';
    return api.get<LabReport[]>(`/lab-reports/patient/${patientId}${query}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<LabReport>(`/lab-reports/${id}`);
  },

  async create(data: LabReportFormData) {
    const api = getApi();
    return api.post<LabReport>('/lab-reports', data);
  },

  async update(id: string, data: Partial<LabReportFormData>) {
    const api = getApi();
    return api.put<LabReport>(`/lab-reports/${id}`, data);
  },

  async complete(id: string, result: LabReportResultData) {
    const api = getApi();
    return api.post<LabReport>(`/lab-reports/${id}/complete`, result);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/lab-reports/${id}`);
  },
};
