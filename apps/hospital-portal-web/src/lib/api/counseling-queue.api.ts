// Counseling Queue API - Module 3
import { getApi } from '../api';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface CounselingQueueItem {
  id: string;
  tenantId: string;
  branchId: string;
  patientId: string;
  patientName?: string;
  mrn?: string;
  age?: number;
  gender?: string;
  tokenNumber: string;
  queuePosition: number;
  priorityScore: number; // 0-100, higher = more urgent
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  queueStatus: 'Waiting' | 'Called' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow';
  
  // Timing information
  addedToQueueAt: string;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedWaitMinutes?: number;
  
  // Referral information
  assignedCounselorId?: string;
  assignedCounselorName?: string;
  referredByUserId?: string;
  referredByUserName?: string;
  referralDepartment?: string;
  referralSource: 'WalkIn' | 'DoctorReferral' | 'OptometryReferral' | 'Scheduled' | 'Emergency';
  referralNotes?: string;
  referralPriority?: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Session information
  sessionId?: string;
  sessionNumber?: string;
  sessionType?: 'Initial' | 'Followup' | 'PreSurgery' | 'PostSurgery' | 'Financial' | 'Insurance' | 'General';
  patientType?: 'Cash' | 'Insurance' | 'CoPay' | 'GovernmentScheme' | 'Corporate';
  
  // Additional context
  chiefComplaint?: string;
  insuranceProvider?: string;
  requiresFinancialCounseling: boolean;
  requiresSurgicalConsent: boolean;
  previousSessionCount?: number;
  lastSessionDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  deletedAt?: string;
  status: string;
}

export interface CounselingQueueStats {
  totalWaiting: number;
  totalCalled: number;
  totalInProgress: number;
  totalCompletedToday: number;
  totalNoShow: number;
  totalCancelled: number;
  averageWaitTimeMinutes: number;
  averageSessionDurationMinutes: number;
  longestWaitMinutes: number;
  byReferralSource: {
    walkIn: number;
    doctorReferral: number;
    optometryReferral: number;
    scheduled: number;
    emergency: number;
  };
  byUrgency: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byPatientType: {
    cash: number;
    insurance: number;
    coPay: number;
    governmentScheme: number;
    corporate: number;
  };
}

export interface CallNextPatientRequest {
  branchId: string;
  counselorId: string;
  queueType?: string;
  specificQueueItemId?: string; // Optional: call specific patient instead of next
}

export interface CallNextPatientResponse {
  success: boolean;
  queueItem?: CounselingQueueItem;
  message?: string;
  tokenNumber?: string;
  estimatedStartTime?: string;
}

export interface AddToQueueRequest {
  tenantId: string;
  branchId: string;
  patientId: string;
  referredByUserId?: string;
  referralSource: 'WalkIn' | 'DoctorReferral' | 'OptometryReferral' | 'Scheduled' | 'Emergency';
  referralNotes?: string;
  referralPriority?: 'Low' | 'Medium' | 'High' | 'Critical';
  sessionType?: 'Initial' | 'Followup' | 'PreSurgery' | 'PostSurgery' | 'Financial' | 'Insurance' | 'General';
  patientType?: 'Cash' | 'Insurance' | 'CoPay' | 'GovernmentScheme' | 'Corporate';
  requiresFinancialCounseling?: boolean;
  requiresSurgicalConsent?: boolean;
  assignedCounselorId?: string;
}

export interface AddToQueueResponse {
  success: boolean;
  queueItem?: CounselingQueueItem;
  tokenNumber?: string;
  queuePosition?: number;
  estimatedWaitMinutes?: number;
  message?: string;
}

export interface StartSessionFromQueueRequest {
  queueItemId: string;
  counselorId: string;
  notes?: string;
}

export interface CompleteQueueSessionRequest {
  queueItemId: string;
  sessionId?: string;
  completionNotes?: string;
}

