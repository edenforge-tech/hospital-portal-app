// Package Management API - Module 3 Counseling Workflow
import { getApi } from '../api';
import type {
  SurgeryPackageTemplateDto,
  CounselorPackageDto,
  PackageFilters,
  PackageListResponse,
} from '@/types/counselor';

// ============================================================================
// Additional Request Types (not in counselor.ts)
// ============================================================================

export interface CreatePackageRequest {
  templateId: string;
  sessionId: string;
  patientId: string;
  packageName: string;
  finalPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  customizedItems?: string;
  counselorNotes?: string;
}

export interface UpdatePackageRequest {
  finalPrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  customizedItems?: string;
  counselorNotes?: string;
  packageStatus?: string;
}

// ============================================================================
// API Functions
// ============================================================================

export const packagesApi = {
  /**
   * Get all package templates
   */
  getTemplates: async (params?: {
    packageCategory?: string;
    surgeryType?: string;
    isActive?: boolean;
  }): Promise<SurgeryPackageTemplateDto[]> => {
    const query = new URLSearchParams();
    if (params?.packageCategory) query.append('packageCategory', params.packageCategory);
    if (params?.surgeryType) query.append('surgeryType', params.surgeryType);
    if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());
    
    const url = `/packagemanagement/templates${query.toString() ? `?${query}` : ''}`;
    const response = await getApi().get<SurgeryPackageTemplateDto[]>(url);
    return response.data;
  },

  /**
   * Get template by ID
   */
  getTemplateById: async (id: string): Promise<SurgeryPackageTemplateDto> => {
    const response = await getApi().get<SurgeryPackageTemplateDto>(`/packagemanagement/templates/${id}`);
    return response.data;
  },

  /**
   * Get all packages with filtering
   */
  getPackages: async (filters?: PackageFilters): Promise<PackageListResponse> => {
    const query = new URLSearchParams();
    if (filters?.sessionId) query.append('sessionId', filters.sessionId);
    if (filters?.patientId) query.append('patientId', filters.patientId);
    if (filters?.packageStatus) query.append('packageStatus', filters.packageStatus);
    if (filters?.pageNumber) query.append('pageNumber', filters.pageNumber.toString());
    if (filters?.pageSize) query.append('pageSize', filters.pageSize.toString());
    
    const url = `/packagemanagement/packages${query.toString() ? `?${query}` : ''}`;
    const response = await getApi().get<PackageListResponse>(url);
    return response.data;
  },

  /**
   * Get package by ID
   */
  getPackageById: async (id: string): Promise<CounselorPackageDto> => {
    const response = await getApi().get<CounselorPackageDto>(`/packagemanagement/packages/${id}`);
    return response.data;
  },

  /**
   * Create package for patient
   */
  createPackage: async (request: CreatePackageRequest): Promise<CounselorPackageDto> => {
    const response = await getApi().post<{ success: boolean; package: CounselorPackageDto }>(
      '/packagemanagement/packages',
      request
    );
    return response.data.package;
  },

  /**
   * Update package
   */
  updatePackage: async (id: string, request: UpdatePackageRequest): Promise<CounselorPackageDto> => {
    const response = await getApi().put<{ success: boolean; package: CounselorPackageDto }>(
      `/packagemanagement/packages/${id}`,
      request
    );
    return response.data.package;
  },

  /**
   * Finalize package
   */
  finalizePackage: async (id: string): Promise<CounselorPackageDto> => {
    const response = await getApi().post<CounselorPackageDto>(`/packagemanagement/packages/${id}/finalize`);
    return response.data;
  },

  /**
   * Get packages for a specific session
   */
  getSessionPackages: async (sessionId: string): Promise<CounselorPackageDto[]> => {
    const response = await packagesApi.getPackages({ sessionId, pageSize: 100 });
    return response.packages || response.Packages || [];
  },
};
