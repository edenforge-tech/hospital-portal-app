'use client';

import { useState, useEffect } from 'react';
import { userDepartmentAccessApi, DepartmentAccessDto } from '@/lib/api/user-department-access.api';
import { useAuthStore } from '@/lib/auth-store';

/**
 * Returns the current user's primary department code and all their departments.
 * Used to pass `currentUserDeptCode` to PreOpTab so the Respond button appears
 * for the correct department staff.
 */
export function useUserDepartment(): {
  primaryDeptCode: string | undefined;
  departments: DepartmentAccessDto[];
  loading: boolean;
} {
  const { user } = useAuthStore();
  const [departments, setDepartments] = useState<DepartmentAccessDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    userDepartmentAccessApi
      .getUserDepartments(user.id)
      .then((depts) => setDepartments(depts ?? []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const primary = departments.find((d) => d.isPrimary) ?? departments[0];

  return {
    primaryDeptCode: primary?.departmentCode,
    departments,
    loading,
  };
}
