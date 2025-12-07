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
    return getApi().get<UserSession[]>('/session-management/my-sessions');
  },

  // Get all sessions for a specific user (admin)
  getUserSessions: async (userId: string) => {
    return getApi().get<UserSession[]>(`/session-management/user/${userId}/sessions`);
  },

  // Terminate a specific session
  terminate: async (sessionId: string, reason: string) => {
    return getApi().post(`/session-management/${sessionId}/terminate`, { reason });
  },

  // Terminate all sessions except current
  terminateAllExceptCurrent: async (currentSessionId: string) => {
    return getApi().post('/session-management/terminate-all-except', { currentSessionId });
  },

  // Refresh session
  refresh: async (sessionId: string) => {
    return getApi().post<UserSession>(`/session-management/${sessionId}/refresh`, {});
  },

  // Mark session as suspicious
  markSuspicious: async (sessionId: string, reason: string) => {
    return getApi().post(`/session-management/${sessionId}/mark-suspicious`, { reason });
  },

  // Get session details
  getById: async (sessionId: string) => {
    return getApi().get<UserSession>(`/session-management/${sessionId}`);
  }
};
