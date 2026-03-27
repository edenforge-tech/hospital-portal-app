import { getApi } from '../api';

export interface RetinopathyScreening {
  id: string;
  tenantId: string;
  patientId: string;
  patientName?: string;
  patientMRN?: string;
  eye: 'OD' | 'OS' | 'OU';
  screeningDate: string;
  drGrade: 'None' | 'Mild NPDR' | 'Moderate NPDR' | 'Severe NPDR' | 'PDR';
  meGrade?: 'None' | 'Apparent' | 'CSME';
  hemorrhages: boolean;
  microaneurysms: boolean;
  hardExudates: boolean;
  softExudates: boolean;
  neovascularization: boolean;
  vitrealHemorrhage: boolean;
  findings?: string;
  recommendation?: string;
  imagePaths?: string[];
  performedBy?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RetinopathyStatistics {
  totalScreenings: number;
  screeningsThisMonth: number;
  drGradeDistribution: {
    [key: string]: number;
  };
  meGradeDistribution: {
    [key: string]: number;
  };
  positiveScreeningsPercentage: number;
  averageScreeningsPerDay: number;
}

export interface RetinopathyFilter {
  patientId?: string;
  eye?: 'OD' | 'OS' | 'OU';
  drGrade?: string;
  startDate?: string;
  endDate?: string;
}

const retinopathyApi = {
  // Get all screenings with optional filtering
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    filter?: RetinopathyFilter;
  }) => {
    const api = getApi();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    
    if (params?.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }

    const response = await api.get<{ data: RetinopathyScreening[]; total: number }>(
      `/retinopathyscreening?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get screening by ID
  getById: async (id: string) => {
    const api = getApi();
    const response = await api.get<RetinopathyScreening>(`/retinopathyscreening/${id}`);
    return response.data;
  },

  // Get screenings for a specific patient
  getByPatient: async (patientId: string) => {
    const api = getApi();
    const response = await api.get<RetinopathyScreening[]>(`/retinopathyscreening/patient/${patientId}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (branchId?: string) => {
    const api = getApi();
    const url = branchId ? `/retinopathyscreening/statistics?branchId=${branchId}` : '/retinopathyscreening/statistics';
    const response = await api.get<RetinopathyStatistics>(url);
    return response.data;
  },

  // Create new screening
  create: async (data: Partial<RetinopathyScreening>) => {
    const api = getApi();
    const response = await api.post<RetinopathyScreening>('/retinopathyscreening', data);
    return response.data;
  },

  // Update screening
  update: async (id: string, data: Partial<RetinopathyScreening>) => {
    const api = getApi();
    const response = await api.put<RetinopathyScreening>(`/retinopathyscreening/${id}`, data);
    return response.data;
  },

  // Delete screening (soft delete)
  delete: async (id: string) => {
    const api = getApi();
    await api.delete(`/retinopathyscreening/${id}`);
  },

  // Search screenings
  search: async (query: string) => {
    const api = getApi();
    const response = await api.get<RetinopathyScreening[]>(`/retinopathyscreening/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export const retinopathyScreeningApi = retinopathyApi;
export default retinopathyApi;
