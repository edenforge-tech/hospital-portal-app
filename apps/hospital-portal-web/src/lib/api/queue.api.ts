// Queue Management API - Front Office Module
import { getApi } from '../api';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface QueueItem {
  id: string;
  tenantId: string;
  branchId: string;
  departmentId?: string;
  patientId: string;
  patientName?: string; // Joined from patient table
  patientMRN?: string; // Joined from patient table
  patientPhone?: string; // Joined from patient table
  appointmentId?: string;
  visitId?: string;
  tokenNumber: string; // e.g. "T001", "T002"
  queueType: 'Doctor' | 'Optometry' | 'Billing' | 'Pharmacy' | 'Counselor';
  status: 'waiting' | 'called' | 'in-progress' | 'completed' | 'absent';
  priority: 'normal' | 'emergency' | 'follow-up';
  checkedInAt: string;
  calledAt?: string;
  completedAt?: string;
  doctorName?: string;
  roomNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  queueType: string;
  totalWaiting: number;
  totalCalled: number;
  totalCompleted: number;
  averageWaitTime?: number;
  currentToken?: string;
}

export interface AllQueuesResponse {
  queues?: QueueStats[];
  Queues?: QueueStats[];
  items?: QueueItem[];
  Items?: QueueItem[];
  totalCount?: number;
  TotalCount?: number;
}

export interface QueueDisplayData {
  currentToken?: string;
  waitingCount: number;
  recentlyCalled?: QueueItem[];
  queueType: string;
}

export interface CallPatientRequest {
  roomNumber?: string;
  doctorName?: string;
}

export interface TransferQueueRequest {
  newQueueType: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all queues with stats for a branch
 */
export async function getAllQueues(branchId: string): Promise<AllQueuesResponse> {
  const api = getApi();
  const response = await api.get<AllQueuesResponse>(`/queue/all?branchId=${branchId}`);
  return response.data;
}

/**
 * Get queue display data for a specific queue type
 */
export async function getQueueDisplay(
  branchId?: string,
  departmentId?: string,
  queueType?: string
): Promise<QueueDisplayData> {
  const api = getApi();
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (departmentId) params.append('departmentId', departmentId);
  if (queueType) params.append('queueType', queueType);
  
  const response = await api.get<QueueDisplayData>(`/queue/display?${params.toString()}`);
  return response.data;
}

/**
 * Call a patient from the queue
 */
export async function callPatient(
  queueItemId: string,
  request: CallPatientRequest
): Promise<QueueItem> {
  const api = getApi();
  const response = await api.post<{ queueItem: QueueItem }>(
    `/queue/${queueItemId}/call`,
    request
  );
  return response.data.queueItem;
}

/**
 * Mark patient as absent (no-show)
 */
export async function markPatientAbsent(queueItemId: string): Promise<void> {
  const api = getApi();
  await api.post(`/queue/${queueItemId}/mark-absent`);
}

/**
 * Transfer patient to another queue
 */
export async function transferQueue(
  queueItemId: string,
  request: TransferQueueRequest
): Promise<QueueItem> {
  const api = getApi();
  const response = await api.post<{ queueItem: QueueItem }>(
    `/queue/${queueItemId}/transfer`,
    request
  );
  return response.data.queueItem;
}

// Export as default object for easier imports
export const queueApi = {
  getAllQueues,
  getQueueDisplay,
  callPatient,
  markPatientAbsent,
  transferQueue,
};

export default queueApi;
