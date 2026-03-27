/**
 * Medical Records API Service
 * Clinical notes, test results, medical history, diagnoses
 */

import { getApi } from '../api';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MedicalRecord {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  recordType: MedicalRecordType;
  title: string;
  content: string;
  summary?: string;
  status: RecordStatus;
  confidentialityLevel: ConfidentialityLevel;
  encounterId?: string;
  encounterDate?: string;
  providerId: string;
  providerName: string;
  providerRole: string;
  departmentId?: string;
  departmentName?: string;
  diagnoses?: Diagnosis[];
  procedures?: Procedure[];
  medications?: Medication[];
  allergies?: Allergy[];
  vitalSigns?: VitalSigns;
  attachments?: RecordAttachment[];
  signatures?: RecordSignature[];
  amendments?: RecordAmendment[];
  accessLog?: AccessLogEntry[];
  isSigned: boolean;
  signedAt?: string;
  signedById?: string;
  isLocked: boolean;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicalRecordType =
  | 'progress_note'
  | 'admission_note'
  | 'discharge_summary'
  | 'consultation_note'
  | 'procedure_note'
  | 'operative_report'
  | 'history_physical'
  | 'emergency_note'
  | 'nursing_note'
  | 'therapy_note'
  | 'lab_result'
  | 'imaging_result'
  | 'pathology_report'
  | 'referral'
  | 'prescription'
  | 'immunization'
  | 'allergy_record'
  | 'problem_list'
  | 'care_plan';

export type RecordStatus = 'draft' | 'pending_review' | 'active' | 'amended' | 'archived' | 'voided';
export type ConfidentialityLevel = 'normal' | 'restricted' | 'highly_restricted';

export interface Diagnosis {
  id: string;
  code: string;
  codeSystem: 'ICD-10' | 'ICD-11' | 'SNOMED-CT';
  description: string;
  type: 'primary' | 'secondary' | 'admitting' | 'discharge' | 'differential';
  status: 'active' | 'resolved' | 'chronic' | 'ruled_out';
  onsetDate?: string;
  resolvedDate?: string;
  notes?: string;
}

export interface Procedure {
  id: string;
  code: string;
  codeSystem: 'CPT' | 'ICD-10-PCS' | 'SNOMED-CT';
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  performedDate?: string;
  performedById?: string;
  performedByName?: string;
  location?: string;
  notes?: string;
  complications?: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  code?: string;
  codeSystem?: 'NDC' | 'RxNorm' | 'SNOMED-CT';
  dosage: string;
  unit: string;
  frequency: string;
  route: 'oral' | 'intravenous' | 'intramuscular' | 'subcutaneous' | 'topical' | 'inhalation' | 'other';
  status: 'active' | 'discontinued' | 'completed' | 'on_hold';
  startDate: string;
  endDate?: string;
  prescribedById: string;
  prescribedByName: string;
  instructions?: string;
  warnings?: string[];
}

export interface Allergy {
  id: string;
  allergen: string;
  allergenType: 'medication' | 'food' | 'environmental' | 'other';
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  status: 'active' | 'inactive' | 'resolved';
  onsetDate?: string;
  verifiedDate?: string;
  verifiedById?: string;
  notes?: string;
}

export interface VitalSigns {
  id: string;
  recordedAt: string;
  recordedById: string;
  recordedByName: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  oxygenSaturation?: number;
  height?: number;
  heightUnit?: 'cm' | 'in';
  weight?: number;
  weightUnit?: 'kg' | 'lb';
  bmi?: number;
  painLevel?: number;
  notes?: string;
}

export interface RecordAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  description?: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface RecordSignature {
  id: string;
  signedById: string;
  signedByName: string;
  signedByRole: string;
  signatureType: 'author' | 'co_signer' | 'witness' | 'attending';
  signedAt: string;
  signatureHash: string;
  isVerified: boolean;
}

export interface RecordAmendment {
  id: string;
  amendedById: string;
  amendedByName: string;
  amendedAt: string;
  reason: string;
  originalContent: string;
  amendedContent: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedById?: string;
  approvedAt?: string;
}

export interface AccessLogEntry {
  id: string;
  accessedById: string;
  accessedByName: string;
  accessedByRole: string;
  accessType: 'view' | 'print' | 'download' | 'export' | 'edit';
  accessedAt: string;
  ipAddress?: string;
  reason?: string;
}

export interface ClinicalEncounter {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  encounterType: EncounterType;
  status: EncounterStatus;
  admissionDate: string;
  dischargeDate?: string;
  providerId: string;
  providerName: string;
  departmentId: string;
  departmentName: string;
  locationId?: string;
  locationName?: string;
  chiefComplaint?: string;
  reasonForVisit?: string;
  diagnoses: Diagnosis[];
  procedures: Procedure[];
  records: MedicalRecord[];
  orders: ClinicalOrder[];
  createdAt: string;
  updatedAt: string;
}

export type EncounterType = 
  | 'outpatient'
  | 'inpatient'
  | 'emergency'
  | 'observation'
  | 'telemedicine'
  | 'home_health'
  | 'ambulatory_surgery';

export type EncounterStatus = 
  | 'scheduled'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'discharged'
  | 'cancelled'
  | 'no_show';

export interface ClinicalOrder {
  id: string;
  orderType: 'lab' | 'imaging' | 'medication' | 'procedure' | 'referral' | 'therapy';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'stat';
  orderedById: string;
  orderedByName: string;
  orderedAt: string;
  description: string;
  instructions?: string;
  results?: string;
  resultedAt?: string;
}

export interface PatientHistory {
  patientId: string;
  patientName: string;
  mrn: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  bloodType?: string;
  medicalHistory: MedicalHistoryItem[];
  surgicalHistory: SurgicalHistoryItem[];
  familyHistory: FamilyHistoryItem[];
  socialHistory: SocialHistory;
  currentMedications: Medication[];
  allergies: Allergy[];
  immunizations: Immunization[];
  problemList: ProblemListItem[];
}

export interface MedicalHistoryItem {
  condition: string;
  diagnosedDate?: string;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

export interface SurgicalHistoryItem {
  procedure: string;
  date: string;
  hospital?: string;
  surgeon?: string;
  complications?: string;
  notes?: string;
}

export interface FamilyHistoryItem {
  relationship: string;
  condition: string;
  ageAtDiagnosis?: number;
  deceased: boolean;
  ageAtDeath?: number;
  notes?: string;
}

export interface SocialHistory {
  smokingStatus: 'never' | 'former' | 'current' | 'unknown';
  smokingDetails?: string;
  alcoholUse: 'none' | 'occasional' | 'moderate' | 'heavy' | 'unknown';
  alcoholDetails?: string;
  drugUse?: string;
  occupation?: string;
  maritalStatus?: string;
  livingArrangement?: string;
  exercise?: string;
  diet?: string;
  notes?: string;
}

export interface Immunization {
  id: string;
  vaccineName: string;
  vaccineCode?: string;
  administerDate: string;
  lotNumber?: string;
  site?: string;
  route?: string;
  administeredById?: string;
  administeredByName?: string;
  nextDueDate?: string;
  notes?: string;
}

export interface ProblemListItem {
  id: string;
  problem: string;
  code?: string;
  codeSystem?: string;
  status: 'active' | 'resolved' | 'inactive';
  priority: 'high' | 'medium' | 'low';
  onsetDate?: string;
  resolvedDate?: string;
  managedById?: string;
  managedByName?: string;
  notes?: string;
}

export interface ClinicalTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  recordType: MedicalRecordType;
  specialty?: string;
  content: string;
  variables: TemplateVariable[];
  isActive: boolean;
  isDefault: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea';
  options?: string[];
  defaultValue?: string;
  required: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RecordFilters {
  patientId?: string;
  recordType?: MedicalRecordType;
  status?: RecordStatus;
  providerId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

// ============================================================================
// API Functions
// ============================================================================

export const medicalRecordsApi = {
  // List medical records
  list: async (
    page = 1,
    pageSize = 20,
    filters?: RecordFilters
  ): Promise<PaginatedResponse<MedicalRecord>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.patientId && { patientId: filters.patientId }),
      ...(filters?.recordType && { recordType: filters.recordType }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.providerId && { providerId: filters.providerId }),
      ...(filters?.departmentId && { departmentId: filters.departmentId }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.searchQuery && { search: filters.searchQuery }),
    });
    const response = await api.get(`/medical-records?${params}`);
    return response.data;
  },

  // Get single record
  get: async (id: string): Promise<MedicalRecord> => {
    const api = getApi();
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  },

  // Create record
  create: async (data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const api = getApi();
    const response = await api.post('/medical-records', data);
    return response.data;
  },

  // Update record
  update: async (id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const api = getApi();
    const response = await api.put(`/medical-records/${id}`, data);
    return response.data;
  },

  // Sign record
  sign: async (id: string, signatureType: RecordSignature['signatureType'] = 'author'): Promise<MedicalRecord> => {
    const api = getApi();
    const response = await api.post(`/medical-records/${id}/sign`, { signatureType });
    return response.data;
  },

  // Request co-signature
  requestCoSignature: async (id: string, coSignerId: string): Promise<MedicalRecord> => {
    const api = getApi();
    const response = await api.post(`/medical-records/${id}/request-cosign`, { coSignerId });
    return response.data;
  },

  // Amend record
  amend: async (id: string, reason: string, amendedContent: string): Promise<MedicalRecord> => {
    const api = getApi();
    const response = await api.post(`/medical-records/${id}/amend`, { reason, amendedContent });
    return response.data;
  },

  // Lock record
  lock: async (id: string): Promise<MedicalRecord> => {
    const api = getApi();
    const response = await api.post(`/medical-records/${id}/lock`);
    return response.data;
  },

  // Add attachment
  addAttachment: async (id: string, file: File, description?: string): Promise<RecordAttachment> => {
    const api = getApi();
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    const response = await api.post(`/medical-records/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Remove attachment
  removeAttachment: async (recordId: string, attachmentId: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/medical-records/${recordId}/attachments/${attachmentId}`);
  },

  // Get access log
  getAccessLog: async (id: string): Promise<AccessLogEntry[]> => {
    const api = getApi();
    const response = await api.get(`/medical-records/${id}/access-log`);
    return response.data;
  },

  // Print record
  print: async (id: string): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/medical-records/${id}/print`, { responseType: 'blob' });
    return response.data;
  },
};

export const encountersApi = {
  // List encounters
  list: async (
    page = 1,
    pageSize = 20,
    patientId?: string,
    status?: EncounterStatus
  ): Promise<PaginatedResponse<ClinicalEncounter>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(patientId && { patientId }),
      ...(status && { status }),
    });
    const response = await api.get(`/encounters?${params}`);
    return response.data;
  },

  // Get encounter
  get: async (id: string): Promise<ClinicalEncounter> => {
    const api = getApi();
    const response = await api.get(`/encounters/${id}`);
    return response.data;
  },

  // Create encounter
  create: async (data: Partial<ClinicalEncounter>): Promise<ClinicalEncounter> => {
    const api = getApi();
    const response = await api.post('/encounters', data);
    return response.data;
  },

  // Update encounter
  update: async (id: string, data: Partial<ClinicalEncounter>): Promise<ClinicalEncounter> => {
    const api = getApi();
    const response = await api.put(`/encounters/${id}`, data);
    return response.data;
  },

  // Discharge patient
  discharge: async (id: string, dischargeSummary: string): Promise<ClinicalEncounter> => {
    const api = getApi();
    const response = await api.post(`/encounters/${id}/discharge`, { dischargeSummary });
    return response.data;
  },

  // Add order to encounter
  addOrder: async (encounterId: string, order: Partial<ClinicalOrder>): Promise<ClinicalOrder> => {
    const api = getApi();
    const response = await api.post(`/encounters/${encounterId}/orders`, order);
    return response.data;
  },
};

export const patientHistoryApi = {
  // Get patient history
  get: async (patientId: string): Promise<PatientHistory> => {
    const api = getApi();
    const response = await api.get(`/patients/${patientId}/history`);
    return response.data;
  },

  // Update medical history
  updateMedicalHistory: async (patientId: string, items: MedicalHistoryItem[]): Promise<PatientHistory> => {
    const api = getApi();
    const response = await api.put(`/patients/${patientId}/history/medical`, { items });
    return response.data;
  },

  // Update surgical history
  updateSurgicalHistory: async (patientId: string, items: SurgicalHistoryItem[]): Promise<PatientHistory> => {
    const api = getApi();
    const response = await api.put(`/patients/${patientId}/history/surgical`, { items });
    return response.data;
  },

  // Update family history
  updateFamilyHistory: async (patientId: string, items: FamilyHistoryItem[]): Promise<PatientHistory> => {
    const api = getApi();
    const response = await api.put(`/patients/${patientId}/history/family`, { items });
    return response.data;
  },

  // Update social history
  updateSocialHistory: async (patientId: string, data: SocialHistory): Promise<PatientHistory> => {
    const api = getApi();
    const response = await api.put(`/patients/${patientId}/history/social`, data);
    return response.data;
  },

  // Add immunization
  addImmunization: async (patientId: string, immunization: Partial<Immunization>): Promise<Immunization> => {
    const api = getApi();
    const response = await api.post(`/patients/${patientId}/immunizations`, immunization);
    return response.data;
  },

  // Update problem list
  updateProblemList: async (patientId: string, items: ProblemListItem[]): Promise<PatientHistory> => {
    const api = getApi();
    const response = await api.put(`/patients/${patientId}/problems`, { items });
    return response.data;
  },
};

export const diagnosesApi = {
  // Search diagnoses (ICD-10 lookup)
  search: async (query: string, codeSystem: 'ICD-10' | 'ICD-11' | 'SNOMED-CT' = 'ICD-10'): Promise<{
    code: string;
    description: string;
    category: string;
  }[]> => {
    const api = getApi();
    const response = await api.get(`/diagnoses/search?query=${encodeURIComponent(query)}&codeSystem=${codeSystem}`);
    return response.data;
  },

  // Get common diagnoses
  getCommon: async (specialty?: string): Promise<Diagnosis[]> => {
    const api = getApi();
    const params = specialty ? `?specialty=${specialty}` : '';
    const response = await api.get(`/diagnoses/common${params}`);
    return response.data;
  },
};

export const proceduresApi = {
  // Search procedures (CPT lookup)
  search: async (query: string, codeSystem: 'CPT' | 'ICD-10-PCS' | 'SNOMED-CT' = 'CPT'): Promise<{
    code: string;
    description: string;
    category: string;
  }[]> => {
    const api = getApi();
    const response = await api.get(`/procedures/search?query=${encodeURIComponent(query)}&codeSystem=${codeSystem}`);
    return response.data;
  },
};

export const clinicalTemplatesApi = {
  // List templates
  list: async (recordType?: MedicalRecordType, specialty?: string): Promise<ClinicalTemplate[]> => {
    const api = getApi();
    const params = new URLSearchParams();
    if (recordType) params.append('recordType', recordType);
    if (specialty) params.append('specialty', specialty);
    const queryString = params.toString() ? `?${params}` : '';
    const response = await api.get(`/clinical-templates${queryString}`);
    return response.data;
  },

  // Get template
  get: async (id: string): Promise<ClinicalTemplate> => {
    const api = getApi();
    const response = await api.get(`/clinical-templates/${id}`);
    return response.data;
  },

  // Create template
  create: async (data: Partial<ClinicalTemplate>): Promise<ClinicalTemplate> => {
    const api = getApi();
    const response = await api.post('/clinical-templates', data);
    return response.data;
  },

  // Update template
  update: async (id: string, data: Partial<ClinicalTemplate>): Promise<ClinicalTemplate> => {
    const api = getApi();
    const response = await api.put(`/clinical-templates/${id}`, data);
    return response.data;
  },

  // Delete template
  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/clinical-templates/${id}`);
  },
};

