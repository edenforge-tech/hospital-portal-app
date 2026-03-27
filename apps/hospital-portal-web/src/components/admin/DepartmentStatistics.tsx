'use client';

import React from 'react';
import { 
  Building2, 
  Users, 
  GitBranch, 
  Activity, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Layers
} from 'lucide-react';

interface Department {
  id: string;
  departmentName: string;
  departmentCode: string;
  departmentType: string;
  status: string;
  staffCount?: number;
  parentDepartmentId?: string;
  subDepartments?: Department[];
}

interface DepartmentStatisticsProps {
  departments: Department[];
  standardDepartments: Department[];
  subDepartmentsMap: Map<string, Department[]>;
}

export function DepartmentStatistics({ 
  departments, 
  standardDepartments,
  subDepartmentsMap 
}: DepartmentStatisticsProps) {
  // Calculate statistics
  const totalDepartments = departments.length;
  const totalStandard = standardDepartments.length;
  const totalSubDepartments = departments.filter(d => d.parentDepartmentId).length;
  const activeDepartments = departments.filter(d => d.status === 'active').length;
  const inactiveDepartments = departments.filter(d => d.status !== 'active').length;
  const totalStaff = departments.reduce((sum, d) => sum + (d.staffCount || 0), 0);
  const avgStaffPerDept = totalDepartments > 0 ? Math.round(totalStaff / totalDepartments) : 0;

  // Department types distribution
  const typeDistribution = departments.reduce((acc, dept) => {
    const type = dept.departmentType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find departments with most staff
  const topDepartments = [...departments]
    .filter(d => d.staffCount && d.staffCount > 0)
    .sort((a, b) => (b.staffCount || 0) - (a.staffCount || 0))
    .slice(0, 5);

  // Find departments with most sub-departments
  const deptWithMostSubs = standardDepartments
    .map(d => ({
      ...d,
      subCount: subDepartmentsMap.get(d.id)?.length || 0
    }))
    .sort((a, b) => b.subCount - a.subCount)
    .slice(0, 5);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Clinical': 'bg-blue-100 text-blue-800',
      'Administrative': 'bg-purple-100 text-purple-800',
      'Support': 'bg-yellow-100 text-yellow-800',
      'Diagnostic': 'bg-cyan-100 text-cyan-800',
      'Therapeutic': 'bg-green-100 text-green-800',
      'Emergency': 'bg-red-100 text-red-800',
      'Surgical': 'bg-orange-100 text-orange-800',
      'Medical': 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-900">Total Departments</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalDepartments}</div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <span className="text-sm text-indigo-900">Standard</span>
          </div>
          <div className="text-2xl font-bold text-indigo-900">{totalStandard}</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-900">Sub-Departments</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{totalSubDepartments}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-900">Active</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{activeDepartments}</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-orange-900">Total Staff</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{totalStaff}</div>
        </div>

        <div className="bg-cyan-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-cyan-600" />
            <span className="text-sm text-cyan-900">Avg Staff/Dept</span>
          </div>
          <div className="text-2xl font-bold text-cyan-900">{avgStaffPerDept}</div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Type Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-4">By Department Type</h3>
          <div className="space-y-2">
            {Object.entries(typeDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(type)}`}>{type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / totalDepartments) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Departments by Staff */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Top Departments by Staff</h3>
          <div className="space-y-3">
            {topDepartments.length > 0 ? (
              topDepartments.map((dept, idx) => (
                <div key={dept.id} className="flex items-center gap-3">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx === 0 ? 'bg-yellow-100 text-yellow-800' : 
                      idx === 1 ? 'bg-gray-200 text-gray-800' :
                      idx === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'}
                  `}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{dept.departmentName}</div>
                    <div className="text-xs text-gray-500">{dept.departmentCode}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">{dept.staffCount}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No staff data available</div>
            )}
          </div>
        </div>

        {/* Departments with Most Sub-Departments */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Hierarchy Depth</h3>
          <div className="space-y-3">
            {deptWithMostSubs.filter(d => d.subCount > 0).length > 0 ? (
              deptWithMostSubs
                .filter(d => d.subCount > 0)
                .map((dept, idx) => (
                  <div key={dept.id} className="flex items-center gap-3">
                    <span className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${idx === 0 ? 'bg-blue-100 text-blue-800' : 
                        idx === 1 ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-100 text-gray-600'}
                    `}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{dept.departmentName}</div>
                      <div className="text-xs text-gray-500">{dept.departmentCode}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">{dept.subCount}</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center text-gray-500 py-4">No sub-departments yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Department Status Overview</h3>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Active: {activeDepartments}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-600">Inactive: {inactiveDepartments}</span>
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${(activeDepartments / totalDepartments) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {Math.round((activeDepartments / totalDepartments) * 100)}% Active
          </span>
        </div>
      </div>
    </div>
  );
}

export default DepartmentStatistics;
