// Consents Module Hooks - Module 3.9
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import type {
  ConsentTemplate,
  PatientConsent,
  RenderConsentRequest,
  ConsentListResponse,
} from '@/types/counselor';

// ==================== Consent Templates Hooks ====================

export function useConsentTemplates() {
  return useQuery({
    queryKey: ['consents', 'templates'],
    queryFn: async () => {
      const response = await getApi().get<ConsentTemplate[]>('/consents/templates');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useConsentTemplate(id: string) {
  return useQuery({
    queryKey: ['consents', 'template', id],
    queryFn: async () => {
      const response = await getApi().get<ConsentTemplate>(`/consents/templates/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateConsentTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      templateName: string;
      consentCategory: string;
      description?: string;
      templateHtml: string;
      requiresPatientSignature: boolean;
      requiresWitnessSignature: boolean;
      requiresGuardianSignature: boolean;
    }) => {
      const response = await getApi().post<ConsentTemplate>('/consents/templates', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents', 'templates'] });
    },
  });
}

export function useUpdateConsentTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await getApi().put<ConsentTemplate>(`/consents/templates/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consents', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['consents', 'template', variables.id] });
    },
  });
}

// ==================== Patient Consents Hooks ====================

export function useConsents(sessionId?: string, patientId?: string, status?: string, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['consents', sessionId, patientId, status, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (patientId) params.append('patientId', patientId);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      const response = await getApi().get<ConsentListResponse>(`/consents?${params}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useConsent(id: string) {
  return useQuery({
    queryKey: ['consents', 'consent', id],
    queryFn: async () => {
      const response = await getApi().get<PatientConsent>(`/consents/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useRenderConsent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RenderConsentRequest) => {
      const response = await getApi().post<PatientConsent>('/consents/render', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });
}

export function useSignConsent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, signatureData }: { id: string; signatureData: { signatureType: string; signatureData: string; signerName: string } }) => {
      const response = await getApi().post(`/consents/${id}/sign`, signatureData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consents', 'consent', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });
}

export function useWitnessSignConsent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, witnessData }: { id: string; witnessData: { witnessSignature: string; witnessName: string; witnessRelation?: string } }) => {
      const response = await getApi().post(`/consents/${id}/witness-sign`, witnessData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consents', 'consent', variables.id] });
    },
  });
}

export function useFinalizeConsent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await getApi().post(`/consents/${id}/finalize`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['consents', 'consent', id] });
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });
}

export function useConsentPdf(id: string) {
  return useQuery({
    queryKey: ['consents', 'consent-pdf', id],
    queryFn: async () => {
      const response = await getApi().get(`/consents/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    },
    enabled: false, // Manual trigger only
  });
}
