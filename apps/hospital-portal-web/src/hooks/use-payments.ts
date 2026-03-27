// Payments Module Hooks - Module 3.7
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import type {
  PaymentTransaction,
  PaymentLink,
  GovernmentSchemeClaim,
  CreatePaymentRequest,
  CreatePaymentLinkRequest,
  PaymentListResponse,
} from '@/types/counselor';

// ==================== Payment Transaction Hooks ====================

export function usePayments(sessionId?: string, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['payments', 'transactions', sessionId, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      const response = await getApi().get<PaymentListResponse>(`/payments?${params}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payments', 'transaction', id],
    queryFn: async () => {
      const response = await getApi().get<PaymentTransaction>(`/payments/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePaymentRequest) => {
      const response = await getApi().post<PaymentTransaction>('/payments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePaymentRequest> }) => {
      const response = await getApi().put<PaymentTransaction>(`/payments/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'transaction', variables.id] });
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, refundData }: { id: string; refundData: { refundAmount: number; refundReason: string } }) => {
      const response = await getApi().post(`/payments/${id}/refund`, refundData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'transaction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
    },
  });
}

// ==================== Payment Link Hooks ====================

export function usePaymentLinks(sessionId?: string, status?: string) {
  return useQuery({
    queryKey: ['payments', 'links', sessionId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (status) params.append('status', status);
      
      const response = await getApi().get(`/payments/links?${params}`);
      return response.data;
    },
  });
}

export function usePaymentLink(id: string) {
  return useQuery({
    queryKey: ['payments', 'link', id],
    queryFn: async () => {
      const response = await getApi().get<PaymentLink>(`/payments/links/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useGeneratePaymentLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePaymentLinkRequest) => {
      const response = await getApi().post<PaymentLink>('/payments/links', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'links'] });
    },
  });
}

export function useSendPaymentLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, sendData }: { id: string; sendData: { sendVia: string; recipientDetails: string } }) => {
      const response = await getApi().post(`/payments/links/${id}/send`, sendData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'link', variables.id] });
    },
  });
}

export function useSendPaymentReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await getApi().post(`/payments/links/${id}/reminder`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'link', id] });
    },
  });
}

export function useExpirePaymentLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await getApi().post(`/payments/links/${id}/expire`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'link', id] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'links'] });
    },
  });
}

// ==================== Government Scheme Claims Hooks ====================

export function useGovernmentClaims(sessionId?: string, status?: string) {
  return useQuery({
    queryKey: ['payments', 'government-claims', sessionId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (status) params.append('status', status);
      
      const response = await getApi().get(`/payments/government-claims?${params}`);
      return response.data;
    },
  });
}

export function useGovernmentClaim(id: string) {
  return useQuery({
    queryKey: ['payments', 'government-claim', id],
    queryFn: async () => {
      const response = await getApi().get<GovernmentSchemeClaim>(`/payments/government-claims/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateGovernmentClaim() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await getApi().post<GovernmentSchemeClaim>('/payments/government-claims', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'government-claims'] });
    },
  });
}

export function useUpdateGovernmentClaim() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await getApi().put<GovernmentSchemeClaim>(`/payments/government-claims/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'government-claims'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'government-claim', variables.id] });
    },
  });
}
