import { getApi } from '@/lib/api';

export interface BiometryRecord {
  id: string;
  tenantId: string;
  patientId: string;
  patientName?: string;
  patientCode?: string;
  
  // Eye
  eye: 'OD' | 'OS';
  
  // Primary Measurements
  axialLength: number;
  k1: number; // Flat K
  k2: number; // Steep K
  k1Axis: number;
  acd: number; // Anterior Chamber Depth
  
  // Optional Measurements
  lensThickness?: number;
  whiteToWhite?: number;
  snr?: number; // Signal to Noise Ratio
  
  // Device
  device: string;
  deviceModel?: string;
  
  // Target & Results
  targetRefraction: number;
  calculatedIOL?: number;
  selectedFormula?: string;
  
  // Exam Info
  examinationDate: string;
  examinerId: string;
  examinerName?: string;
  branchId?: string;
  
  // IOL Calculations (stored as JSON)
  iolCalculations?: IOLCalculationResult[];
  
  // Audit
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface IOLCalculationResult {
  formula: string;
  iolPower: number;
  predictedRefraction: number;
  aConstant?: number;
  surgeonFactor?: number;
}

export interface IOLCalculationRequest {
  axialLength: number;
  k1: number;
  k2: number;
  acd: number;
  lensThickness?: number;
  targetRefraction: number;
  aConstant?: number;
}

export interface BiometryStatistics {
  totalRecords: number;
  thisWeek: number;
  odCount: number;
  osCount: number;
  averageAxialLength: number;
  averageIOLPower: number;
}

export interface BiometryFilter {
  patientId?: string;
  branchId?: string;
  eye?: 'OD' | 'OS';
  device?: string;
  dateFrom?: string;
  dateTo?: string;
  examinerId?: string;
}

const biometryApi = {
  // Get all biometry records with optional filtering
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    filter?: BiometryFilter;
  }) => {
    const api = getApi();
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    // Add filter params
    if (params?.filter) {
      if (params.filter.patientId) queryParams.append('patientId', params.filter.patientId);
      if (params.filter.branchId) queryParams.append('branchId', params.filter.branchId);
      if (params.filter.eye) queryParams.append('eye', params.filter.eye);
      if (params.filter.device) queryParams.append('device', params.filter.device);
      if (params.filter.dateFrom) queryParams.append('dateFrom', params.filter.dateFrom);
      if (params.filter.dateTo) queryParams.append('dateTo', params.filter.dateTo);
      if (params.filter.examinerId) queryParams.append('examinerId', params.filter.examinerId);
    }
    
    const response = await api.get<{ data: BiometryRecord[]; total: number }>(
      `/biometry?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get biometry record by ID
  getById: async (id: string) => {
    const api = getApi();
    const response = await api.get<BiometryRecord>(`/biometry/${id}`);
    return response.data;
  },

  // Get biometry records for a specific patient
  getByPatient: async (patientId: string) => {
    const api = getApi();
    const response = await api.get<BiometryRecord[]>(`/biometry/patient/${patientId}`);
    return response.data;
  },

  // Get biometry statistics
  getStatistics: async (branchId?: string) => {
    const api = getApi();
    const url = branchId ? `/biometry/statistics?branchId=${branchId}` : '/biometry/statistics';
    const response = await api.get<BiometryStatistics>(url);
    return response.data;
  },

  // Create new biometry record
  create: async (data: Partial<BiometryRecord>) => {
    const api = getApi();
    const response = await api.post<BiometryRecord>('/biometry', data);
    return response.data;
  },

  // Update biometry record
  update: async (id: string, data: Partial<BiometryRecord>) => {
    const api = getApi();
    const response = await api.put<BiometryRecord>(`/biometry/${id}`, data);
    return response.data;
  },

  // Delete biometry record (soft delete)
  delete: async (id: string) => {
    const api = getApi();
    await api.delete(`/biometry/${id}`);
  },

  // Calculate IOL power using specific formula
  calculateIOL: async (formula: string, data: IOLCalculationRequest) => {
    const api = getApi();
    const response = await api.post<IOLCalculationResult>(
      `/biometry/calculate-iol/${formula}`,
      data
    );
    return response.data;
  },

  // Calculate IOL power using all formulas
  calculateAllFormulas: async (data: IOLCalculationRequest) => {
    const api = getApi();
    const response = await api.post<IOLCalculationResult[]>(
      '/biometry/calculate-iol/all',
      data
    );
    return response.data;
  },

  // Calculate Toric IOL for astigmatism correction
  calculateToricIOL: async (data: IOLCalculationRequest & {
    surgicallyInducedAstigmatism?: number;
    incisionAxis?: number;
  }) => {
    const api = getApi();
    const response = await api.post('/biometry/calculate-toric-iol', data);
    return response.data;
  },

  // Get IOL A-constants library
  getAConstants: async (iolModel?: string) => {
    const api = getApi();
    const url = iolModel ? `/biometry/a-constants?model=${iolModel}` : '/biometry/a-constants';
    const response = await api.get(url);
    return response.data;
  },

  // Export biometry data to PDF
  exportToPdf: async (id: string) => {
    const api = getApi();
    const response = await api.get(`/biometry/${id}/export-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Compare biometry measurements between eyes
  compareEyes: async (patientId: string) => {
    const api = getApi();
    const response = await api.get(`/biometry/compare/${patientId}`);
    return response.data;
  },

  // Search biometry records
  search: async (query: string) => {
    const api = getApi();
    const response = await api.get<BiometryRecord[]>(`/biometry/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default biometryApi;