export interface QueueFilters {
  branchId?: string;
  status?: 'Waiting' | 'Called' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow';
  urgencyLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  referralSource?: 'WalkIn' | 'DoctorReferral' | 'OptometryReferral' | 'Scheduled' | 'Emergency';
  assignedCounselorId?: string;
  fromDate?: string;
  toDate?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get counseling queue for a branch
 * GET /api/counseling/queue
 */
export async function getCounselingQueue(
  branchId: string,
  filters?: QueueFilters
): Promise<CounselingQueueItem[]> {
  try {
    const api = getApi();
    const params: any = { ...filters };

    if (branchId) {
      params.branchId = branchId;
    }

    const response = await api.get('/counseling/queue', { params });

    // Handle different response formats from backend
    const data = response.data?.data || response.data?.Data || response.data;

    let rawItems: any[] = [];

    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data?.queueItems || data?.QueueItems || data?.items || data?.Items) {
      rawItems = data.queueItems || data.QueueItems || data.items || data.Items;
    }

    // Normalize backend DTO fields → frontend CounselingQueueItem interface
    const queueItems: CounselingQueueItem[] = rawItems.map((q: any) => ({
      ...q,
      // Backend 'status' is the raw queue status; map to queueStatus for frontend
      queueStatus: q.queueStatus || q.queueStatus || q.status || 'Waiting',
      // Backend 'counselorId' (from joined session) → assignedCounselorId
      assignedCounselorId: q.assignedCounselorId || q.counselorId || q.CounselorId || undefined,
      assignedCounselorName: q.assignedCounselorName || q.counselorName || q.CounselorName || undefined,
      // Referral source default
      referralSource: q.referralSource || q.ReferralSource || 'DoctorReferral',
      requiresFinancialCounseling: q.requiresFinancialCounseling ?? false,
      requiresSurgicalConsent: q.requiresSurgicalConsent ?? false,
    }));

    console.log(`✅ Queue data loaded from backend: ${queueItems.length} items`, 
      queueItems.map(i => ({ id: i.id, counselorId: i.assignedCounselorId, patient: i.patientName })));

    // Only fall back to mock data when backend returns nothing
    if (queueItems.length === 0) {
      console.warn('⚠️ Backend returned empty queue. Using mock data populated with real patient IDs.');
      return await getMockQueueData();
    }

    return queueItems;
  } catch (error: any) {
    console.error('❌ Error fetching counseling queue:', error);
    console.warn('⚠️ Backend unavailable. Using mock queue data with real patient IDs.');
    return await getMockQueueData();
  }
}

/**
 * Generate mock queue data — tries to use real patient IDs from the backend.
 * Falls back to placeholder UUIDs only when the patient API is also unavailable.
 */
async function getMockQueueData(): Promise<CounselingQueueItem[]> {
  const now = new Date();

  // Read current user from localStorage
  let currentUserId: string | null = null;
  let currentUserName = 'Counselor';
  let mockTenantId = '00000000-0000-0000-0000-000000000001';
  let mockBranchId = '00000000-0000-0000-0000-000000000011';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      currentUserId = user.id || null;
      currentUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || currentUserName;
      if (user.tenantId) mockTenantId = user.tenantId;
      if (user.branchId) mockBranchId = user.branchId;
    }
  } catch (e) {
    console.warn('[Mock Queue] Could not parse user from localStorage');
  }

  // Try to fetch real patient IDs from the backend
  let patientSlots: Array<{ id: string; name: string; mrn: string; age?: number; gender?: string }> = [
    { id: '', name: 'Ramesh Kumar', mrn: 'MRN001234', age: 65, gender: 'Male' },
    { id: '', name: 'Priya Sharma', mrn: 'MRN001235', age: 42, gender: 'Female' },
    { id: '', name: 'Ahmed Khan', mrn: 'MRN001236', age: 58, gender: 'Male' },
  ];

  try {
    const api = getApi();
    const res = await api.get('/patients', { params: { pageSize: 5, pageNumber: 1 } });
    const patients: any[] = res.data?.data || res.data?.Data || res.data?.patients || res.data?.Patients || res.data || [];
    const list = Array.isArray(patients) ? patients : [];
    if (list.length > 0) {
      patientSlots = list.slice(0, 3).map((p: any, i: number) => ({
        id: p.id || '',
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || patientSlots[i]?.name || 'Patient',
        mrn: p.medicalRecordNumber || p.mrn || patientSlots[i]?.mrn || '',
        age: p.age,
        gender: p.gender,
      }));
      console.log('✅ [Mock Queue] Populated with real patient IDs:', patientSlots.map(p => p.id));
    }
  } catch (e) {
    console.warn('[Mock Queue] Could not fetch real patients — queue will show demo data without session creation capability.');
  }

  const configs = [
    { token: 'T-001', sessionType: 'PreSurgery' as const, patientType: 'Insurance' as const, urgency: 'High' as const, priority: 85, waitMin: 25, notes: 'Urgent cataract surgery consent needed', financial: true, consent: true },
    { token: 'T-002', sessionType: 'Financial' as const, patientType: 'Cash' as const, urgency: 'Medium' as const, priority: 55, waitMin: 18, notes: 'Optometry referred for lens selection counseling', financial: true, consent: false },
    { token: 'T-003', sessionType: 'Initial' as const, patientType: 'GovernmentScheme' as const, urgency: 'Low' as const, priority: 30, waitMin: 10, notes: 'Scheduled consultation for government scheme benefits', financial: true, consent: false },
  ];

  return configs.map((cfg, i) => {
    const patient = patientSlots[i] || patientSlots[0];
    return {
      id: `mock-queue-${String(i + 1).padStart(3, '0')}`,
      tenantId: mockTenantId,
      branchId: mockBranchId,
      queuePosition: i + 1,
      tokenNumber: cfg.token,
      patientId: patient.id || `00000000-0000-0000-0000-00000000000${i + 1}`,
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      queueStatus: 'Waiting' as const,
      sessionType: cfg.sessionType,
      patientType: cfg.patientType,
      referralSource: 'DoctorReferral' as const,
      urgencyLevel: cfg.urgency,
      priorityScore: cfg.priority,
      assignedCounselorId: currentUserId || undefined,
      assignedCounselorName: currentUserName,
      addedToQueueAt: new Date(now.getTime() - cfg.waitMin * 60 * 1000).toISOString(),
      estimatedWaitMinutes: cfg.waitMin,
      requiresFinancialCounseling: cfg.financial,
      requiresSurgicalConsent: cfg.consent,
      referralNotes: cfg.notes,
      createdAt: new Date(now.getTime() - cfg.waitMin * 60 * 1000).toISOString(),
      status: 'active',
    };
  });
}

