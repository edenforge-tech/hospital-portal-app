'use client';

import Link from 'next/link';
import { useCachedAuthStore } from '@/lib/permission-cache';
import { useState } from 'react';

export default function Sidebar() {
  const { roles, hasPermission } = useCachedAuthStore();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      requiredPermission: null
    },
    {
      label: 'Patients',
      href: '/dashboard/patients',
      icon: '👥',
      requiredPermission: 'patient.view'
    },
    {
      label: 'Appointments',
      href: '/dashboard/appointments',
      icon: '📅',
      requiredPermission: 'appointment.view'
    },
    {
      label: 'Examinations',
      href: '/dashboard/examinations',
      icon: '�',
      requiredPermission: 'clinical_examination.view'
    },
  ];

  const adminMenuItems = [
    {
      label: 'Overview',
      href: '/dashboard/admin/overview',
      icon: '📋',
      requiredPermission: 'admin.dashboard.view'
    },
    {
      label: 'Users',
      href: '/dashboard/admin/users',
      icon: '👥',
      requiredPermission: 'user.view'
    },
    {
      label: 'Roles',
      href: '/dashboard/admin/roles',
      icon: '🔐',
      requiredPermission: 'role.view'
    },
    {
      label: 'Permissions',
      href: '/dashboard/admin/permissions',
      icon: '🛡️',
      requiredPermission: 'permission.view'
    },
    {
      label: 'Tenants',
      href: '/dashboard/admin/tenants',
      icon: '🏛️',
      requiredPermission: 'tenant.view'
    },
    {
      label: 'Organizations',
      href: '/dashboard/admin/organizations',
      icon: '🏗️',
      requiredPermission: 'organization.view'
    },
    {
      label: 'Branches',
      href: '/dashboard/admin/branches',
      icon: '🏢',
      requiredPermission: 'branch.view'
    },
    {
      label: 'Departments',
      href: '/dashboard/admin/departments',
      icon: '🏥',
      requiredPermission: 'department.view'
    },
    {
      label: 'Audit Logs',
      href: '/dashboard/admin/audit-logs',
      icon: '📝',
      requiredPermission: 'audit.view'
    },
    {
      label: 'Devices',
      href: '/dashboard/admin/devices',
      icon: '📱',
      requiredPermission: 'device.view'
    },
    {
      label: 'Sessions',
      href: '/dashboard/admin/sessions',
      icon: '🔑',
      requiredPermission: 'session.view'
    },
    {
      label: 'Emergency Access',
      href: '/dashboard/admin/emergency-access',
      icon: '🚨',
      requiredPermission: 'emergency_access.view'
    },
    {
      label: 'Settings',
      href: '/dashboard/admin/settings',
      icon: '⚙️',
      requiredPermission: 'system_settings.view'
    },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white shadow-lg overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Eye Hospital</h1>
        <p className="text-indigo-200 text-sm">Management System</p>
      </div>

      <nav className="mt-8 space-y-2">
        {menuItems.map((item) => {
          const canAccess = !item.requiredPermission || hasPermission(item.requiredPermission);
          
          if (!canAccess) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-800 transition"
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Admin Management Section */}
        <div className="mt-4">
          <button
            onClick={() => setAdminMenuOpen(!adminMenuOpen)}
            className="flex items-center justify-between w-full px-6 py-3 text-indigo-100 hover:bg-indigo-800 transition"
          >
            <div className="flex items-center">
              <span className="mr-3">🔧</span>
              <span>Admin Management</span>
            </div>
            <span className="text-xs">{adminMenuOpen ? '▼' : '▶'}</span>
          </button>
          
          {adminMenuOpen && (
            <div className="bg-indigo-950 bg-opacity-50">
              {adminMenuItems.map((item) => {
                const canAccess = !item.requiredPermission || hasPermission(item.requiredPermission);
                
                if (!canAccess) return null;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center pl-12 pr-6 py-2 text-indigo-200 text-sm hover:bg-indigo-800 transition"
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
