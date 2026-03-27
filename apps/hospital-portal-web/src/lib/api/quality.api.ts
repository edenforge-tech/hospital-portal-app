import { getApi } from '../api';

// ============================================================================
// Types
// ============================================================================

export interface QualityMetric {
  id: string;
  tenantId: string;
  name: string;
  category: QualityCategory;
  description?: string;
  measurementType: 'percentage' | 'count' | 'average' | 'ratio';
  target: number;
  threshold: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  formula?: string;
  dataSource: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  isActive: boolean;
  lastMeasuredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type QualityCategory =
  | 'patient_safety'
  | 'clinical_effectiveness'
  | 'patient_experience'
  | 'operational_efficiency'
  | 'financial_performance'
  | 'regulatory_compliance'
  | 'infection_control'
  | 'medication_safety'
  | 'readmission_rates'
  | 'mortality_rates';

export interface QualityMeasurement {
  id: string;
  metricId: string;
  metricName: string;
  value: number;
  numerator?: number;
  denominator?: number;
  performanceLevel: 'excellent' | 'good' | 'fair' | 'poor';
  period: {
    startDate: string;
    endDate: string;
  };
  branchId?: string;
  branchName?: string;
  departmentId?: string;
  departmentName?: string;
  notes?: string;
  measuredById: string;
  measuredAt: string;
}

export interface ComplianceCheck {
  id: string;
  tenantId: string;
  checkType: 'hipaa' | 'jcaho' | 'cms' | 'osha' | 'internal' | 'other';
  name: string;
  description?: string;
  standard?: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'pending_review' | 'not_applicable';
  lastCheckDate?: string;
  nextCheckDate?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'as_needed';
  findings?: string;
  correctiveActions?: CorrectiveAction[];
  evidence?: ComplianceEvidence[];
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: string;
  notes?: string;
}

export interface ComplianceEvidence {
  id: string;
  documentId: string;
  documentName: string;
  documentType: string;
  documentUrl: string;
  uploadedById: string;
  uploadedAt: string;
}

export interface QualityAudit {
  id: string;
  tenantId: string;
  auditType: 'internal' | 'external' | 'peer_review' | 'regulatory';
  title: string;
  description?: string;
  scope: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  auditorId?: string;
  auditorName?: string;
  findings: AuditFinding[];
  overallScore?: number;
  recommendations?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditFinding {
  id: string;
  category: string;
  severity: 'critical' | 'major' | 'minor' | 'observation';
  description: string;
  standard?: string;
  evidence?: string;
  recommendation?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedToId?: string;
  assignedToName?: string;
  dueDate?: string;
  resolvedDate?: string;
}

export interface Incident {
  id: string;
  tenantId: string;
  incidentNumber: string;
  type: 'patient_safety' | 'medication_error' | 'fall' | 'infection' | 'equipment_failure' | 'other';
  severity: 'near_miss' | 'no_harm' | 'minor' | 'moderate' | 'severe' | 'death';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  patientId?: string;
  patientName?: string;
  location: string;
  incidentDate: string;
  reportedDate: string;
  description: string;
  immediateActions?: string;
  rootCauseAnalysis?: string;
  preventiveMeasures?: string;
  reportedById: string;
  reportedByName: string;
  investigatorId?: string;
  investigatorName?: string;
  witnessIds?: string[];
  isReportable: boolean;
  reportedToAuthority?: string;
  reportDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Quality Metrics API
// ============================================================================

export const qualityMetricsApi = {
  list: async (params?: { category?: string; isActive?: boolean }): Promise<QualityMetric[]> => {
    const api = getApi();
    const response = await api.get('/quality/metrics', { params });
    return response.data;
  },

  get: async (id: string): Promise<QualityMetric> => {
    const api = getApi();
    const response = await api.get(`/quality/metrics/${id}`);
    return response.data;
  },

  create: async (data: Omit<QualityMetric, 'id' | 'tenantId' | 'lastMeasuredAt' | 'createdAt' | 'updatedAt'>): Promise<QualityMetric> => {
    const api = getApi();
    const response = await api.post('/quality/metrics', data);
    return response.data;
  },

  update: async (id: string, data: Partial<QualityMetric>): Promise<QualityMetric> => {
    const api = getApi();
    const response = await api.put(`/quality/metrics/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/quality/metrics/${id}`);
  },

  getMeasurements: async (metricId: string, params?: { dateFrom?: string; dateTo?: string }): Promise<QualityMeasurement[]> => {
    const api = getApi();
    const response = await api.get(`/quality/metrics/${metricId}/measurements`, { params });
    return response.data;
  },

  addMeasurement: async (metricId: string, data: Omit<QualityMeasurement, 'id' | 'metricId' | 'metricName' | 'performanceLevel' | 'measuredById' | 'measuredAt'>): Promise<QualityMeasurement> => {
    const api = getApi();
    const response = await api.post(`/quality/metrics/${metricId}/measurements`, data);
    return response.data;
  },

  getDashboard: async (params?: { dateFrom?: string; dateTo?: string }): Promise<{
    summary: { category: string; metrics: number; avgPerformance: number }[];
    trending: { metricId: string; metricName: string; trend: 'up' | 'down' | 'stable'; changePercent: number }[];
    alerts: { metricId: string; metricName: string; currentValue: number; target: number; status: string }[];
  }> => {
    const api = getApi();
    const response = await api.get('/quality/metrics/dashboard', { params });
    return response.data;
  },
};

// ============================================================================
// Compliance API
// ============================================================================

export const complianceApi = {
  list: async (params?: { checkType?: string; status?: string }): Promise<ComplianceCheck[]> => {
    const api = getApi();
    const response = await api.get('/quality/compliance', { params });
    return response.data;
  },

  get: async (id: string): Promise<ComplianceCheck> => {
    const api = getApi();
    const response = await api.get(`/quality/compliance/${id}`);
    return response.data;
  },

  create: async (data: Omit<ComplianceCheck, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<ComplianceCheck> => {
    const api = getApi();
    const response = await api.post('/quality/compliance', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ComplianceCheck>): Promise<ComplianceCheck> => {
    const api = getApi();
    const response = await api.put(`/quality/compliance/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/quality/compliance/${id}`);
  },

  addCorrectiveAction: async (id: string, action: Omit<CorrectiveAction, 'id'>): Promise<ComplianceCheck> => {
    const api = getApi();
    const response = await api.post(`/quality/compliance/${id}/corrective-actions`, action);
    return response.data;
  },

  updateCorrectiveAction: async (id: string, actionId: string, data: Partial<CorrectiveAction>): Promise<ComplianceCheck> => {
    const api = getApi();
    const response = await api.patch(`/quality/compliance/${id}/corrective-actions/${actionId}`, data);
    return response.data;
  },

  addEvidence: async (id: string, documentId: string): Promise<ComplianceCheck> => {
    const api = getApi();
    const response = await api.post(`/quality/compliance/${id}/evidence`, { documentId });
    return response.data;
  },

  getUpcoming: async (daysAhead: number = 30): Promise<ComplianceCheck[]> => {
    const api = getApi();
    const response = await api.get('/quality/compliance/upcoming', { params: { daysAhead } });
    return response.data;
  },

  getOverdue: async (): Promise<ComplianceCheck[]> => {
    const api = getApi();
    const response = await api.get('/quality/compliance/overdue');
    return response.data;
  },
};

// ============================================================================
// Audits API
// ============================================================================

export const qualityAuditsApi = {
  list: async (params?: { auditType?: string; status?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<QualityAudit>> => {
    const api = getApi();
    const response = await api.get('/quality/audits', { params });
    return response.data;
  },

  get: async (id: string): Promise<QualityAudit> => {
    const api = getApi();
    const response = await api.get(`/quality/audits/${id}`);
    return response.data;
  },

  create: async (data: Omit<QualityAudit, 'id' | 'tenantId' | 'findings' | 'createdAt' | 'updatedAt'>): Promise<QualityAudit> => {
    const api = getApi();
    const response = await api.post('/quality/audits', data);
    return response.data;
  },

  update: async (id: string, data: Partial<QualityAudit>): Promise<QualityAudit> => {
    const api = getApi();
    const response = await api.put(`/quality/audits/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/quality/audits/${id}`);
  },

  addFinding: async (id: string, finding: Omit<AuditFinding, 'id'>): Promise<QualityAudit> => {
    const api = getApi();
    const response = await api.post(`/quality/audits/${id}/findings`, finding);
    return response.data;
  },

  updateFinding: async (id: string, findingId: string, data: Partial<AuditFinding>): Promise<QualityAudit> => {
    const api = getApi();
    const response = await api.patch(`/quality/audits/${id}/findings/${findingId}`, data);
    return response.data;
  },

  complete: async (id: string, data: { overallScore: number; recommendations: string }): Promise<QualityAudit> => {
    const api = getApi();
    const response = await api.post(`/quality/audits/${id}/complete`, data);
    return response.data;
  },
};

// ============================================================================
// Incidents API
// ============================================================================

export const incidentsApi = {
  list: async (params?: { type?: string; severity?: string; status?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<Incident>> => {
    const api = getApi();
    const response = await api.get('/quality/incidents', { params });
    return response.data;
  },

  get: async (id: string): Promise<Incident> => {
    const api = getApi();
    const response = await api.get(`/quality/incidents/${id}`);
    return response.data;
  },

  create: async (data: Omit<Incident, 'id' | 'tenantId' | 'incidentNumber' | 'reportedDate' | 'reportedById' | 'reportedByName' | 'createdAt' | 'updatedAt'>): Promise<Incident> => {
    const api = getApi();
    const response = await api.post('/quality/incidents', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Incident>): Promise<Incident> => {
    const api = getApi();
    const response = await api.put(`/quality/incidents/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/quality/incidents/${id}`);
  },

  investigate: async (id: string, data: { rootCauseAnalysis: string; preventiveMeasures: string }): Promise<Incident> => {
    const api = getApi();
    const response = await api.post(`/quality/incidents/${id}/investigate`, data);
    return response.data;
  },

  resolve: async (id: string, notes: string): Promise<Incident> => {
    const api = getApi();
    const response = await api.post(`/quality/incidents/${id}/resolve`, { notes });
    return response.data;
  },

  close: async (id: string): Promise<Incident> => {
    const api = getApi();
    const response = await api.post(`/quality/incidents/${id}/close`);
    return response.data;
  },

  getStats: async (params?: { dateFrom?: string; dateTo?: string }): Promise<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    trendData: { date: string; count: number }[];
  }> => {
    const api = getApi();
    const response = await api.get('/quality/incidents/stats', { params });
    return response.data;
  },
};