/**
 * Get queue statistics
 * GET /api/counseling/queue/stats
 */
export async function getCounselingQueueStats(
  branchId: string,
  date?: string
): Promise<CounselingQueueStats> {
  try {
    const api = getApi();
    const params: any = {};
    
    // Only add branchId if it's not empty
    if (branchId) {
      params.branchId = branchId;
    }
    if (date) params.date = date;
    
    const response = await api.get('/counseling/queue/stats', { params });
    const stats = response.data?.data || response.data?.Data || response.data;
    
    console.log(`✅ Queue stats loaded from backend`);
    return stats;
  } catch (error: any) {
    console.error('❌ Error fetching queue stats:', error);
    
    // Use mock stats when backend unavailable
    console.warn('⚠️ Using mock queue stats for testing.');
    return getMockQueueStats();
  }
}

/**
 * Generate mock queue stats for development/testing
 */
function getMockQueueStats(): CounselingQueueStats {
  return {
    totalWaiting: 3,
    totalCalled: 0,
    totalInProgress: 0,
    totalCompletedToday: 2,
    totalNoShow: 0,
    totalCancelled: 0,
    averageWaitTimeMinutes: 18,
    averageSessionDurationMinutes: 15,
    longestWaitMinutes: 25,
    byReferralSource: {
      walkIn: 0,
      doctorReferral: 1,
      optometryReferral: 1,
      scheduled: 1,
      emergency: 0,
    },
    byUrgency: {
      low: 1,
      medium: 1,
      high: 1,
      critical: 0,
    },
    byPatientType: {
      cash: 1,
      insurance: 1,
      coPay: 0,
      governmentScheme: 1,
      corporate: 0,
    },
  };
}

/**
 * Get specific queue item details
 * GET /api/counseling/queue/{id}
 */
export async function getCounselingQueueItem(
  queueItemId: string
): Promise<CounselingQueueItem | null> {
  try {
    const api = getApi();
    const response = await api.get(`/counseling/queue/${queueItemId}`);
    return response.data?.data || response.data?.Data || response.data;
  } catch (error: any) {
    console.error('Error fetching queue item:', error);
    
    // Try to find in mock data
    const mockData = await getMockQueueData();
    const mockItem = mockData.find(item => item.id === queueItemId);
    
    if (mockItem) {
      console.warn('⚠️ Using mock queue item data');
      return mockItem;
    }
    
    return null;
  }
}

/**
 * Add patient to counseling queue
 * POST /api/counseling/queue
 */
export async function addToQueue(
  request: AddToQueueRequest
): Promise<AddToQueueResponse> {
  try {
    const api = getApi();
    const response = await api.post('/counseling/queue', request);
    
    const data = response.data?.data || response.data?.Data || response.data;
    
    return {
      success: true,
      queueItem: data.queueItem || data.QueueItem || data,
      tokenNumber: data.tokenNumber || data.TokenNumber,
      queuePosition: data.queuePosition || data.QueuePosition,
      estimatedWaitMinutes: data.estimatedWaitMinutes || data.EstimatedWaitMinutes,
      message: data.message || 'Patient added to queue successfully',
    };
  } catch (error: any) {
    console.error('Error adding to queue:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to add patient to queue',
    };
  }
}

