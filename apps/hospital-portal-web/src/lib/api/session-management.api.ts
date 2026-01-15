import { getApi } from '../api';

export interface UserSession {
  id: string;
  userId: string;
  deviceId?: string;
  sessionId: string;
  tokenId?: string;
  refreshToken?: string;
  loginTime: string;
  lastActivityTime: string;
  expiresAt: string;
  logoutTime?: string;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  sessionType?: string;
  loginMethod?: string;
  isSuspicious: boolean;
  suspiciousReason?: string;
  securityScore: number;
  status: string;
}

export interface CreateSessionDto {
  deviceId?: string;
  tokenId: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  sessionType: string;
  loginMethod: string;
}

export const sessionManagementApi = {
  // Get active sessions for current user
  getMySessions: async () => {
    return getApi().get<UserSession[]>('/session-management/sessions');
  },

  // Get session by ID
  getById: async (sessionId: string) => {
    return getApi().get<UserSession>(`/session-management/sessions/${sessionId}`);
  },

  // Terminate a specific session
  terminate: async (sessionId: string, reason: string) => {
    return getApi().post(`/session-management/sessions/${sessionId}/terminate`, { reason });
  },

  // Terminate all sessions except current
  terminateAllExceptCurrent: async (exceptSessionId?: string) => {
    return getApi().post('/session-management/sessions/terminate-all-except-current', { exceptSessionId });
  },

  // Refresh session
  refresh: async (sessionId: string) => {
    return getApi().post<UserSession>(`/session-management/sessions/${sessionId}/refresh`, {});
  },

  // Mark session as suspicious
  markSuspicious: async (sessionId: string, reason: string) => {
    return getApi().post(`/session-management/sessions/${sessionId}/mark-suspicious`, { reason });
  },

  // Get active session count
  getActiveCount: async () => {
    return getApi().get<{ activeCount: number; totalCount: number }>('/session-management/sessions/active-count');
  },

  // Cleanup expired sessions (admin only)
  cleanup: async () => {
    return getApi().post('/session-management/sessions/cleanup', {});
  }
};
