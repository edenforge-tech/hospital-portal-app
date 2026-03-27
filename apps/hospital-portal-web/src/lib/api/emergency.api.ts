import { getApi } from '../api';

// ============================================================================
// Types
// ============================================================================

export interface EmergencyCase {
  id: string;
  tenantId: string;
  caseNumber: string;
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  arrivalMethod: 'ambulance' | 'walk_in' | 'police' | 'helicopter' | 'other';
  chiefComplaint: string;
  triageLevel: 1 | 2 | 3 | 4 | 5;
  triageColor: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  triageScore: number;
  vitalSigns: VitalSigns;
  status: 'pending_triage' | 'triaged' | 'in_treatment' | 'awaiting_results' | 'admitted' | 'discharged' | 'transferred' | 'deceased';
  arrivalTime: string;
  triageTime?: string;
  treatmentStartTime?: string;
  dischargeTime?: string;
  assignedBedId?: string;
  assignedBedNumber?: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedNurseId?: string;
  assignedNurseName?: string;
  allergies?: string[];
  medications?: string[];
  alerts?: Alert[];
  isolation?: {
    required: boolean;
    type?: string;
    reason?: string;
  };
  trauma?: {
    isTrauma: boolean;
    mechanism?: string;
    teamActivated?: boolean;
    activationTime?: string;
  };
  disposition?: 'discharge' | 'admit' | 'transfer' | 'ama' | 'deceased';
  dischargeInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  painScale?: number;
  consciousnessLevel?: 'alert' | 'verbal' | 'pain' | 'unresponsive';
  glucoseLevel?: number;
  recordedAt: string;
}

export interface Alert {
  type: 'allergy' | 'fall_risk' | 'isolation' | 'dnr' | 'critical_value' | 'security' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  icon?: string;
  color?: string;
}

export interface TriageProtocol {
  id: string;
  tenantId: string;
  name: string;
  version: string;
  system: 'esi' | 'ctas' | 'ats' | 'mts' | 'custom';
  description?: string;
  levels: TriageLevel[];
  isActive: boolean;
  lastRevisedAt?: string;
  createdAt: string;
}

export interface TriageLevel {
  level: number;
  name: string;
  color: string;
  description: string;
  criteria: string[];
  examples: string[];
  maxWaitTime: number;
  reassessmentInterval: number;
}

export interface EDTrackBoard {
  totalPatients: number;
  byStatus: Record<string, number>;
  byTriageLevel: Record<number, number>;
  averageWaitTime: number;
  longestWaitTime: number;
  bedOccupancy: {
    total: number;
    occupied: number;
    available: number;
    utilization: number;
  };
  staffing: {
    physicians: { onDuty: number; patients: number };
    nurses: { onDuty: number; patients: number };
  };
}

export interface CodeBlue {
  id: string;
  tenantId: string;
  codeType: 'blue' | 'red' | 'purple' | 'silver' | 'yellow' | 'gray';
  location: string;
  patientId?: string;
  patientAge?: number;
  patientGender?: string;
  status: 'active' | 'responded' | 'resolved' | 'cancelled';
  activatedTime: string;
  arrivedTime?: string;
  resolvedTime?: string;
  teamMembers?: { userId: string; userName: string; role: string; arrivedAt?: string }[];
  outcome?: 'successful' | 'unsuccessful' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface EmergencyProtocol {
  id: string;
  tenantId: string;
  name: string;
  type: 'cardiac_arrest' | 'stroke' | 'trauma' | 'sepsis' | 'mass_casualty' | 'other';
  description?: string;
  steps: ProtocolStep[];
  criteria: string[];
  requiredResources: string[];
  timeTargets: { step: string; maxMinutes: number }[];
  isActive: boolean;
  lastRevisedAt?: string;
  createdAt: string;
}

export interface ProtocolStep {
  order: number;
  action: string;
  responsibility: string;
  timeTarget?: number;
  critical: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Emergency Cases API
// ============================================================================

export const emergencyCasesApi = {
  list: async (params?: { status?: string; triageLevel?: number; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<EmergencyCase>> => {
    const api = getApi();
    const response = await api.get('/emergency/cases', { params });
    return response.data;
  },

  get: async (id: string): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.get(`/emergency/cases/${id}`);
    return response.data;
  },

  create: async (data: { patientName?: string; patientAge?: number; patientGender?: string; arrivalMethod: EmergencyCase['arrivalMethod']; chiefComplaint: string }): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.post('/emergency/cases', data);
    return response.data;
  },

  update: async (id: string, data: Partial<EmergencyCase>): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.put(`/emergency/cases/${id}`, data);
    return response.data;
  },

  triage: async (id: string, data: { triageLevel: number; triageScore: number; vitalSigns: VitalSigns; notes?: string }): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.post(`/emergency/cases/${id}/triage`, data);
    return response.data;
  },

  assignProvider: async (id: string, providerId: string): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.post(`/emergency/cases/${id}/assign-provider`, { providerId });
    return response.data;
  },

  assignBed: async (id: string, bedId: string): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.post(`/emergency/cases/${id}/assign-bed`, { bedId });
    return response.data;
  },

  updateVitals: async (id: string, vitalSigns: VitalSigns): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.post(`/emergency/cases/${id}/vitals`, vitalSigns);
    return response.data;
  },

  updateStatus: async (id: string, status: EmergencyCase['status']): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.post(`/emergency/cases/${id}/status`, { status });
    return response.data;
  },

  discharge: async (id: string, data: { disposition: EmergencyCase['disposition']; instructions?: string }): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.post(`/emergency/cases/${id}/discharge`, data);
    return response.data;
  },

  admit: async (id: string, data: { departmentId: string; notes?: string }): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.post(`/emergency/cases/${id}/admit`, data);
    return response.data;
  },

  transfer: async (id: string, data: { facilityId: string; reason: string }): Promise<EmergencyCase> => {
    const api = getApi();
    const response = await api.post(`/emergency/cases/${id}/transfer`, data);
    return response.data;
  },

  getActive: async (): Promise<EmergencyCase[]> => {
    const api = getApi();
    const response = await api.get('/emergency/cases/active');
    return response.data;
  },

  getWaitingForBed: async (): Promise<EmergencyCase[]> => {
    const api = getApi();
    const response = await api.get('/emergency/cases/waiting-for-bed');
    return response.data;
  },
};

