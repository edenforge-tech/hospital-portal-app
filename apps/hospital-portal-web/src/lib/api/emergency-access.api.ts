import { getApi } from '../api';

export interface EmergencyAccess {
  id: string;
  userId: string;
  accessCode?: string;
  reason: string;
  emergencyType?: string;
  patientId?: string;
  grantedPermissions?: string;
  scope: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  autoRevokeEnabled: boolean;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;
  status: 'pending' | 'approved' | 'active' | 'expired' | 'revoked' | 'rejected';
  isActive: boolean;
}

export interface RequestEmergencyAccessDto {
  reason: string;
  emergencyType: string;
  patientId?: string;
  durationMinutes: number;
  grantedPermissions: string[];
  scope?: string;
}

export interface ApproveEmergencyAccessDto {
  notes?: string;
}

export interface RejectEmergencyAccessDto {
  reason: string;
}

export const emergencyAccessApi = {
  // Request emergency access
  request: async (data: RequestEmergencyAccessDto) => {
    return getApi().post<EmergencyAccess>('/emergency-access/request', data);
  },

  // Get my emergency access requests
  getMyRequests: async () => {
    return getApi().get<EmergencyAccess[]>('/emergency-access/my-requests');
  },

  // Get pending approvals (for approvers)
  getPendingApprovals: async () => {
    return getApi().get<EmergencyAccess[]>('/emergency-access/pending-approvals');
  },

  // Get active emergency access
  getActive: async (userId?: string) => {
    const url = userId 
      ? `/emergency-access/active?userId=${userId}`
      : '/emergency-access/active';
    return getApi().get<EmergencyAccess[]>(url);
  },

  // Approve emergency access
  approve: async (id: string, data: ApproveEmergencyAccessDto) => {
    return getApi().post<EmergencyAccess>(`/emergency-access/${id}/approve`, data);
  },

  // Reject emergency access
  reject: async (id: string, data: RejectEmergencyAccessDto) => {
    return getApi().post<EmergencyAccess>(`/emergency-access/${id}/reject`, data);
  },

  // Revoke emergency access
  revoke: async (id: string, reason: string) => {
    return getApi().post(`/emergency-access/${id}/revoke`, { reason });
  },

  // Get emergency access by ID
  getById: async (id: string) => {
    return getApi().get<EmergencyAccess>(`/emergency-access/${id}`);
  },

  // Get emergency access history
  getHistory: async (userId?: string) => {
    const url = userId
      ? `/emergency-access/history?userId=${userId}`
      : '/emergency-access/history';
    return getApi().get<EmergencyAccess[]>(url);
  }
};
