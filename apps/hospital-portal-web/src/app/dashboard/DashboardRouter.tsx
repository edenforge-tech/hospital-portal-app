'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

// Role to dashboard mapping (HIPAA-compliant role segregation)
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  // Admin & IT
  'Admin': '/dashboard/admin/overview',
  'IT Administrator': '/dashboard/admin/overview',
  
  // Clinical Staff
  'Doctor': '/dashboard/clinical',
  'Consultant': '/dashboard/clinical',
  'Junior Doctor': '/dashboard/clinical',
  'Nurse': '/dashboard/clinical',
  'Nurse Manager': '/dashboard/clinical',
  
  // Front Desk
  'Receptionist': '/dashboard/frontdesk',
  'Counsellor': '/dashboard/frontdesk',
  
  // Pharmacy
  'Pharmacist': '/dashboard/pharmacy',
  'Pharmacy Manager': '/dashboard/pharmacy',
  
  // Laboratory
  'Lab Technician': '/dashboard/lab',
  'Lab Manager': '/dashboard/lab',
  
  // Billing
  'Billing Clerk': '/dashboard/billing',
  
  // Medical Records (admin access)
  'Medical Records Officer': '/dashboard/admin/overview',
  
  // Support Staff
  'Housekeeping Supervisor': '/dashboard/support',
  'Maintenance Technician': '/dashboard/support',
};

export function DashboardRouter() {
  const router = useRouter();
  const { roles } = useAuthStore();

  useEffect(() => {
    if (roles && roles.length > 0) {
      // Get primary role (first assigned role)
      const primaryRole = roles[0];
      const targetDashboard = ROLE_DASHBOARD_MAP[primaryRole];
      
      if (targetDashboard) {
        console.log(`🎯 Redirecting ${primaryRole} to ${targetDashboard}`);
        router.replace(targetDashboard);
      } else {
        // Default fallback: if role not mapped, go to frontdesk
        console.warn(`⚠️ Role "${primaryRole}" not mapped, defaulting to frontdesk`);
        router.replace('/dashboard/frontdesk');
      }
    } else {
      // No roles assigned, default to frontdesk
      console.warn('⚠️ No roles found, defaulting to frontdesk');
      router.replace('/dashboard/frontdesk');
    }
  }, [roles, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );
}