// ============================================================================
// Track Board API
// ============================================================================

export const trackBoardApi = {
  get: async (): Promise<EDTrackBoard> => {
    const api = getApi();
    const response = await api.get('/emergency/track-board');
    return response.data;
  },

  getCases: async (): Promise<EmergencyCase[]> => {
    const api = getApi();
    const response = await api.get('/emergency/track-board/cases');
    return response.data;
  },

  getMetrics: async (timeRange: '1h' | '4h' | '12h' | '24h'): Promise<{
    arrivals: number;
    admissions: number;
    discharges: number;
    avgLengthOfStay: number;
    avgWaitToProvider: number;
    leftWithoutBeingSeen: number;
  }> => {
    const api = getApi();
    const response = await api.get('/emergency/track-board/metrics', { params: { timeRange } });
    return response.data;
  },
};

// ============================================================================
// Code Blue / Emergency Response API
// ============================================================================

export const codeBlueApi = {
  list: async (params?: { status?: string; codeType?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<CodeBlue>> => {
    const api = getApi();
    const response = await api.get('/emergency/code-blue', { params });
    return response.data;
  },

  get: async (id: string): Promise<CodeBlue> => {
    const api = getApi();
    const response = await api.get(`/emergency/code-blue/${id}`);
    return response.data;
  },

  activate: async (data: { codeType: CodeBlue['codeType']; location: string; patientId?: string }): Promise<CodeBlue> => {
    const api = getApi();
    const response = await api.post('/emergency/code-blue/activate', data);
    return response.data;
  },

  respond: async (id: string): Promise<CodeBlue> => {
    const api = getApi();
    const response = await api.post(`/emergency/code-blue/${id}/respond`);
    return response.data;
  },

  resolve: async (id: string, data: { outcome: CodeBlue['outcome']; notes?: string }): Promise<CodeBlue> => {
    const api = getApi();
    const response = await api.post(`/emergency/code-blue/${id}/resolve`, data);
    return response.data;
  },

  cancel: async (id: string, reason: string): Promise<CodeBlue> => {
    const api = getApi();
    const response = await api.post(`/emergency/code-blue/${id}/cancel`, { reason });
    return response.data;
  },

  getActive: async (): Promise<CodeBlue[]> => {
    const api = getApi();
    const response = await api.get('/emergency/code-blue/active');
    return response.data;
  },
};

// ============================================================================
// Triage Protocols API
// ============================================================================

export const triageProtocolsApi = {
  list: async (): Promise<TriageProtocol[]> => {
    const api = getApi();
    const response = await api.get('/emergency/triage-protocols');
    return response.data;
  },

  get: async (id: string): Promise<TriageProtocol> => {
    const api = getApi();
    const response = await api.get(`/emergency/triage-protocols/${id}`);
    return response.data;
  },

  create: async (data: Omit<TriageProtocol, 'id' | 'tenantId' | 'createdAt'>): Promise<TriageProtocol> => {
    const api = getApi();
    const response = await api.post('/emergency/triage-protocols', data);
    return response.data;
  },

  update: async (id: string, data: Partial<TriageProtocol>): Promise<TriageProtocol> => {
    const api = getApi();
    const response = await api.put(`/emergency/triage-protocols/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/emergency/triage-protocols/${id}`);
  },

  getActive: async (): Promise<TriageProtocol> => {
    const api = getApi();
    const response = await api.get('/emergency/triage-protocols/active');
    return response.data;
  },

  calculateTriageScore: async (data: { symptoms: string[]; vitalSigns: VitalSigns; chiefComplaint: string }): Promise<{ level: number; score: number; color: string; recommendations: string[] }> => {
    const api = getApi();
    const response = await api.post('/emergency/triage-protocols/calculate-score', data);
    return response.data;
  },
};

// ============================================================================
// Emergency Protocols API
// ============================================================================

export const emergencyProtocolsApi = {
  list: async (params?: { type?: string; isActive?: boolean }): Promise<EmergencyProtocol[]> => {
    const api = getApi();
    const response = await api.get('/emergency/protocols', { params });
    return response.data;
  },

  get: async (id: string): Promise<EmergencyProtocol> => {
    const api = getApi();
    const response = await api.get(`/emergency/protocols/${id}`);
    return response.data;
  },

  create: async (data: Omit<EmergencyProtocol, 'id' | 'tenantId' | 'createdAt'>): Promise<EmergencyProtocol> => {
    const api = getApi();
    const response = await api.post('/emergency/protocols', data);
    return response.data;
  },

  update: async (id: string, data: Partial<EmergencyProtocol>): Promise<EmergencyProtocol> => {
    const api = getApi();
    const response = await api.put(`/emergency/protocols/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/emergency/protocols/${id}`);
  },

  getByType: async (type: EmergencyProtocol['type']): Promise<EmergencyProtocol[]> => {
    const api = getApi();
    const response = await api.get(`/emergency/protocols/type/${type}`);
    return response.data;
  },
};