/**
 * Call next patient in queue
 * POST /api/counseling/queue/call-next
 */
export async function callNextPatient(
  request: CallNextPatientRequest
): Promise<CallNextPatientResponse> {
  try {
    const api = getApi();
    const response = await api.post('/counseling/queue/call-next', request);
    
    const data = response.data?.data || response.data?.Data || response.data;
    
    return {
      success: true,
      queueItem: data.queueItem || data.QueueItem || data,
      tokenNumber: data.tokenNumber || data.TokenNumber,
      estimatedStartTime: data.estimatedStartTime || data.EstimatedStartTime,
      message: data.message || 'Patient called successfully',
    };
  } catch (error: any) {
    console.error('Error calling next patient:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to call next patient',
    };
  }
}

/**
 * Start session from queue
 * POST /api/counseling/queue/{id}/start
 */
export async function startSessionFromQueue(
  queueItemId: string,
  request?: StartSessionFromQueueRequest
): Promise<{ success: boolean; sessionId?: string; message?: string }> {
  try {
    const api = getApi();
    const response = await api.post(`/counseling/queue/${queueItemId}/start`, request || {});
    
    const data = response.data?.data || response.data?.Data || response.data;
    
    return {
      success: true,
      sessionId: data.sessionId || data.SessionId,
      message: data.message || 'Session started successfully',
    };
  } catch (error: any) {
    console.error('Error starting session from queue:', error);
    
    // Mock session start for testing without backend
    console.warn('⚠️ Backend unavailable. Using mock session data for testing.');
    const mockSessionId = `mock-session-${Date.now()}`;
    
    return {
      success: true,
      sessionId: mockSessionId,
      message: '🧪 Mock session started (backend unavailable)',
    };
  }
}

/**
 * Complete queue session
 * POST /api/counseling/queue/{id}/complete
 */
export async function completeQueueSession(
  queueItemId: string,
  request?: CompleteQueueSessionRequest
): Promise<{ success: boolean; message?: string }> {
  try {
    const api = getApi();
    const response = await api.post(`/counseling/queue/${queueItemId}/complete`, request || {});
    
    const data = response.data?.data || response.data?.Data || response.data;
    
    return {
      success: true,
      message: data.message || 'Session completed successfully',
    };
  } catch (error: any) {
    console.error('Error completing queue session:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to complete session',
    };
  }
}

/**
 * Remove patient from queue
 * DELETE /api/counseling/queue/{id}
 */
export async function removeFromQueue(
  queueItemId: string,
  reason?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const api = getApi();
    const response = await api.delete(`/counseling/queue/${queueItemId}`, {
      data: { reason },
    });
    
    return {
      success: true,
      message: response.data?.message || 'Patient removed from queue successfully',
    };
  } catch (error: any) {
    console.error('Error removing from queue:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to remove patient from queue',
    };
  }
}

/**
 * Mark patient as No-Show
 * POST /api/counseling/queue/{id}/no-show
 */
export async function markAsNoShow(
  queueItemId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const api = getApi();
    const response = await api.post(`/counseling/queue/${queueItemId}/no-show`);
    
    return {
      success: true,
      message: response.data?.message || 'Patient marked as no-show',
    };
  } catch (error: any) {
    console.error('Error marking as no-show:', error);
    
    // Fallback to updating queue item status
    try {
      const api = getApi();
      await api.put(`/counseling/queue/${queueItemId}`, {
        queueStatus: 'NoShow',
      });
      return {
        success: true,
        message: 'Patient marked as no-show',
      };
    } catch (fallbackError) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to mark as no-show',
      };
    }
  }
}

/**
 * Update queue item priority/urgency
 * PUT /api/counseling/queue/{id}/priority
 */
export async function updateQueuePriority(
  queueItemId: string,
  priorityScore: number,
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical'
): Promise<{ success: boolean; message?: string }> {
  try {
    const api = getApi();
    const response = await api.put(`/counseling/queue/${queueItemId}/priority`, {
      priorityScore,
      urgencyLevel,
    });
    
    return {
      success: true,
      message: response.data?.message || 'Priority updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating priority:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update priority',
    };
  }
}
