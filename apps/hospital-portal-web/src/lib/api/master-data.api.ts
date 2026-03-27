// Master Data API - Dropdowns and reference data
import { getApi } from '../api';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface InsuranceProvider {
  id: string;
  providerCode: string;
  providerName: string;
  providerType: 'Private' | 'Government' | 'Corporate';
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  policyPrefix?: string;
  claimEmailAddress?: string;
  claimPortalUrl?: string;
  cashlessEnabled: boolean;
  reimbursementEnabled: boolean;
  preAuthRequired: boolean;
  averageApprovalTimeDays?: number;
  settlementTimeDays?: number;
  networkHospitals?: string;
  notes?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TpaProvider {
  id: string;
  tpaCode: string;
  tpaName: string;
  shortName?: string;
  registrationNumber?: string;
  irdaLicenseNumber?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  preAuthEmail?: string;
  claimEmail?: string;
  websiteUrl?: string;
  preAuthPortalUrl?: string;
  claimStatusPortalUrl?: string;
  preAuthTATHours?: number;
  emergencyContactNumber?: string;
  workingHours?: string;
  supportedInsuranceProviders?: string;
  notes?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SurgeryCategory =
  | 'Cataract'
  | 'Retina'
  | 'Glaucoma'
  | 'Cornea'
  | 'Refractive'
  | 'Oculoplasty'
  | 'Strabismus'
  | 'General'
  | 'Diagnostic';

export interface SurgeryType {
  id: string;
  surgeryCode: string;
  surgeryName: string;
  surgeryCategory: SurgeryCategory;
  description?: string;
  icdCode?: string;
  cptCode?: string;
  averageDurationMinutes?: number;
  anesthesiaType?: string;
  requiresOTBooking: boolean;
  requiresPreOpAssessment: boolean;
  requiresPostOpFollowUp: boolean;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  defaultPackageTemplateId?: string;
  notes?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnesthesiaType {
  id: string;
  anesthesiaCode: string;
  anesthesiaName: string;
  anesthesiaCategory: 'Local' | 'Regional' | 'General' | 'Monitored' | 'Sedation';
  description?: string;
  requiresAnesthetist: boolean;
  recoveryTimeMinutes?: number;
  additionalCost?: number;
  contraindicationsNote?: string;
  preparationInstructions?: string;
  postAnesthesiaCareInstructions?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GovernmentScheme {
  id: string;
  schemeCode: string;
  schemeName: string;
  schemeType: 'Central' | 'State' | 'Military' | 'Corporate' | 'Other';
  governingBody?: string;
  eligibilityCriteria?: string;
  coverageLimit?: number;
  beneficiaryCardPrefix?: string;
  verificationUrl?: string;
  claimSubmissionEmail?: string;
  claimPortalUrl?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  preAuthRequired: boolean;
  cashlessFacilityAvailable: boolean;
  averageClaimSettlementDays?: number;
  requiredDocuments?: string;
  notes?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


// ============================================================================
// Recommended Procedure Item (per-eye, multi-procedure)
// ============================================================================

export type ProcedureEye = 'RE' | 'LE' | 'Both';

export interface RecommendedProcedureItem {
  eye: ProcedureEye;
  surgeryTypeId: string;
  surgeryName: string;
  surgeryCategory: SurgeryCategory;
  requiresIol: boolean;
  iclProcedure: boolean;
  laserProcedure: boolean;
  kcnTreatmentType?: string | null;    // e.g. 'CXL', 'ICRS', 'DALK', 'PKP', 'ICL+CXL'
  /** Internal-only catalog sub-type (e.g. 'Supraphob', 'Premium', 'Zeiss'). Staff use only. */
  variantSubOption?: string | null;
  iolCatalogId?: string | null;
  iolModelName?: string | null;
  iolType?: string | null;
  packageId?: string | null;
  packageName?: string | null;
  unitPrice?: number | null;
  notes?: string | null;
}

export interface PackageCostCalculation {
  surgeryCost: number;
  iolCost: number;
  consultationFee: number;
  totalCost: number;
  currencyCode: string;
  surgeryName?: string;
  iolName?: string;
  hasBranchOverrides: boolean;
  calculatedAt: string;
  // Package template matching (Phase 3 Enhancement)
  hasMatchingPackage?: boolean;
  matchedPackageId?: string;
  matchedPackageName?: string;
  matchedPackagePrice?: number;
  savingsAmount?: number;
  savingsPercentage?: number;
}

export interface ConsultationFeeResponse {
  consultationFee: number;
  currencyCode: string;
  isEmergency: boolean;
  isFollowUp: boolean;
  appliedFor: {
    doctorId?: string;
    departmentId?: string;
    specialty?: string;
    chargeType: string;
  };
}

export interface DoctorSearchResult {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  specialization: string;
  department: string;
  departmentId?: string;
  qualification?: string;
  licenseNumber?: string;
  email?: string;
  phoneNumber?: string;
}

// ============================================================================
// API Functions
// ============================================================================

export const masterDataApi = {
  // Insurance Providers
  getInsuranceProviders: async (): Promise<InsuranceProvider[]> => {
    const response = await getApi().get('/masterdata/insurance-providers');
    return response.data;
  },

  getInsuranceProviderById: async (id: string): Promise<InsuranceProvider> => {
    const response = await getApi().get(`/masterdata/insurance-providers/${id}`);
    return response.data;
  },

  // TPA Providers
  getTpaProviders: async (): Promise<TpaProvider[]> => {
    const response = await getApi().get('/masterdata/tpa-providers');
    return response.data;
  },

  getTpaProviderById: async (id: string): Promise<TpaProvider> => {
    const response = await getApi().get(`/masterdata/tpa-providers/${id}`);
    return response.data;
  },

  // Anesthesia Types
  getAnesthesiaTypes: async (): Promise<AnesthesiaType[]> => {
    const response = await getApi().get('/masterdata/anesthesia-types');
    return response.data;
  },

  getAnesthesiaTypeById: async (id: string): Promise<AnesthesiaType> => {
    const response = await getApi().get(`/masterdata/anesthesia-types/${id}`);
    return response.data;
  },

  // Surgery Types
  getSurgeryTypes: async (): Promise<SurgeryType[]> => {
    const response = await getApi().get('/masterdata/surgery-types');
    return response.data;
  },

  // Government Schemes
  getGovernmentSchemes: async (): Promise<GovernmentScheme[]> => {
    const response = await getApi().get('/masterdata/government-schemes');
    return response.data;
  },

  getGovernmentSchemeById: async (id: string): Promise<GovernmentScheme> => {
    const response = await getApi().get(`/masterdata/government-schemes/${id}`);
    return response.data;
  },

  // Package Cost Calculation
  calculatePackageCost: async (data: {
    branchId: string;
    surgeryTypeId: string;
    iolCatalogId?: string;
    doctorId?: string;
  }): Promise<PackageCostCalculation> => {
    const response = await getApi().post('/masterdata/calculate-package-cost', data);
    return response.data;
  },

  // Consultation Fees
  getConsultationFee: async (params: {
    branchId: string;
    doctorId?: string;
    departmentId?: string;
    specialty?: string;
    isEmergency?: boolean;
    isFollowUp?: boolean;
  }): Promise<ConsultationFeeResponse> => {
    const response = await getApi().get('/masterdata/consultation-fee', { params });
    return response.data;
  },

  // Doctor Search
  searchDoctors: async (params: {
    searchTerm?: string;
    specialty?: string;
    branchId?: string;
    limit?: number;
  }): Promise<{ data: DoctorSearchResult[]; count: number }> => {
    const response = await getApi().get('/users/doctors/search', { params });
    return response.data;
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert master data to dropdown options
 */
export const toDropdownOptions = <T extends { id: string; [key: string]: any }>(
  items: T[],
  labelKey: string,
  valueKey: string = 'id'
) => {
  return items.map(item => ({
    label: item[labelKey] as string,
    value: item[valueKey] as string,
  }));
};

/**
 * Filter active items only
 */
export const filterActive = <T extends { isActive: boolean }>(items: T[]): T[] => {
  return items.filter(item => item.isActive);
};

/**
 * Get insurance provider options for dropdown
 */
export const getInsuranceProviderOptions = async () => {
  const providers = await masterDataApi.getInsuranceProviders();
  return toDropdownOptions(filterActive(providers), 'providerName');
};

/**
 * Get TPA provider options for dropdown
 */
export const getTpaProviderOptions = async () => {
  const providers = await masterDataApi.getTpaProviders();
  return toDropdownOptions(filterActive(providers), 'tpaName');
};

/**
 * Get anesthesia type options for dropdown
 */
export const getAnesthesiaTypeOptions = async () => {
  const types = await masterDataApi.getAnesthesiaTypes();
  return toDropdownOptions(filterActive(types), 'anesthesiaName');
};

/**
 * Get government scheme options for dropdown
 */
export const getGovernmentSchemeOptions = async () => {
  const schemes = await masterDataApi.getGovernmentSchemes();
  return toDropdownOptions(filterActive(schemes), 'schemeName');
};