export const vitalSignsApi = {
  // Get latest vitals for patient
  getLatest: async (patientId: string): Promise<VitalSigns> => {
    const api = getApi();
    const response = await api.get(`/patients/${patientId}/vitals/latest`);
    return response.data;
  },

  // Get vitals history
  getHistory: async (patientId: string, startDate?: string, endDate?: string): Promise<VitalSigns[]> => {
    const api = getApi();
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params}` : '';
    const response = await api.get(`/patients/${patientId}/vitals${queryString}`);
    return response.data;
  },

  // Record vitals
  record: async (patientId: string, vitals: Partial<VitalSigns>): Promise<VitalSigns> => {
    const api = getApi();
    const response = await api.post(`/patients/${patientId}/vitals`, vitals);
    return response.data;
  },
};

export const allergiesApi = {
  // Get patient allergies
  list: async (patientId: string): Promise<Allergy[]> => {
    const api = getApi();
    const response = await api.get(`/patients/${patientId}/allergies`);
    return response.data;
  },

  // Add allergy
  add: async (patientId: string, allergy: Partial<Allergy>): Promise<Allergy> => {
    const api = getApi();
    const response = await api.post(`/patients/${patientId}/allergies`, allergy);
    return response.data;
  },

  // Update allergy
  update: async (patientId: string, allergyId: string, data: Partial<Allergy>): Promise<Allergy> => {
    const api = getApi();
    const response = await api.put(`/patients/${patientId}/allergies/${allergyId}`, data);
    return response.data;
  },

  // Remove allergy
  remove: async (patientId: string, allergyId: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/patients/${patientId}/allergies/${allergyId}`);
  },
};

