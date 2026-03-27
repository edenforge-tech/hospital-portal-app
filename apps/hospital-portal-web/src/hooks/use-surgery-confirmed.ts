/**
 * Hook: use-surgery-confirmed
 * Fetches patients with confirmed/booked OT schedules for the Surgery Confirmed tab.
 */

import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export interface SurgeryConfirmedPatient {
  // OT Schedule
  scheduleId: string;
  otStatus: string; // Booked | Confirmed | InProgress
  surgeryDate: string;
  surgeryTimeSlot?: string;
  theatreId?: string;
  theatreName?: string;
  surgeonId?: string;
  surgeonName?: string;
  surgeryType?: string;
  eye?: string;
  // Patient
  patientId: string;
  patientName: string;
  mrn: string;
  patientPhone?: string;
  age?: number;
  gender?: string;
  // Session
  sessionId?: string;
  branchId?: string;
  patientType?: string;
  packageAmount?: number;
  recommendedProcedures?: any[];
  // IOL
  iolModel?: string;
  iolCatalogId?: string;
  // Pre-admission checklist (partially filled from APIs)
  preAdmissionChecklist: PreAdmissionChecklist;
  // Days to surgery
  daysToSurgery: number;
}

export interface PreAdmissionChecklist {
  financialCleared: boolean;
  consentSigned: boolean;
  preOpTestsDone: boolean;
  otSlotConfirmed: boolean;
  bedReserved: boolean | null; // null = not applicable (day-care)
  preOpMedsPrescribed: boolean;
  patientInstructed: boolean;
  inventoryConfirmed: boolean;
}

export function useSurgeryConfirmed(branchId?: string, dateFilter?: 'today' | 'week' | 'upcoming' | 'all') {
  const { tenantId } = useAuthStore();

  return useQuery<SurgeryConfirmedPatient[]>({
    queryKey: ['surgery-confirmed', branchId, dateFilter],
    enabled: !!tenantId,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const api = getApi();

      // Fetch OT schedules with Booked or Confirmed status
      const params: Record<string, string> = { statuses: 'Booked,Confirmed' };
      if (branchId) params.branchId = branchId;

      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.dateFrom = today;
        params.dateTo = today;
      } else if (dateFilter === 'week') {
        const today = new Date();
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        params.dateFrom = today.toISOString().split('T')[0];
        params.dateTo = weekEnd.toISOString().split('T')[0];
      } else if (dateFilter === 'upcoming') {
        params.dateFrom = new Date().toISOString().split('T')[0];
      }

      const res = await api.get('/otbooking/schedules', { params });
      const schedules: any[] = Array.isArray(res.data)
        ? res.data
        : res.data?.schedules ?? res.data?.data ?? res.data?.items ?? [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return schedules.map((s: any) => {
        const surgDate = new Date(s.scheduledDate || s.surgeryDate);
        surgDate.setHours(0, 0, 0, 0);
        const daysToSurgery = Math.ceil((surgDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          scheduleId: s.id,
          otStatus: s.status,
          surgeryDate: s.scheduledDate || s.surgeryDate,
          surgeryTimeSlot: s.timeSlot || s.surgeryTime || s.startTime,
          theatreId: s.theaterId || s.otTheaterId,
          theatreName: s.theaterName || s.theatreName,
          surgeonId: s.surgeonId,
          surgeonName: s.surgeonName,
          surgeryType: s.surgeryType || s.procedureType,
          eye: s.eyeOperated || s.eye,
          patientId: s.patientId,
          patientName: s.patientName || 'Unknown Patient',
          mrn: s.mrn || s.patientMrn || '',
          patientPhone: s.patientPhone,
          age: s.age,
          gender: s.gender,
          sessionId: s.sessionId || s.counselingSessionId,
          branchId: s.branchId,
          patientType: s.patientType,
          packageAmount: s.packageAmount,
          recommendedProcedures: s.recommendedProcedures
            ? (typeof s.recommendedProcedures === 'string' ? JSON.parse(s.recommendedProcedures) : s.recommendedProcedures)
            : undefined,
          iolModel: s.iolModel || s.iolModelName,
          iolCatalogId: s.iolCatalogId,
          daysToSurgery,
          preAdmissionChecklist: {
            financialCleared: s.financialCleared ?? false,
            consentSigned: s.consentSigned ?? false,
            preOpTestsDone: s.preOpTestsDone ?? false,
            otSlotConfirmed: s.status === 'Confirmed' || s.status === 'Booked',
            bedReserved: s.admissionType === 'DayCare' ? null : (s.bedReserved ?? false),
            preOpMedsPrescribed: s.preOpMedsPrescribed ?? false,
            patientInstructed: s.patientInstructed ?? false,
            inventoryConfirmed: s.inventoryConfirmed ?? false,
          },
        };
      });
    },
  });
}
