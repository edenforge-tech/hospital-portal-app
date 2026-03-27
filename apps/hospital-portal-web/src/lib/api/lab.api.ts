import { getApi } from '../api';

// ============================================================================
// Types
// ============================================================================

export type LabOrderStatus = 'pending' | 'collected' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
export type LabResultStatus = 'pending' | 'preliminary' | 'final' | 'corrected' | 'cancelled';
export type SpecimenStatus = 'pending_collection' | 'collected' | 'in_transit' | 'received' | 'processing' | 'completed' | 'rejected';
export type ResultFlag = 'normal' | 'abnormal' | 'critical' | 'high' | 'low' | 'critical_high' | 'critical_low';
export type Priority = 'routine' | 'urgent' | 'stat' | 'asap';

export interface LabOrder {
  id: string;
  tenantId: string;
  branchId: string;
  orderNumber: string;
  
  // Patient Info
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientDob: string;
  
  // Ordering Info
  orderingProviderId: string;
  orderingProviderName: string;
  orderDate: string;
  
  // Order Details
  status: LabOrderStatus;
  priority: Priority;
  clinicalNotes?: string;
  diagnosis?: string;
  icdCodes?: string[];
  fastingRequired: boolean;
  
  // Tests
  tests: LabTest[];
  
  // Scheduling
  scheduledDate?: string;
  collectionDate?: string;
  expectedResultDate?: string;
  
  // Results
  resultsAvailable: boolean;
  resultsReviewedBy?: string;
  resultsReviewedAt?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface LabTest {
  id: string;
  testCode: string;
  testName: string;
  category: string;
  status: LabResultStatus;
  specimenType: string;
  specimenId?: string;
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  flag?: ResultFlag;
  interpretation?: string;
  performedBy?: string;
  performedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Specimen {
  id: string;
  specimenNumber: string;
  labOrderId: string;
  patientId: string;
  patientName: string;
  
  // Specimen Details
  specimenType: string;
  sourceLocation: string;
  collectionMethod: string;
  volume?: string;
  containerType: string;
  
  // Collection
  status: SpecimenStatus;
  collectedBy?: string;
  collectedAt?: string;
  collectionNotes?: string;
  
  // Transport
  transportConditions?: string;
  receivedBy?: string;
  receivedAt?: string;
  
  // Quality
  isAcceptable: boolean;
  rejectionReason?: string;
  qualityNotes?: string;
  
  // Storage
  storageLocation?: string;
  storageTemperature?: string;
  expirationDate?: string;
}

export interface LabTestCatalog {
  id: string;
  testCode: string;
  testName: string;
  category: string;
  description?: string;
  specimenType: string;
  specimenVolume?: string;
  containerType: string;
  collectionInstructions?: string;
  fastingRequired: boolean;
  turnaroundTime: string;
  referenceRanges: ReferenceRange[];
  cptCode?: string;
  price?: number;
  isActive: boolean;
}

export interface ReferenceRange {
  id: string;
  gender?: 'male' | 'female' | 'all';
  ageMin?: number;
  ageMax?: number;
  lowValue: number;
  highValue: number;
  criticalLow?: number;
  criticalHigh?: number;
  unit: string;
}

export interface LabPanel {
  id: string;
  panelCode: string;
  panelName: string;
  description?: string;
  category: string;
  tests: LabTestCatalog[];
  price?: number;
  isActive: boolean;
}

export interface LabDashboardMetrics {
  pendingOrders: number;
  inProgressOrders: number;
  completedToday: number;
  criticalResults: number;
  averageTurnaroundTime: number;
  specimensPendingCollection: number;
  ordersByPriority: { priority: Priority; count: number }[];
  ordersByStatus: { status: LabOrderStatus; count: number }[];
  testVolumeByCategory: { category: string; count: number }[];
}

// ============================================================================
// API Functions
// ============================================================================

export const labOrdersApi = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    status?: LabOrderStatus;
    priority?: Priority;
    patientId?: string;
    providerId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<{ data: LabOrder[]; total: number }> => {
    const api = getApi();
    const response = await api.get('/lab/orders', { params });
    return response.data;
  },

  get: async (id: string): Promise<LabOrder> => {
    const api = getApi();
    const response = await api.get(`/lab/orders/${id}`);
    return response.data;
  },

  create: async (data: {
    patientId: string;
    tests: { testCode: string; notes?: string }[];
    priority?: Priority;
    clinicalNotes?: string;
    diagnosis?: string;
    icdCodes?: string[];
    fastingRequired?: boolean;
    scheduledDate?: string;
  }): Promise<LabOrder> => {
    const api = getApi();
    const response = await api.post('/lab/orders', data);
    return response.data;
  },

  update: async (id: string, data: Partial<LabOrder>): Promise<LabOrder> => {
    const api = getApi();
    const response = await api.put(`/lab/orders/${id}`, data);
    return response.data;
  },

  cancel: async (id: string, reason: string): Promise<LabOrder> => {
    const api = getApi();
    const response = await api.post(`/lab/orders/${id}/cancel`, { reason });
    return response.data;
  },

  markCollected: async (id: string, collectionData: {
    collectedBy: string;
    collectedAt: string;
    specimens: { testId: string; specimenNumber: string }[];
  }): Promise<LabOrder> => {
    const api = getApi();
    const response = await api.post(`/lab/orders/${id}/collect`, collectionData);
    return response.data;
  },

  enterResults: async (id: string, results: {
    testId: string;
    resultValue: string;
    resultUnit: string;
    flag?: ResultFlag;
    interpretation?: string;
  }[]): Promise<LabOrder> => {
    const api = getApi();
    const response = await api.post(`/lab/orders/${id}/results`, { results });
    return response.data;
  },

  verifyResults: async (id: string, testIds: string[]): Promise<LabOrder> => {
    const api = getApi();
    const response = await api.post(`/lab/orders/${id}/verify`, { testIds });
    return response.data;
  },

  releaseResults: async (id: string): Promise<LabOrder> => {
    const api = getApi();
    const response = await api.post(`/lab/orders/${id}/release`);
    return response.data;
  },

  printLabel: async (id: string, specimenId: string): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/lab/orders/${id}/specimens/${specimenId}/label`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getMetrics: async (): Promise<LabDashboardMetrics> => {
    const api = getApi();
    const response = await api.get('/lab/metrics');
    return response.data;
  },
};

export const specimensApi = {
  list: async (params?: {
    status?: SpecimenStatus;
    labOrderId?: string;
    patientId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Specimen[]> => {
    const api = getApi();
    const response = await api.get('/lab/specimens', { params });
    return response.data;
  },

  get: async (id: string): Promise<Specimen> => {
    const api = getApi();
    const response = await api.get(`/lab/specimens/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: SpecimenStatus, notes?: string): Promise<Specimen> => {
    const api = getApi();
    const response = await api.put(`/lab/specimens/${id}/status`, { status, notes });
    return response.data;
  },

