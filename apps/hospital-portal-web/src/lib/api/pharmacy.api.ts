import { getApi } from '../api';

// ============================================================================
// Types
// ============================================================================

export type PrescriptionStatus = 'pending' | 'verified' | 'filling' | 'ready' | 'dispensed' | 'cancelled' | 'on_hold' | 'transferred';
export type RefillStatus = 'approved' | 'pending' | 'denied' | 'expired';
export type InteractionSeverity = 'mild' | 'moderate' | 'severe' | 'contraindicated';
export type MedicationFrequency = 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'every_4_hours' | 'every_6_hours' | 'every_8_hours' | 'every_12_hours' | 'as_needed' | 'at_bedtime' | 'with_meals' | 'custom';

export interface Prescription {
  id: string;
  tenantId: string;
  branchId: string;
  rxNumber: string;
  
  // Patient Info
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientDob: string;
  patientAllergies: string[];
  
  // Prescriber Info
  prescriberId: string;
  prescriberName: string;
  prescriberNpi?: string;
  prescribedDate: string;
  
  // Medication Info
  medicationId: string;
  medicationName: string;
  medicationNdc?: string;
  genericName?: string;
  brandName?: string;
  strength: string;
  dosageForm: string;
  route: string;
  
  // Dosing
  dose: string;
  frequency: MedicationFrequency;
  frequencyText: string;
  directions: string;
  quantity: number;
  quantityUnit: string;
  daysSupply: number;
  
  // Refills
  refillsAuthorized: number;
  refillsRemaining: number;
  lastFilledDate?: string;
  nextRefillDate?: string;
  
  // Status & Workflow
  status: PrescriptionStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  filledBy?: string;
  filledAt?: string;
  dispensedBy?: string;
  dispensedAt?: string;
  
  // Clinical
  indication?: string;
  diagnosis?: string;
  isCovered: boolean;
  priorAuthRequired: boolean;
  priorAuthStatus?: string;
  
  // Dispensing
  dispensedMedicationId?: string;
  dispensedMedicationName?: string;
  dispensedQuantity?: number;
  lotNumber?: string;
  expirationDate?: string;
  
  // Notes
  pharmacistNotes?: string;
  patientCounselingNotes?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  ndc: string;
  name: string;
  genericName: string;
  brandName?: string;
  manufacturer: string;
  strength: string;
  dosageForm: string;
  route: string;
  deaSchedule?: string;
  isControlled: boolean;
  isFormulary: boolean;
  therapeuticClass: string;
  pharmacologicClass: string;
  warnings?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  storageConditions?: string;
  unitPrice?: number;
  packageSize?: number;
  packageUnit?: string;
  isActive: boolean;
}

export interface DrugInteraction {
  id: string;
  drug1Id: string;
  drug1Name: string;
  drug2Id: string;
  drug2Name: string;
  severity: InteractionSeverity;
  description: string;
  mechanism?: string;
  clinicalEffects: string;
  management: string;
  references?: string[];
}

export interface RefillRequest {
  id: string;
  prescriptionId: string;
  rxNumber: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  requestedDate: string;
  requestedBy: 'patient' | 'pharmacy' | 'provider';
  status: RefillStatus;
  processedBy?: string;
  processedAt?: string;
  denialReason?: string;
  notes?: string;
}

export interface PharmacyInventory {
  id: string;
  medicationId: string;
  medicationName: string;
  ndc: string;
  lotNumber: string;
  expirationDate: string;
  quantityOnHand: number;
  quantityAllocated: number;
  quantityAvailable: number;
  reorderPoint: number;
  reorderQuantity: number;
  lastReceivedDate?: string;
  lastDispensedDate?: string;
  storageLocation: string;
  isExpiringSoon: boolean;
  isLowStock: boolean;
}

export interface PatientMedicationProfile {
  patientId: string;
  patientName: string;
  activeMedications: Prescription[];
  allergies: { allergen: string; reaction: string; severity: string }[];
  interactions: DrugInteraction[];
  adherenceScore?: number;
  lastCounseling?: string;
}

