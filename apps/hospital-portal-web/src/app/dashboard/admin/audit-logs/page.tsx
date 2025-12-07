'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Auth is handled by dashboard layout
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">Track all system activities and changes</p>
        </div>

        {/* Placeholder Card */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Audit Log Viewer
            </h2>
            <p className="text-gray-600 mb-6">
              Comprehensive audit trail interface coming soon in Phase 4
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-orange-900 mb-3">Planned Features:</h3>
              <ul className="space-y-2 text-orange-800">
                <li>• Real-time activity log streaming</li>
                <li>• Advanced search and filtering</li>
                <li>• User activity timeline</li>
                <li>• Export logs to CSV/PDF</li>
                <li>• Suspicious activity alerts</li>
                <li>• Compliance reporting</li>
              </ul>
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>✅ Backend Ready:</strong> Audit logs are being captured for all activities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
