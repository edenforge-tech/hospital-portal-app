// Counseling Sessions Hooks - React Query hooks for counseling sessions
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  counselingSessionsApi,
  type CounselingSession,
  type SessionFilters,
  type SessionListResponse,
  type CreateCounselingSessionRequest,
  type UpdateCounselingSessionRequest,
  type SessionNote,
  type CreateSessionNoteRequest,
  type UpdateSessionNoteRequest,
} from '@/lib/api/counseling-sessions.api';
import {
  getCounselingQueue,
  getCounselingQueueStats,
  getCounselingQueueItem,
  addToQueue,
  callNextPatient,
  startSessionFromQueue,
  completeQueueSession,
  removeFromQueue,
  markAsNoShow,
  updateQueuePriority,
  type CounselingQueueItem,
  type CounselingQueueStats,
  type QueueFilters,
  type AddToQueueRequest,
  type CallNextPatientRequest,
  type StartSessionFromQueueRequest,
  type CompleteQueueSessionRequest,
} from '@/lib/api/counseling-queue.api';

// ============================================================================
// Query Keys
// ============================================================================

export const counselingSessionKeys = {
  all: ['counseling-sessions'] as const,
  lists: () => [...counselingSessionKeys.all, 'list'] as const,
  list: (filters?: SessionFilters) => [...counselingSessionKeys.lists(), filters] as const,
  details: () => [...counselingSessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...counselingSessionKeys.details(), id] as const,
  byNumber: (sessionNumber: string) => [...counselingSessionKeys.all, 'by-number', sessionNumber] as const,
  notes: (sessionId: string) => [...counselingSessionKeys.detail(sessionId), 'notes'] as const,
};

// ============================================================================
// Session List Hooks
// ============================================================================

/**
 * Get all counseling sessions with optional filters
 */
export function useCounselingSessions(
  filters?: SessionFilters,
  options?: Omit<UseQueryOptions<SessionListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: counselingSessionKeys.list(filters),
    queryFn: () => counselingSessionsApi.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time)
    ...options,
  });
}

/**
 * Get counseling session by ID
 */
export function useCounselingSession(
  id: string,
  options?: Omit<UseQueryOptions<CounselingSession>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: counselingSessionKeys.detail(id),
    queryFn: () => counselingSessionsApi.getById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time)
    ...options,
  });
}

/**
 * Get counseling session by session number
 */
export function useCounselingSessionByNumber(
  sessionNumber: string,
  options?: Omit<UseQueryOptions<CounselingSession>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: counselingSessionKeys.byNumber(sessionNumber),
    queryFn: () => counselingSessionsApi.getByNumber(sessionNumber),
    enabled: !!sessionNumber,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time)
    ...options,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new counseling session
 */
export function useCreateCounselingSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCounselingSessionRequest) => counselingSessionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.lists() });
    },
  });
}

/**
 * Update counseling session
 */
export function useUpdateCounselingSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCounselingSessionRequest }) =>
      counselingSessionsApi.update(id, data),
    onSuccess: (_, variables) => {
      console.log('✅ Mutation onSuccess called');
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      console.error('❌ Mutation onError called:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
}

/**
 * Start a counseling session
 */
export function useStartCounselingSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => counselingSessionsApi.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.detail(id) });
    },
  });
}

/**
 * Complete a counseling session
 */
export function useCompleteCounselingSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => counselingSessionsApi.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.detail(id) });
    },
  });
}

/**
 * Cancel a counseling session
 */
export function useCancelCounselingSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      counselingSessionsApi.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.detail(variables.id) });
    },
  });
}

/**
 * Delete a counseling session
 */
export function useDeleteCounselingSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => counselingSessionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.lists() });
    },
  });
}

/**
 * Upload audio recording for a session
 */
export function useUploadSessionAudio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      sessionId, 
      audioBlob, 
      fileName 
    }: { 
      sessionId: string; 
      audioBlob: Blob; 
      fileName: string 
    }) => counselingSessionsApi.uploadAudio(sessionId, audioBlob, fileName),
    onSuccess: (_, variables) => {
      // Invalidate session details to refresh documents list
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.detail(variables.sessionId) });
    },
  });
}

// ============================================================================
// Session Notes Hooks
// ============================================================================

/**
 * Get session notes
 */
export function useSessionNotes(
  sessionId: string,
  options?: Omit<UseQueryOptions<SessionNote[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: counselingSessionKeys.notes(sessionId),
    queryFn: () => counselingSessionsApi.getSessionNotes(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Create session note
 */
export function useCreateSessionNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSessionNoteRequest) => counselingSessionsApi.createSessionNote(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.notes(variables.sessionId) });
    },
  });
}

/**
 * Update session note
 */
export function useUpdateSessionNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, sessionId, data }: { noteId: string; sessionId: string; data: UpdateSessionNoteRequest }) =>
      counselingSessionsApi.updateSessionNote(noteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.notes(variables.sessionId) });
    },
  });
}

/**
 * Delete session note
 */
export function useDeleteSessionNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, sessionId }: { noteId: string; sessionId: string }) =>
      counselingSessionsApi.deleteSessionNote(noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.notes(variables.sessionId) });
    },
  });
}

// ============================================================================
// Computed Data Hooks
// ============================================================================

/**
 * Get today's counseling sessions
 */
export function useTodaySessions() {
  const today = new Date().toISOString().split('T')[0];
  
  return useCounselingSessions({
    startDate: today,
    endDate: today,
    pageSize: 100,
  });
}

/**
 * Calculate counseling session statistics
 */
