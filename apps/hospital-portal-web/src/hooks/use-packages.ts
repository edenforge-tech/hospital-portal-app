// Package Management Hooks - React Query hooks for packages
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  packagesApi,
  type CreatePackageRequest,
  type UpdatePackageRequest,
} from '@/lib/api/packages.api';
import type {
  SurgeryPackageTemplateDto,
  CounselorPackageDto,
  PackageFilters,
  PackageListResponse,
} from '@/types/counselor';

// ============================================================================
// Query Keys
// ============================================================================

export const packageKeys = {
  all: ['packages'] as const,
  templates: () => [...packageKeys.all, 'templates'] as const,
  template: (id: string) => [...packageKeys.templates(), id] as const,
  packages: () => [...packageKeys.all, 'counselor-packages'] as const,
  package: (id: string) => [...packageKeys.packages(), id] as const,
  sessionPackages: (sessionId: string) => [...packageKeys.packages(), 'session', sessionId] as const,
};

// ============================================================================
// Template Hooks
// ============================================================================

/**
 * Get all package templates
 */
export function usePackageTemplates(
  params?: { packageCategory?: string; surgeryType?: string; isActive?: boolean },
  options?: Omit<UseQueryOptions<SurgeryPackageTemplateDto[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...packageKeys.templates(), params],
    queryFn: () => packagesApi.getTemplates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get package template by ID
 */
export function usePackageTemplate(
  id: string,
  options?: Omit<UseQueryOptions<SurgeryPackageTemplateDto>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: packageKeys.template(id),
    queryFn: () => packagesApi.getTemplateById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Counselor Package Hooks
// ============================================================================

/**
 * Get all counselor packages
 */
export function useCounselorPackages(
  filters?: PackageFilters,
  options?: Omit<UseQueryOptions<PackageListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...packageKeys.packages(), filters],
    queryFn: () => packagesApi.getPackages(filters),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Get counselor package by ID
 */
export function useCounselorPackage(
  id: string,
  options?: Omit<UseQueryOptions<CounselorPackageDto>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: packageKeys.package(id),
    queryFn: () => packagesApi.getPackageById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Get packages for a specific session
 */
export function useSessionPackages(
  sessionId: string,
  options?: Omit<UseQueryOptions<CounselorPackageDto[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: packageKeys.sessionPackages(sessionId),
    queryFn: () => packagesApi.getSessionPackages(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
    ...options,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create package for patient
 */
export function useCreatePackage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreatePackageRequest) => packagesApi.createPackage(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.packages() });
      queryClient.invalidateQueries({ queryKey: packageKeys.sessionPackages(data.sessionId) });
    },
  });
}

/**
 * Update package
 */
export function useUpdatePackage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdatePackageRequest }) =>
      packagesApi.updatePackage(id, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.package(data.id) });
      queryClient.invalidateQueries({ queryKey: packageKeys.sessionPackages(data.sessionId) });
    },
  });
}

/**
 * Finalize package
 */
export function useFinalizePackage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => packagesApi.finalizePackage(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.package(data.id) });
      queryClient.invalidateQueries({ queryKey: packageKeys.sessionPackages(data.sessionId) });
    },
  });
}
