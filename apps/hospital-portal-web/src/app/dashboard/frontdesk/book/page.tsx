'use client';

import { useRouter } from 'next/navigation';
import UnifiedAppointmentBooking from '@/components/appointments/UnifiedAppointmentBooking';

export default function FrontDeskBookingPage() {
  const router = useRouter();

  return (
    <UnifiedAppointmentBooking
      onClose={() => router.back()}
      onSuccess={() => router.push('/dashboard/appointments')}
    />
  );
}
