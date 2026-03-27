import { getApi } from '../api';

export interface OctImagingScan {
  id: string;
  tenantId: string;
  patientId: string;
  patientName?: string;
  patientMRN?: string;
  eye: 'OD' | 'OS' | 'OU';
  scanDate: string;
  scanType: 'Macula' | 'Optic Disc' | 'RNFL' | 'Anterior Segment' | 'Wide Field' | 'Angiography';
  deviceModel?: string;
  deviceManufacturer?: string;
  centralThickness?: number;
  averageThickness?: number;
  minimumThickness?: number;
  rnflThickness?: number;
  signalStrength?: number;
  findings?: string;
  interpretation?: string;
  imagePaths?: string[];
  performedBy?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OctStatistics {
  totalScans: number;
  scansThisMonth: number;
  scanTypeDistribution: {
    [key: string]: number;
  };
  averageCentralThickness: number;
  averageSignalStrength: number;
  scansPerDay: number;
}

export interface OctFilter {
  patientId?: string;
  eye?: 'OD' | 'OS' | 'OU';
  scanType?: string;
  startDate?: string;
  endDate?: string;
}

const octImagingApi = {
  // Get all scans with optional filtering
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    filter?: OctFilter;
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

    const response = await api.get<{ data: OctImagingScan[]; total: number }>(
      `/octimaging?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get scan by ID
  getById: async (id: string) => {
    const api = getApi();
    const response = await api.get<OctImagingScan>(`/octimaging/${id}`);
    return response.data;
  },

  // Get scans for a specific patient
  getByPatient: async (patientId: string) => {
    const api = getApi();
    const response = await api.get<OctImagingScan[]>(`/octimaging/patient/${patientId}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (branchId?: string) => {
    const api = getApi();
    const url = branchId ? `/octimaging/statistics?branchId=${branchId}` : '/octimaging/statistics';
    const response = await api.get<OctStatistics>(url);
    return response.data;
  },

  // Create new scan
  create: async (data: Partial<OctImagingScan>) => {
    const api = getApi();
    const response = await api.post<OctImagingScan>('/octimaging', data);
    return response.data;
  },

  // Update scan
  update: async (id: string, data: Partial<OctImagingScan>) => {
    const api = getApi();
    const response = await api.put<OctImagingScan>(`/octimaging/${id}`, data);
    return response.data;
  },

  // Delete scan (soft delete)
  delete: async (id: string) => {
    const api = getApi();
    await api.delete(`/octimaging/${id}`);
  },

  // Search scans
  search: async (query: string) => {
    const api = getApi();
    const response = await api.get<OctImagingScan[]>(`/octimaging/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export { octImagingApi };
export default octImagingApi;
