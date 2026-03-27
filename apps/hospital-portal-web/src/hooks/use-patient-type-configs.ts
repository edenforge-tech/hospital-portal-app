// Patient Type Configuration Hooks - React Query hooks for patient type configs
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  patientTypeConfigsApi,
  type PatientTypeConfig,
} from '@/lib/api/patient-type-configs.api';

// ============================================================================
// Query Keys
// ============================================================================

export const patientTypeConfigKeys = {
  all: ['patient-type-configs'] as const,
  lists: () => [...patientTypeConfigKeys.all, 'list'] as const,
  config: (patientType: string) => [...patientTypeConfigKeys.all, 'config', patientType] as const,
  validate: (patientType: string) => [...patientTypeConfigKeys.all, 'validate', patientType] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all active patient type configurations
 * 
 * Returns all 8 patient types: Cash, Insurance, CoPay, ESH, CGHS, Arograshree, SGHS, Camp
 * 
 * @example
 * const { data: configs, isLoading } = usePatientTypeConfigs();
 * 
 * configs?.forEach(config => {
 *   console.log(config.displayName, config.patientType);
 * });
 */
export function usePatientTypeConfigs(
  options?: Omit<UseQueryOptions<PatientTypeConfig[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: patientTypeConfigKeys.lists(),
    queryFn: () => patientTypeConfigsApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes (configs rarely change)
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

/**
 * Get configuration for a specific patient type
 * 
 * @param patientType - One of: Cash, Insurance, CoPay, ESH, CGHS, Arograshree, SGHS, Camp
 * 
 * @example
 * const { data: config, isLoading } = usePatientTypeConfig('Cash');
 * 
 * if (config?.configuration.requiresAdvancePayment) {
 *   const advance = totalAmount * config.configuration.advancePercentage / 100;
 *   console.log(`Advance Required: ${advance}`);
 * }
 */
export function usePatientTypeConfig(
  patientType: string,
  options?: Omit<UseQueryOptions<PatientTypeConfig>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: patientTypeConfigKeys.config(patientType),
    queryFn: () => patientTypeConfigsApi.getByType(patientType),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!patientType, // Only fetch if patientType is provided
    ...options,
  });
}

/**
 * Validate a patient type name
 * 
 * @param patientType - Patient type to validate
 * 
 * @example
 * const { data: validation } = useValidatePatientType('InvalidType');
 * 
 * if (!validation?.isValid) {
 *   toast.error(validation?.message || 'Invalid patient type');
 * }
 */
export function useValidatePatientType(
  patientType: string,
  options?: Omit<UseQueryOptions<{ isValid: boolean; message?: string }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: patientTypeConfigKeys.validate(patientType),
    queryFn: () => patientTypeConfigsApi.validate(patientType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!patientType, // Only validate if patientType is provided
    ...options,
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display-friendly patient type name
 */
export function getPatientTypeDisplayName(patientType: string): string {
  const displayNames: Record<string, string> = {
    'Cash': 'Cash Payment',
    'Insurance': 'Insurance (Full Coverage)',
    'CoPay': 'Insurance (Co-Payment)',
    'ESH': 'ESH Scheme',
    'CGHS': 'CGHS Scheme',
    'Arograshree': 'Arograshree Scheme',
    'SGHS': 'State Government Scheme',
    'Camp': 'Camp Sponsored'
  };
  return displayNames[patientType] || patientType;
}

/**
 * Check if patient type requires advance payment
 */
export function requiresAdvancePayment(config?: PatientTypeConfig): boolean {
  return config?.configuration?.requiresAdvancePayment ?? false;
}

/**
 * Get advance payment percentage
 */
export function getAdvancePercentage(config?: PatientTypeConfig): number {
  return config?.configuration?.advancePercentage ?? 0;
}

/**
 * Calculate advance payment amount
 */
export function calculateAdvanceAmount(packageAmount: number, config?: PatientTypeConfig): number {
  if (!requiresAdvancePayment(config)) {
    return 0;
  }
  const percentage = getAdvancePercentage(config);
  return (packageAmount * percentage) / 100;
}
