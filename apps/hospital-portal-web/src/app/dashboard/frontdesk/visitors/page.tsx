'use client';

import VisitorManagement from '@/components/frontdesk/VisitorManagement';

export default function VisitorManagementPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
        <p className="text-gray-600 mt-1">
          Check-in and track hospital visitors for IPD patients
        </p>
      </div>
      <VisitorManagement />
    </div>
  );
}
