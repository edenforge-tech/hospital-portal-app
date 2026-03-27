import { getApi } from './api';

// ========== TYPES ==========

export interface SurgeryRecommendationDto {
  patientId: string;
  surgeryType: 'Cataract' | 'Glaucoma' | 'Vitreoretinal' | 'Corneal';
  procedureType: string;
  eye: 'OD' | 'OS' | 'OU';
  diagnosisCode?: string;
  diagnosisDescription?: string;
  packageType: 'Standard' | 'Premium' | 'Custom';
  packagePrice?: number;
  iolFormula?: string;
  iolPower?: number;
  iolType?: string;
  preOpChecklist: string[];
  urgency?: 'routine' | 'urgent' | 'emergency';
  notes?: string;
  specialInstructions?: string;
  preferredDate?: string;
  preferredTime?: string;
}

export interface IOLCalculationDto {
  patientId: string;
  eye: 'OD' | 'OS';
  axialLength: number;
  k1: number;
  k2: number;
  anteriorChamberDepth: number;
  lensThickness?: number;
  whiteToWhite?: number;
  aConstant: number;
  targetRefraction: number;
  formulas: string[];
}

export interface IOLCalculationResultDto {
  calculatedPowers: Record<string, number>;
  recommendedFormula: string;
  warnings: string[];
}

export interface PreOpChecklistDto {
  surgeryType: 'Cataract' | 'Glaucoma' | 'Vitreoretinal' | 'Corneal';
  procedureType: string;
  patientAge: number;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  onAnticoagulants: boolean;
  additionalItems: string[];
}

export interface CounselorReferralDto {
  surgeryRequestId: string;
  referralNotes?: string;
  isPriorityReferral: boolean;
}

export interface SurgeryRequestResponseDto {
  id: string;
  patientId: string;
  patientName: string;
  surgeryType: string;
  procedureType: string;
  eye: string;
  packageType: string;
  packagePrice?: number;
  status: string;
  urgency: string;
  preferredDate?: string;
  requestDate: string;
  preOpChecklist: string[];
  counselorReferralSent: boolean;
}

// ========== API FUNCTIONS ==========

/**
 * Create a surgery recommendation for a patient
 */
export const createSurgeryRecommendation = async (
  dto: SurgeryRecommendationDto
): Promise<SurgeryRequestResponseDto> => {
  const api = getApi();
  const response = await api.post('/surgery/recommend', dto);
  return response.data;
};

/**
 * Calculate IOL power using multiple formulas
 */
export const calculateIOLPower = async (
  dto: IOLCalculationDto
): Promise<IOLCalculationResultDto> => {
  const api = getApi();
  const response = await api.post('/surgery/calculate-iol', dto);
  return response.data;
};

/**
 * Generate pre-operative checklist
 */
export const generatePreOpChecklist = async (
  dto: PreOpChecklistDto
): Promise<{ checklist: string[]; totalItems: number }> => {
  const api = getApi();
  const response = await api.post('/surgery/generate-preop-checklist', dto);
  return response.data;
};

/**
 * Refer surgery request to counselor
 */
export const referToCounselor = async (
  dto: CounselorReferralDto
): Promise<{ message: string; isPriority: boolean }> => {
  const api = getApi();
  const response = await api.post('/surgery/refer-to-counselor', dto);
  return response.data;
};

/**
 * Get surgery request by ID
 */
export const getSurgeryRequestById = async (
  id: string
): Promise<SurgeryRequestResponseDto> => {
  const api = getApi();
  const response = await api.get(`/surgery/${id}`);
  return response.data;
};

/**
 * Get surgery requests for a patient
 */
export const getSurgeryRequestsByPatient = async (
  patientId: string
): Promise<{ data: SurgeryRequestResponseDto[]; total: number }> => {
  const api = getApi();
  const response = await api.get(`/surgery/patient/${patientId}`);
  return response.data;
};

/**
 * Update surgery request status
 */
export const updateSurgeryStatus = async (
  id: string,
  status: string
): Promise<{ message: string; status: string }> => {
  const api = getApi();
  const response = await api.patch(`/surgery/${id}/status`, { status });
  return response.data;
};
