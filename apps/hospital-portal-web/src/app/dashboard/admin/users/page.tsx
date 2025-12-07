'use client';

import { useEffect, useState } from 'react';
import { usersApi, rolesApi, departmentsApi, branchesApi } from '@/lib/api';
import Link from 'next/link';
import UserForm from '@/components/admin/UserForm';
import UserDepartmentAccessModal from '@/components/admin/UserDepartmentAccessModal';

interface UserRow {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  userStatus: string;
  roles?: string[];
  departments?: Array<{ departmentId: string; departmentName: string; isPrimary: boolean }>;
  primaryDepartment?: string;
  branch?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  
  // Filter options
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; departmentName: string }>>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAllWithDetails();
      setUsers(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [rolesRes, deptsRes, branchesRes] = await Promise.all([
        rolesApi.getAll(),
        departmentsApi.getAll(),
        branchesApi.getAll(),
      ]);
      setRoles(rolesRes.data || []);
      setDepartments(deptsRes.data || []);
      // Branches API returns { branches: [], totalCount, ... }
      setBranches(branchesRes.data?.branches || []);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFilterOptions();
  }, []);

  const handleEdit = (user: UserRow) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await usersApi.deactivate(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleManageDepartments = (user: UserRow) => {
    setSelectedUserId(user.id);
    setSelectedUserName(`${user.firstName} ${user.lastName}`);
    setShowDepartmentModal(true);
  };

  // Apply filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = searchTerm === '' ||
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || (u.roles && u.roles.includes(roleFilter));
    const matchesDept = departmentFilter === '' || 
      (u.departments && u.departments.some(d => d.departmentName === departmentFilter));
    const matchesBranch = branchFilter === '' || u.branch === branchFilter;
    
    return matchesSearch && matchesRole && matchesDept && matchesBranch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div>
          <button
            onClick={handleCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Create User
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.departmentName}>{d.departmentName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap">{u.firstName} {u.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {u.roles && u.roles.length > 0 ? (
                      u.roles.map((role, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No roles</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {u.departments && u.departments.length > 0 ? (
                      <>
                        {u.departments.slice(0, 2).map((dept, idx) => (
                          <span key={idx} className="text-sm">
                            {dept.departmentName}
                            {dept.isPrimary && (
                              <span className="ml-1 text-xs text-indigo-600 font-medium">(Primary)</span>
                            )}
                          </span>
                        ))}
                        {u.departments.length > 2 && (
                          <button
                            onClick={() => handleManageDepartments(u)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 text-left"
                          >
                            +{u.departments.length - 2} more
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">No departments</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {u.branch || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    u.userStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.userStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleManageDepartments(u)} className="text-indigo-600 hover:text-indigo-900 font-medium">
                      Manage Departments
                    </button>
                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-900">Edit User</button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || roleFilter || departmentFilter || branchFilter ? 'No users match your filters' : 'No users found'}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <UserForm
              initialUser={editingUser}
              onClose={() => { setShowForm(false); fetchUsers(); }}
            />
          </div>
        </div>
      )}

      {showDepartmentModal && (
        <UserDepartmentAccessModal
          userId={selectedUserId}
          userName={selectedUserName}
          onClose={() => {
            setShowDepartmentModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