export interface PharmacyDashboardMetrics {
  pendingVerification: number;
  readyForPickup: number;
  refillsDueToday: number;
  controlledSubstanceAlerts: number;
  lowStockItems: number;
  expiringItems: number;
  prescriptionsByStatus: { status: PrescriptionStatus; count: number }[];
  dispensingVolume: { date: string; count: number }[];
  topMedications: { name: string; count: number }[];
}

// ============================================================================
// API Functions
// ============================================================================

export const prescriptionsApi = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    status?: PrescriptionStatus;
    patientId?: string;
    prescriberId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<{ data: Prescription[]; total: number }> => {
    const api = getApi();
    const response = await api.get('/pharmacy/prescriptions', { params });
    return response.data;
  },

  get: async (id: string): Promise<Prescription> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/prescriptions/${id}`);
    return response.data;
  },

  getByRxNumber: async (rxNumber: string): Promise<Prescription> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/prescriptions/rx/${rxNumber}`);
    return response.data;
  },

  create: async (data: {
    patientId: string;
    medicationId: string;
    dose: string;
    frequency: MedicationFrequency;
    directions: string;
    quantity: number;
    daysSupply: number;
    refillsAuthorized: number;
    indication?: string;
    diagnosis?: string;
  }): Promise<Prescription> => {
    const api = getApi();
    const response = await api.post('/pharmacy/prescriptions', data);
    return response.data;
  },

  verify: async (id: string, notes?: string): Promise<Prescription> => {
    const api = getApi();
    const response = await api.post(`/pharmacy/prescriptions/${id}/verify`, { notes });
    return response.data;
  },

  fill: async (id: string, data: {
    dispensedMedicationId: string;
    dispensedQuantity: number;
    lotNumber: string;
    expirationDate: string;
  }): Promise<Prescription> => {
    const api = getApi();
    const response = await api.post(`/pharmacy/prescriptions/${id}/fill`, data);
    return response.data;
  },

  dispense: async (id: string, counselingNotes?: string): Promise<Prescription> => {
    const api = getApi();
    const response = await api.post(`/pharmacy/prescriptions/${id}/dispense`, { counselingNotes });
    return response.data;
  },

  cancel: async (id: string, reason: string): Promise<Prescription> => {
    const api = getApi();
    const response = await api.post(`/pharmacy/prescriptions/${id}/cancel`, { reason });
    return response.data;
  },

  putOnHold: async (id: string, reason: string): Promise<Prescription> => {
    const api = getApi();
    const response = await api.post(`/pharmacy/prescriptions/${id}/hold`, { reason });
    return response.data;
  },

  transfer: async (id: string, targetPharmacy: { name: string; phone: string; fax?: string }): Promise<Prescription> => {
    const api = getApi();
    const response = await api.post(`/pharmacy/prescriptions/${id}/transfer`, { targetPharmacy });
    return response.data;
  },

  printLabel: async (id: string): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/prescriptions/${id}/label`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getMetrics: async (): Promise<PharmacyDashboardMetrics> => {
    const api = getApi();
    const response = await api.get('/pharmacy/metrics');
    return response.data;
  },
};

export const refillsApi = {
  list: async (params?: {
    status?: RefillStatus;
    patientId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<RefillRequest[]> => {
    const api = getApi();
    const response = await api.get('/pharmacy/refills', { params });
    return response.data;
  },

  request: async (prescriptionId: string): Promise<RefillRequest> => {
    const api = getApi();
    const response = await api.post('/pharmacy/refills', { prescriptionId });
    return response.data;
  },

  approve: async (id: string): Promise<RefillRequest> => {
    const api = getApi();
    const response = await api.post(`/pharmacy/refills/${id}/approve`);
    return response.data;
  },

  deny: async (id: string, reason: string): Promise<RefillRequest> => {
    const api = getApi();
    const response = await api.post(`/pharmacy/refills/${id}/deny`, { reason });
    return response.data;
  },

  getDueRefills: async (daysAhead?: number): Promise<Prescription[]> => {
    const api = getApi();
    const response = await api.get('/pharmacy/refills/due', { params: { daysAhead } });
    return response.data;
  },
};

export const medicationsApi = {
  search: async (query: string): Promise<Medication[]> => {
    const api = getApi();
    const response = await api.get('/pharmacy/medications/search', { params: { query } });
    return response.data;
  },

  get: async (id: string): Promise<Medication> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/medications/${id}`);
    return response.data;
  },

  getByNdc: async (ndc: string): Promise<Medication> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/medications/ndc/${ndc}`);
    return response.data;
  },

  getFormulary: async (therapeuticClass?: string): Promise<Medication[]> => {
    const api = getApi();
    const response = await api.get('/pharmacy/medications/formulary', { params: { therapeuticClass } });
    return response.data;
  },

  getTherapeuticClasses: async (): Promise<string[]> => {
    const api = getApi();
    const response = await api.get('/pharmacy/medications/therapeutic-classes');
    return response.data;
  },
};

export const drugInteractionsApi = {
  check: async (medicationIds: string[]): Promise<DrugInteraction[]> => {
    const api = getApi();
    const response = await api.post('/pharmacy/interactions/check', { medicationIds });
    return response.data;
  },

  checkWithPatient: async (patientId: string, newMedicationId: string): Promise<DrugInteraction[]> => {
    const api = getApi();
    const response = await api.post('/pharmacy/interactions/check-patient', { patientId, newMedicationId });
    return response.data;
  },

  getForMedication: async (medicationId: string): Promise<DrugInteraction[]> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/interactions/medication/${medicationId}`);
    return response.data;
  },
};

