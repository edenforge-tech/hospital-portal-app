import { getApi } from '../api';

// Interfaces
export interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  departmentId: string;
  departmentName: string;
  requestedAccessLevel: string;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerName?: string;
  reviewerComments?: string;
  expiresAt?: string;
}

export interface ApprovalStats {
  totalRequests: number;
  pendingApprovals: number;
  approvedToday: number;
  rejectedToday: number;
  myPendingRequests: number;
}

/**
 * Approvals API Client
 * Manages department access approval workflows
 */
export const approvalsApi = {
  /**
   * Get pending approval requests that current user can approve
   */
  async getPendingApprovals(): Promise<{ data: AccessRequest[] }> {
    return getApi().get('/department-access/pending-approvals');
  },

  /**
   * Get current user's access requests
   */
  async getMyRequests(): Promise<{ data: AccessRequest[] }> {
    return getApi().get('/department-access/my-requests');
  },

  /**
   * Request department access
   */
  async requestAccess(data: {
    departmentId: string;
    requestedAccessLevel: string;
    justification: string;
    expiresAt?: string;
  }): Promise<{ data: AccessRequest }> {
    return getApi().post('/department-access/request', data);
  },

  /**
   * Approve access request
   */
  async approve(requestId: string, comments?: string): Promise<{ data: AccessRequest }> {
    return getApi().post(`/department-access/${requestId}/approve`, { notes: comments });
  },

  /**
   * Reject access request
   */
  async reject(requestId: string, reason: string): Promise<{ data: AccessRequest }> {
    return getApi().post(`/department-access/${requestId}/reject`, { reason });
  },

  /**
   * Cancel own access request
   */
  async cancel(requestId: string): Promise<{ data: AccessRequest }> {
    return getApi().post(`/department-access/${requestId}/cancel`, {});
  },

  /**
   * Get approval statistics
   */
  async getStats(): Promise<{ data: ApprovalStats }> {
    return getApi().get('/department-access/stats');
  }
};
