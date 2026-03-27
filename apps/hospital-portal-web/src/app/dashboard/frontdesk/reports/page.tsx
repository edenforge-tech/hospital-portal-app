'use client';

import OPDReports from '@/components/frontdesk/OPDReports';

export default function OPDReportsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">OPD Reports</h1>
        <p className="text-gray-600 mt-1">
          Daily OPD statistics, patient flow, and revenue reports
        </p>
      </div>
      <OPDReports />
    </div>
  );
}
