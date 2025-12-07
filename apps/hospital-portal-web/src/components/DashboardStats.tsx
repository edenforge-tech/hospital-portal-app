'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';

interface DashboardStatsData {
  totalStaff: number;
  totalDepartments: number;
  totalRoles: number;
  totalBranches: number;
  departmentStats: Array<{ departmentName: string; staffCount: number }>;
  roleStats: Array<{ name: string; userCount: number }>;
  branchStats: Array<{ name: string; staffCount: number }>;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Staff</div>
          <div className="text-2xl font-bold">—</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Departments</div>
          <div className="text-2xl font-bold">—</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Roles</div>
          <div className="text-2xl font-bold">—</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Branches</div>
          <div className="text-2xl font-bold">—</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Total Staff</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalStaff}</div>
        </div>

        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
          <div className="text-sm text-gray-500">Departments</div>
          <div className="text-2xl font-bold text-green-600">{stats.totalDepartments}</div>
        </div>

        <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
          <div className="text-sm text-gray-500">Roles</div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalRoles}</div>
        </div>

        <div className="bg-white p-4 rounded shadow border-l-4 border-orange-500">
          <div className="text-sm text-gray-500">Branches</div>
          <div className="text-2xl font-bold text-orange-600">{stats.totalBranches}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Staff by Department</h3>
          <div className="space-y-3">
            {stats.departmentStats.slice(0, 5).map((dept, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{dept.departmentName}</span>
                  <span className="font-medium text-gray-900">{dept.staffCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(dept.staffCount / stats.totalStaff) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
          <div className="space-y-3">
            {stats.roleStats.slice(0, 5).map((role, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{role.name}</span>
                  <span className="font-medium text-gray-900">{role.userCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(role.userCount / stats.totalStaff) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Distribution */}
      {stats.branchStats.length > 0 && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Staff by Branch</h3>
          <div className="grid grid-cols-3 gap-4">
            {stats.branchStats.map((branch, idx) => (
              <div key={idx} className="border rounded p-4">
                <div className="text-sm text-gray-600">{branch.name}</div>
                <div className="text-2xl font-bold text-indigo-600 mt-2">{branch.staffCount}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {((branch.staffCount / stats.totalStaff) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
