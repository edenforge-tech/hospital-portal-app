import { getApi } from '../api';

export interface ElectrophysiologyTest {
  id: string;
  tenantId: string;
  patientId: string;
  patientName?: string;
  patientMRN?: string;
  testDate: string;
  testType: 'ERG' | 'VEP' | 'EOG';
  eyeTested: 'OD' | 'OS' | 'OU';
  eye?: string; // Computed property for display
  protocol?: string;
  stimulusType?: string;
  waveformData?: string;
  aWaveAmplitude?: number;
  aWaveLatency?: number;
  bWaveAmplitude?: number;
  bWaveLatency?: number;
  flickerAmplitude?: number;
  ardenRatio?: number;
  findings?: string;
  interpretation?: string;
  imagePaths?: string[];
  performedBy?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ElectrophysiologyStatistics {
  totalTests: number;
  testsThisMonth: number;
  testTypeDistribution: {
    [key: string]: number;
  };
  averageAWaveAmplitude: number;
  averageBWaveAmplitude: number;
  testsPerDay: number;
}

export interface ElectrophysiologyFilter {
  patientId?: string;
  testType?: 'ERG' | 'VEP' | 'EOG';
  eyeTested?: 'OD' | 'OS' | 'OU';
  startDate?: string;
  endDate?: string;
}

const electrophysiologyApi = {
  // Get all tests with optional filtering
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    filter?: ElectrophysiologyFilter;
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

    const response = await api.get<{ data: ElectrophysiologyTest[]; total: number }>(
      `/electrophysiology?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get test by ID
  getById: async (id: string) => {
    const api = getApi();
    const response = await api.get<ElectrophysiologyTest>(`/electrophysiology/${id}`);
    return response.data;
  },

  // Get tests for a specific patient
  getByPatient: async (patientId: string) => {
    const api = getApi();
    const response = await api.get<ElectrophysiologyTest[]>(`/electrophysiology/patient/${patientId}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (branchId?: string) => {
    const api = getApi();
    const url = branchId ? `/electrophysiology/statistics?branchId=${branchId}` : '/electrophysiology/statistics';
    const response = await api.get<ElectrophysiologyStatistics>(url);
    return response.data;
  },

  // Create new test
  create: async (data: Partial<ElectrophysiologyTest>) => {
    const api = getApi();
    const response = await api.post<ElectrophysiologyTest>('/electrophysiology', data);
    return response.data;
  },

  // Update test
  update: async (id: string, data: Partial<ElectrophysiologyTest>) => {
    const api = getApi();
    const response = await api.put<ElectrophysiologyTest>(`/electrophysiology/${id}`, data);
    return response.data;
  },

  // Delete test (soft delete)
  delete: async (id: string) => {
    const api = getApi();
    await api.delete(`/electrophysiology/${id}`);
  },

  // Search tests
  search: async (query: string) => {
    const api = getApi();
    const response = await api.get<ElectrophysiologyTest[]>(`/electrophysiology/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default electrophysiologyApi;
