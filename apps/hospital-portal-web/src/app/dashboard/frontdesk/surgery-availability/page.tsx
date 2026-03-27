'use client';

import SurgeryAvailabilityCheck from '@/components/frontdesk/SurgeryAvailabilityCheck';

export default function SurgeryAvailabilityPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Surgery Availability</h1>
        <p className="text-gray-600 mt-1">
          Check operating theater schedule and availability for surgery bookings
        </p>
      </div>
      <SurgeryAvailabilityCheck />
    </div>
  );
}
