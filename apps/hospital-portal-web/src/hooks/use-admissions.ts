// Admissions Module Hooks - Module 3.8
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import type {
  PatientAdmission,
  BedReservation,
  CreateAdmissionRequest,
  AdmissionListResponse,
} from '@/types/counselor';

// ==================== Admissions Hooks ====================

export function useAdmissions(sessionId?: string, admissionType?: string, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['admissions', sessionId, admissionType, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (admissionType) params.append('admissionType', admissionType);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      const response = await getApi().get<AdmissionListResponse>(`/admissions?${params}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useAdmission(id: string) {
  return useQuery({
    queryKey: ['admissions', 'admission', id],
    queryFn: async () => {
      const response = await getApi().get<PatientAdmission>(`/admissions/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateAdmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateAdmissionRequest) => {
      const response = await getApi().post<PatientAdmission>('/admissions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
    },
  });
}

export function useUpdateAdmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAdmissionRequest> }) => {
      const response = await getApi().put<PatientAdmission>(`/admissions/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admissions', 'admission', variables.id] });
    },
  });
}

export function useDeleteAdmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await getApi().delete(`/admissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
    },
  });
}

export function useDischargeAdmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, dischargeData }: { id: string; dischargeData: { actualDischargeDate: string; dischargeSummary?: string } }) => {
      const response = await getApi().post(`/admissions/${id}/discharge`, dischargeData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admissions', 'admission', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
    },
  });
}

// ==================== Bed Reservations Hooks ====================

export function useBedReservations(admissionId?: string) {
  return useQuery({
    queryKey: ['admissions', 'bed-reservations', admissionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (admissionId) params.append('admissionId', admissionId);
      
      const response = await getApi().get(`/admissions/bed-reservations?${params}`);
      return response.data;
    },
  });
}

export function useBedReservation(id: string) {
  return useQuery({
    queryKey: ['admissions', 'bed-reservation', id],
    queryFn: async () => {
      const response = await getApi().get<BedReservation>(`/admissions/bed-reservations/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateBedReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      admissionId: string;
      patientId: string;
      bedId: string;
      reservationStartDate: string;
      reservationEndDate: string;
    }) => {
      const response = await getApi().post<BedReservation>('/admissions/bed-reservations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions', 'bed-reservations'] });
    },
  });
}

export function useReleaseBedReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await getApi().post(`/admissions/bed-reservations/${id}/release`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admissions', 'bed-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['admissions', 'bed-reservation', id] });
    },
  });
}

export function useDeleteBedReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await getApi().delete(`/admissions/bed-reservations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions', 'bed-reservations'] });
    },
  });
}