  receive: async (id: string, data: {
    receivedBy: string;
    receivedAt: string;
    isAcceptable: boolean;
    rejectionReason?: string;
    qualityNotes?: string;
  }): Promise<Specimen> => {
    const api = getApi();
    const response = await api.post(`/lab/specimens/${id}/receive`, data);
    return response.data;
  },

  reject: async (id: string, reason: string): Promise<Specimen> => {
    const api = getApi();
    const response = await api.post(`/lab/specimens/${id}/reject`, { reason });
    return response.data;
  },
};

export const labCatalogApi = {
  listTests: async (params?: {
    category?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<LabTestCatalog[]> => {
    const api = getApi();
    const response = await api.get('/lab/catalog/tests', { params });
    return response.data;
  },

  getTest: async (testCode: string): Promise<LabTestCatalog> => {
    const api = getApi();
    const response = await api.get(`/lab/catalog/tests/${testCode}`);
    return response.data;
  },

  listPanels: async (params?: {
    category?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<LabPanel[]> => {
    const api = getApi();
    const response = await api.get('/lab/catalog/panels', { params });
    return response.data;
  },

  getPanel: async (panelCode: string): Promise<LabPanel> => {
    const api = getApi();
    const response = await api.get(`/lab/catalog/panels/${panelCode}`);
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const api = getApi();
    const response = await api.get('/lab/catalog/categories');
    return response.data;
  },
};

export const criticalResultsApi = {
  list: async (): Promise<{ order: LabOrder; test: LabTest; acknowledgedAt?: string }[]> => {
    const api = getApi();
    const response = await api.get('/lab/critical-results');
    return response.data;
  },

  acknowledge: async (orderId: string, testId: string, notes?: string): Promise<void> => {
    const api = getApi();
    await api.post(`/lab/orders/${orderId}/tests/${testId}/acknowledge`, { notes });
  },

  notifyProvider: async (orderId: string, testId: string, method: 'phone' | 'page' | 'message'): Promise<void> => {
    const api = getApi();
    await api.post(`/lab/orders/${orderId}/tests/${testId}/notify`, { method });
  },
};
