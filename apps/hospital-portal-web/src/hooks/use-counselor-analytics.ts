import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/api';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  period: number;
  totalSessions: number;
  agreedCount: number;
  declinedCount: number;
  undecidedCount: number;
  decisionRate: number;
  conversionRate: number;
  avgDaysToDecision: number;
  bySurgeryType: { surgeryType: string; count: number; agreedCount: number }[];
  bySessionType: { sessionType: string; count: number }[];
  callbackTotal: number;
  callbackCompleted: number;
  callbackCompletionRate: number;
  generatedAt: string;
}

export interface TrendPoint {
  date: string;
  count: number;
  agreedCount: number;
}

export interface AnalyticsTrends {
  period: number;
  trend: TrendPoint[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCounselorAnalytics(branchId?: string | null, period = 30) {
  return useQuery<AnalyticsSummary>({
    queryKey: ['counselor-analytics', branchId, period],
    queryFn: async () => {
      const api = getApi();
      const params = new URLSearchParams({ period: String(period) });
      if (branchId) params.set('branchId', branchId);
      const res = await api.get(`/counseling/analytics/summary?${params}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCounselorAnalyticsTrends(branchId?: string | null, period = 30) {
  return useQuery<AnalyticsTrends>({
    queryKey: ['counselor-analytics-trends', branchId, period],
    queryFn: async () => {
      const api = getApi();
      const params = new URLSearchParams({ period: String(period) });
      if (branchId) params.set('branchId', branchId);
      const res = await api.get(`/counseling/analytics/trends?${params}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