export const patientProfileApi = {
  get: async (patientId: string): Promise<PatientMedicationProfile> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/patients/${patientId}/profile`);
    return response.data;
  },

  getAllergies: async (patientId: string): Promise<{ allergen: string; reaction: string; severity: string }[]> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/patients/${patientId}/allergies`);
    return response.data;
  },

  getMedicationHistory: async (patientId: string): Promise<Prescription[]> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/patients/${patientId}/medication-history`);
    return response.data;
  },

  recordCounseling: async (patientId: string, prescriptionId: string, notes: string): Promise<void> => {
    const api = getApi();
    await api.post(`/pharmacy/patients/${patientId}/counseling`, { prescriptionId, notes });
  },
};

export const pharmacyInventoryApi = {
  list: async (params?: {
    lowStock?: boolean;
    expiringSoon?: boolean;
    search?: string;
  }): Promise<PharmacyInventory[]> => {
    const api = getApi();
    const response = await api.get('/pharmacy/inventory', { params });
    return response.data;
  },

  get: async (id: string): Promise<PharmacyInventory> => {
    const api = getApi();
    const response = await api.get(`/pharmacy/inventory/${id}`);
    return response.data;
  },

  adjustQuantity: async (id: string, adjustment: number, reason: string): Promise<PharmacyInventory> => {
    const api = getApi();
    const response = await api.post(`/pharmacy/inventory/${id}/adjust`, { adjustment, reason });
    return response.data;
  },

  receive: async (data: {
    medicationId: string;
    lotNumber: string;
    expirationDate: string;
    quantity: number;
    storageLocation: string;
  }): Promise<PharmacyInventory> => {
    const api = getApi();
    const response = await api.post('/pharmacy/inventory/receive', data);
    return response.data;
  },

  getLowStock: async (): Promise<PharmacyInventory[]> => {
    const api = getApi();
    const response = await api.get('/pharmacy/inventory/low-stock');
    return response.data;
  },

  getExpiring: async (daysAhead?: number): Promise<PharmacyInventory[]> => {
    const api = getApi();
    const response = await api.get('/pharmacy/inventory/expiring', { params: { daysAhead } });
    return response.data;
  },
};
