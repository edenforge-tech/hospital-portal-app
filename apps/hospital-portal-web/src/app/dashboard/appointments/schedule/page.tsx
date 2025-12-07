'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DoctorScheduleView from '@/components/appointments/DoctorScheduleView';

export default function DoctorSchedulePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  useEffect(() => {
    if (user) {
      // If user is a doctor, show their own schedule
      // Otherwise, allow selecting a doctor
      if (user.userType === 'doctor' || user.userType === 'Doctor') {
        setSelectedDoctorId(user.id);
      }
    }
  }, [user]);

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

  // If user is not a doctor and no doctor is selected, show doctor selection
  if ((user.userType !== 'doctor' && user.userType !== 'Doctor') && !selectedDoctorId) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Doctor Schedule</h1>
            <p className="text-gray-600 mb-8">Select a doctor to view their schedule</p>

            {/* Doctor selection will be implemented here */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                Doctor selection interface will be implemented here.
                For now, please navigate to the appointments calendar to view schedules.
              </p>
              <button
                onClick={() => router.push('/dashboard/appointments')}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Go to Appointments Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Schedule</h1>
          <p className="text-gray-600 mt-2">
            {user.userType === 'doctor' || user.userType === 'Doctor'
              ? 'View and manage your appointments'
              : 'View doctor schedules and appointments'
            }
          </p>
        </div>

        <DoctorScheduleView doctorId={selectedDoctorId} />
      </div>
    </div>
  );
}