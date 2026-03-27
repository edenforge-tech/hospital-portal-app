import { getApi } from '../api';

// Types
export interface Prescription {
  id: string;
  tenantId: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  prescriptionDate: string;
  diagnosis: string;
  instructions?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  medications: PrescriptionMedication[];
  isPrinted: boolean;
  printedAt?: string;
  dispensedDate?: string;
  dispensedByUserId?: string;
  dispensedByUserName?: string;
  pharmacyName?: string;
  pharmacyContact?: string;
  treatmentDurationDays?: number;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMedication {
  id: string;
  prescriptionId: string;
  medicationName: string;
  genericName?: string;
  dosage: string;
  form: string;
  route: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  startDate: string;
  endDate?: string;
  instructions?: string;
  isCritical: boolean;
}

export interface CreatePrescriptionRequest {
  patientId: string;
  diagnosis: string;
  instructions?: string;
  medications: CreateMedicationRequest[];
  treatmentDurationDays?: number;
  followUpDate?: string;
}

export interface CreateMedicationRequest {
  medicationName: string;
  genericName?: string;
  dosage: string;
  form: string;
  route: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  instructions?: string;
  isCritical: boolean;
}

export interface UpdatePrescriptionRequest {
  diagnosis?: string;
  instructions?: string;
  medications?: CreateMedicationRequest[];
  followUpDate?: string;
}

export interface DispensePrescriptionRequest {
  pharmacyName: string;
  pharmacyContact?: string;
  dispensedByUserId: string;
  dispensedDate: string;
  dispensedMedications: string[];
  counselingNotes?: string;
}

export interface DrugInteraction {
  id: string;
  drug1Name: string;
  drug2Name: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  clinicalManagement: string;
  referenceSources?: string;
}

export interface DrugInteractionCheckRequest {
  patientId?: string;
  medicationNames: string[];
}

export interface DrugInteractionCheckResponse {
  drugInteractions: DrugInteraction[];
  allergyWarnings: string[];
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  category: string;
  form: string;
  standardDosages: string[];
  description?: string;
  warnings?: string;
  isActive: boolean;
}

export interface CreateMedicationDatabaseRequest {
  name: string;
  genericName: string;
  brandNames: string[];
  category: string;
  form: string;
  standardDosages: string[];
  description?: string;
  warnings?: string;
}

// API Functions
export const prescriptionApi = {
  // Prescription CRUD
  create: (data: CreatePrescriptionRequest) =>
    getApi().post<Prescription>('/prescriptions', data),

  getById: (id: string) =>
    getApi().get<Prescription>(`/prescriptions/${id}`),

  getByPatient: (patientId: string) =>
    getApi().get<Prescription[]>(`/prescriptions/patient/${patientId}`),

  getByDoctor: (doctorId: string) =>
    getApi().get<Prescription[]>(`/prescriptions/doctor/${doctorId}`),

  update: (id: string, data: UpdatePrescriptionRequest) =>
    getApi().put<Prescription>(`/prescriptions/${id}`, data),

  dispense: (id: string, data: DispensePrescriptionRequest) =>
    getApi().post<Prescription>(`/prescriptions/${id}/dispense`, data),

  cancel: (id: string) =>
    getApi().post<Prescription>(`/prescriptions/${id}/cancel`, {}),

  print: (id: string) =>
    getApi().post<Prescription>(`/prescriptions/${id}/print`, {}),

  delete: (id: string) =>
    getApi().delete(`/prescriptions/${id}`),

  // Drug Interaction Checking
  checkInteractions: (data: DrugInteractionCheckRequest) =>
    getApi().post<DrugInteractionCheckResponse>('/prescriptions/check-interactions', data),

  // Medication Database
  searchMedications: (query: string, page: number = 1, pageSize: number = 20) =>
    getApi().get<Medication[]>('/medications/search', {
      params: { query, page, pageSize },
    }),

  getMedicationById: (id: string) =>
    getApi().get<Medication>(`/medications/${id}`),

  getMedicationByName: (name: string) =>
    getApi().get<Medication>(`/medications/by-name/${name}`),

  getMedicationsByCategory: (category: string) =>
    getApi().get<Medication[]>(`/medications/category/${category}`),

  getCategories: () =>
    getApi().get<string[]>('/medications/categories'),

  getStandardDosages: (medicationName: string) =>
    getApi().get<string[]>(`/medications/${medicationName}/dosages`),

  // Admin operations
  createMedication: (data: CreateMedicationDatabaseRequest) =>
    getApi().post<Medication>('/medications', data),

  updateMedication: (id: string, data: CreateMedicationDatabaseRequest) =>
    getApi().put<Medication>(`/medications/${id}`, data),

  deactivateMedication: (id: string) =>
    getApi().delete(`/medications/${id}`),
};