export function useCounselingSessionStats() {
  const { data: sessionsResponse, isLoading, error } = useTodaySessions();
  
  // Backend returns lowercase 'sessions' property
  const sessions = sessionsResponse?.sessions || sessionsResponse?.data || [];
  
  const stats = {
    todaySessions: sessions.length,
    scheduled: sessions.filter(s => s.sessionStatus === 'Scheduled' || s.status === 'Scheduled').length,
    inProgress: sessions.filter(s => s.sessionStatus === 'InProgress' || s.status === 'InProgress').length,
    completed: sessions.filter(s => s.sessionStatus === 'Completed' || s.status === 'Completed').length,
    noShow: sessions.filter(s => s.sessionStatus === 'NoShow' || s.status === 'NoShow').length,
    cancelled: sessions.filter(s => s.sessionStatus === 'Cancelled' || s.status === 'Cancelled').length,
    agreedToSurgery: sessions.filter(s => s.agreedToSurgery === true).length,
    pendingConsents: sessions.filter(s => !s.consentFormsSigned).length,
    pendingFinancial: sessions.filter(s => !s.financialClearanceObtained).length,
    avgSessionDuration: sessions.length > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + (s.sessionDurationMinutes || 0), 0) / sessions.length)
      : 0,
  };
  
  return { stats, isLoading, error };
}

// ============================================================================
// Queue Management Hooks
// ============================================================================

// Queue Query Keys
export const counselingQueueKeys = {
  all: ['counseling-queue'] as const,
  lists: () => [...counselingQueueKeys.all, 'list'] as const,
  list: (branchId: string, filters?: any) => [...counselingQueueKeys.lists(), branchId, filters] as const,
  stats: (branchId: string, date?: string) => [...counselingQueueKeys.all, 'stats', branchId, date] as const,
  detail: (id: string) => [...counselingQueueKeys.all, 'detail', id] as const,
};

/**
 * Get counseling queue for a branch
 * Auto-refreshes every 10 seconds for real-time updates
 */
export function useCounselingQueue(
  branchId: string,
  filters?: QueueFilters,
  options?: Omit<UseQueryOptions<CounselingQueueItem[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: counselingQueueKeys.list(branchId, filters),
    queryFn: () => getCounselingQueue(branchId, filters),
    enabled: true, // Always enabled - backend handles empty branchId by returning all items
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Auto-refresh every 10 seconds
    gcTime: 30 * 1000, // 30 seconds (garbage collection time)
    ...options,
  });
}

/**
 * Get queue statistics
 */
export function useCounselingQueueStats(
  branchId: string,
  date?: string,
  options?: Omit<UseQueryOptions<CounselingQueueStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: counselingQueueKeys.stats(branchId, date),
    queryFn: () => getCounselingQueueStats(branchId, date),
    enabled: true, // Always enabled - backend handles empty branchId
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    ...options,
  });
}

/**
 * Get specific queue item
 */
export function useCounselingQueueItem(
  queueItemId: string,
  options?: Omit<UseQueryOptions<CounselingQueueItem | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: counselingQueueKeys.detail(queueItemId),
    queryFn: () => getCounselingQueueItem(queueItemId),
    enabled: !!queueItemId,
    staleTime: 5 * 1000, // 5 seconds
    ...options,
  });
}

/**
 * Add patient to queue
 */
export function useAddToQueue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: AddToQueueRequest) => addToQueue(request),
    onSuccess: (_, variables) => {
      // Invalidate queue lists for the branch
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.stats(variables.branchId) });
    },
  });
}

/**
 * Call next patient in queue
 */
export function useCallNextPatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CallNextPatientRequest) => callNextPatient(request),
    onSuccess: (_, variables) => {
      // Invalidate queue lists for the branch
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.stats(variables.branchId) });
    },
  });
}

/**
 * Start session from queue
 */
export function useStartQueueSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ queueItemId, request }: { queueItemId: string; request?: StartSessionFromQueueRequest }) =>
      startSessionFromQueue(queueItemId, request),
    onSuccess: (_, variables) => {
      // Invalidate queue lists and queue item detail
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.detail(variables.queueItemId) });
      // Also invalidate session lists as a new session is created
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.lists() });
    },
  });
}

/**
 * Complete queue session
 */
export function useCompleteQueueSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ queueItemId, request }: { queueItemId: string; request?: CompleteQueueSessionRequest }) =>
      completeQueueSession(queueItemId, request),
    onSuccess: (_, variables) => {
      // Invalidate queue lists and queue item detail
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.detail(variables.queueItemId) });
      queryClient.invalidateQueries({ queryKey: counselingSessionKeys.lists() });
    },
  });
}

/**
 * Remove patient from queue
 */
export function useRemoveFromQueue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ queueItemId, reason }: { queueItemId: string; reason?: string }) =>
      removeFromQueue(queueItemId, reason),
    onSuccess: () => {
      // Invalidate all queue lists
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.lists() });
    },
  });
}

/**
 * Mark patient as no-show
 */
export function useMarkAsNoShow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (queueItemId: string) => markAsNoShow(queueItemId),
    onSuccess: () => {
      // Invalidate all queue lists
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.lists() });
    },
  });
}

/**
 * Update queue priority
 */
export function useUpdateQueuePriority() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      queueItemId, 
      priorityScore, 
      urgencyLevel 
    }: { 
      queueItemId: string; 
      priorityScore: number; 
      urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical' 
    }) => updateQueuePriority(queueItemId, priorityScore, urgencyLevel),
    onSuccess: (_, variables) => {
      // Invalidate queue lists and specific item
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingQueueKeys.detail(variables.queueItemId) });
    },
  });
}