export const medicationsApi = {
  // Get patient medications
  list: async (patientId: string, status?: 'active' | 'all'): Promise<Medication[]> => {
    const api = getApi();
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/patients/${patientId}/medications${params}`);
    return response.data;
  },

  // Add medication
  add: async (patientId: string, medication: Partial<Medication>): Promise<Medication> => {
    const api = getApi();
    const response = await api.post(`/patients/${patientId}/medications`, medication);
    return response.data;
  },

  // Update medication
  update: async (patientId: string, medicationId: string, data: Partial<Medication>): Promise<Medication> => {
    const api = getApi();
    const response = await api.put(`/patients/${patientId}/medications/${medicationId}`, data);
    return response.data;
  },

  // Discontinue medication
  discontinue: async (patientId: string, medicationId: string, reason: string): Promise<Medication> => {
    const api = getApi();
    const response = await api.post(`/patients/${patientId}/medications/${medicationId}/discontinue`, { reason });
    return response.data;
  },

  // Drug interaction check
  checkInteractions: async (medications: string[]): Promise<{
    hasInteractions: boolean;
    interactions: { drugs: string[]; severity: string; description: string }[];
  }> => {
    const api = getApi();
    const response = await api.post('/medications/check-interactions', { medications });
    return response.data;
  },
};
