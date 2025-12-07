'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { sessionManagementApi, UserSession } from '@/lib/api/session-management.api';
import { Monitor, Smartphone, MapPin, Clock, Activity, AlertTriangle, LogOut } from 'lucide-react';

export default function SessionsPage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionManagementApi.getMySessions();
      setSessions(response.data || []);
    } catch (err: any) {
      console.error('Error loading sessions:', err);
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this session?')) return;

    try {
      setError(null);
      setSuccess(null);
      await sessionManagementApi.terminate(sessionId, 'User-initiated termination');
      setSuccess('Session terminated successfully');
      await loadSessions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to terminate session');
    }
  };

  const handleTerminateAll = async () => {
    if (!confirm('Are you sure you want to terminate all other sessions? This will log you out from all other devices.')) return;

    try {
      setError(null);
      setSuccess(null);
      // Get current session ID from token or use first active session
      const currentSession = sessions.find(s => s.isActive);
      if (currentSession) {
        await sessionManagementApi.terminateAllExceptCurrent(currentSession.id);
        setSuccess('All other sessions terminated successfully');
        await loadSessions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to terminate sessions');
    }
  };

  const getDeviceIcon = (sessionType?: string) => {
    switch (sessionType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="text-blue-600" size={20} />;
      default:
        return <Monitor className="text-gray-600" size={20} />;
    }
  };

  const getSecurityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeSessions = sessions.filter(s => s.isActive);
  const inactiveSessions = sessions.filter(s => !s.isActive);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Sessions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your active login sessions across devices
          </p>
        </div>
        {activeSessions.length > 1 && (
          <button
            onClick={handleTerminateAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center space-x-2"
          >
            <LogOut size={18} />
            <span>Terminate All Others</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Active Sessions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions ({activeSessions.length})</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                session.isSuspicious ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(session.sessionType)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {session.sessionType || 'Unknown'} Session
                    </h3>
                    <p className="text-xs text-gray-500">{session.loginMethod}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-1">
                    <Activity className={getSecurityColor(session.securityScore)} size={16} />
                    <span className={`text-sm font-medium ${getSecurityColor(session.securityScore)}`}>
                      {session.securityScore}/100
                    </span>
                  </div>
                  {session.isSuspicious && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                      <AlertTriangle size={12} className="mr-1" />
                      Suspicious
                    </span>
                  )}
                </div>
              </div>

              {/* Session Info */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {session.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>{session.location}</span>
                  </div>
                )}
                {session.ipAddress && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">IP: {session.ipAddress}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>Started: {new Date(session.loginTime).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Last activity: {new Date(session.lastActivityTime).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Expires: {new Date(session.expiresAt).toLocaleString()}
                </div>
              </div>

              {/* Suspicious Reason */}
              {session.isSuspicious && session.suspiciousReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <p className="font-semibold">Suspicious Activity Detected</p>
                  <p className="text-xs mt-1">{session.suspiciousReason}</p>
                </div>
              )}

              {/* Actions */}
              <button
                onClick={() => handleTerminate(session.id)}
                className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
              >
                Terminate Session
              </button>
            </div>
          ))}
        </div>

        {activeSessions.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any active sessions at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      {inactiveSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Login Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logout Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inactiveSessions.slice(0, 10).map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getDeviceIcon(session.sessionType)}
                        <span className="ml-2 text-sm text-gray-900">{session.sessionType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.location || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.loginTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.logoutTime ? new Date(session.logoutTime).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
