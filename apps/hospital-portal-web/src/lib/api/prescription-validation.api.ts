// Prescription Validation API
// Phase 3: Drug Interaction Service Integration

import { getApi } from '../api';
import type {
  PrescriptionValidationResult,
  ValidatePrescriptionRequest,
  DrugInteraction,
  OphthalMedication,
} from '@/types/prescription';

/**
 * Validate prescription comprehensively (allergies, interactions, contraindications, duplicates)
 * POST /api/prescriptionvalidation/validate
 */
export async function validatePrescription(
  request: ValidatePrescriptionRequest
): Promise<PrescriptionValidationResult> {
  const api = getApi();
  const response = await api.post('/prescriptionvalidation/validate', request);
  return response.data;
}

/**
 * Check drug-drug interactions only
 * POST /api/prescriptionvalidation/interactions
 */
export async function checkDrugInteractions(
  medicationNames: string[]
): Promise<{ hasInteractions: boolean; interactions: DrugInteraction[] }> {
  const api = getApi();
  const response = await api.post('/prescriptionvalidation/interactions', medicationNames);
  return response.data;
}

/**
 * Check patient allergies against medications
 * POST /api/prescriptionvalidation/allergies/{patientId}
 */
export async function checkPatientAllergies(
  patientId: string,
  medicationNames: string[]
): Promise<{ hasInteractions: boolean; interactions: DrugInteraction[] }> {
  const api = getApi();
  const response = await api.post(`/prescriptionvalidation/allergies/${patientId}`, medicationNames);
  return response.data;
}

/**
 * Get medication information
 * GET /api/prescriptionvalidation/medication?name=X
 */
export async function getMedicationInfo(medicationName: string): Promise<OphthalMedication | null> {
  const api = getApi();
  try {
    const response = await api.get('/prescriptionvalidation/medication', {
      params: { name: medicationName },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Get all drug interactions (admin only)
 * GET /api/prescriptionvalidation/interactions/all
 */
export async function getAllInteractions(): Promise<DrugInteraction[]> {
  const api = getApi();
  const response = await api.get('/prescriptionvalidation/interactions/all');
  return response.data;
}

/**
 * Get specific drug interaction details
 * GET /api/prescriptionvalidation/interactions/details?drug1=X&drug2=Y
 */
export async function getInteractionDetails(
  drug1: string,
  drug2: string
): Promise<DrugInteraction | null> {
  const api = getApi();
  try {
    const response = await api.get('/prescriptionvalidation/interactions/details', {
      params: { drug1, drug2 },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
