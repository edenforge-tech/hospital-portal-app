'use client';

import { useEffect, useState } from 'react';
import { UserCheck, Shield, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { supervisedAccessApi } from '@/lib/api/advanced-access.api';

interface SupervisedUser {
  id: string;
  userId: string;
  userName: string;
  fullName: string;
  email: string;
  qualification?: string;
  assignedSupervisorId?: string;
  supervisorId?: string;
  supervisorName?: string;
  departmentName?: string;
  supervisionStartDate?: string;
  supervisionEndDate?: string;
  status: string;
  oversightLevel: string;
  complianceScore: number;
  pendingApprovals: number;
  recentActivity?: number;
}

interface SupervisorCapacity {
  supervisorUserId: string;
  supervisorName: string;
  specialty?: string;
  maxSupervisees: number;
  currentSupervisees: number;
  availableSlots: number;
  utilizationPercentage: number;
  averageComplianceScore: number;
  isActive: boolean;
  status: string;
  currentSupervisedUsers: SupervisedUser[];
}

const OVERSIGHT_LEVELS = [
  { value: 'Close', label: 'Close Supervision', description: 'Daily oversight, all actions reviewed' },
  { value: 'Moderate', label: 'Moderate Supervision', description: 'Weekly oversight, critical actions reviewed' },
  { value: 'Light', label: 'Light Supervision', description: 'Monthly oversight, audit-based review' },
];

export default function SupervisedAccessPage() {
  const [supervisedUsers, setSupervisedUsers] = useState<SupervisedUser[]>([]);
  const [availableSupervisors, setAvailableSupervisors] = useState<SupervisorCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<SupervisedUser | null>(null);
  const [assigningSupervisor, setAssigningSupervisor] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch supervised users and supervisor capacities from API
      const [usersData, capacitiesData] = await Promise.all([
        supervisedAccessApi.getAllUsers(),
        supervisedAccessApi.getSupervisorCapacities(),
      ]);

      setSupervisedUsers(usersData);
      setAvailableSupervisors(capacitiesData);
    } catch (err: any) {
      console.error('Error loading supervised access data:', err);
      setError('Failed to load supervised access data. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSupervisor = async (userId: string, supervisorId: string) => {
    setError('');
    setSuccess('');
    setAssigningSupervisor(true);
    try {
      const user = supervisedUsers.find(u => u.userId === userId);
      if (!user) return;

      const formData = {
        userId: user.userId,
        assignedSupervisorId: supervisorId,
        oversightLevel: user.oversightLevel,
        requiresCoSignature: true,
        supervisionStartDate: user.supervisionStartDate,
        supervisionEndDate: user.supervisionEndDate,
      };

      if (user.id) {
        // Update existing supervised user
        await supervisedAccessApi.updateUser(user.id, formData);
      } else {
        // Create new supervised user
        await supervisedAccessApi.createUser(formData);
      }

      setSuccess('Supervisor assigned successfully');
      setSelectedUser(null);
      await fetchData(); // Refresh the data
    } catch (err: any) {
      console.error('Error assigning supervisor:', err);
      setError('Failed to assign supervisor. ' + (err.response?.data?.message || err.message));
    } finally {
      setAssigningSupervisor(false);
    }
  };

  const handleRevokeSupervision = async (userId: string) => {
    if (!confirm('Revoke supervision for this user? They will lose department access.')) return;

    try {
      const user = supervisedUsers.find(u => u.userId === userId);
      if (!user || !user.id) return;

      await supervisedAccessApi.deleteUser(user.id);
      setSuccess('Supervision revoked successfully');
      await fetchData(); // Refresh the data
    } catch (err: any) {
      console.error('Error revoking supervision:', err);
      setError('Failed to revoke supervision. ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateOversightLevel = async (userId: string, level: string) => {
    try {
      setSupervisedUsers(supervisedUsers.map(u =>
        u.userId === userId ? { ...u, oversightLevel: level as any } : u
      ));
      setSuccess('Oversight level updated successfully');
    } catch (err: any) {
      setError('Failed to update oversight level');
    }
  };

  const filteredUsers = filterStatus === 'all'
    ? supervisedUsers
    : supervisedUsers.filter(u => u.status.toLowerCase() === filterStatus.toLowerCase());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Pending': return 'yellow';
      case 'Expired': return 'gray';
      case 'Revoked': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return CheckCircle;
      case 'Pending': return Clock;
      case 'Expired': return AlertCircle;
      case 'Revoked': return XCircle;
      default: return AlertCircle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto animate-spin" />
            <p className="mt-4 text-gray-600">Loading supervised access data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-indigo-600" />
            Supervised Access Framework
          </h1>
          <p className="text-gray-600 mt-2">
            Manage junior doctor supervision and oversight tracking (NABH Compliance)
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Supervised</div>
            <div className="text-2xl font-bold text-gray-900">{supervisedUsers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Active Supervision</div>
            <div className="text-2xl font-bold text-green-600">
              {supervisedUsers.filter(u => u.status === 'Active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Pending Assignment</div>
            <div className="text-2xl font-bold text-yellow-600">
              {supervisedUsers.filter(u => u.status === 'Pending').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Available Supervisors</div>
            <div className="text-2xl font-bold text-indigo-600">{availableSupervisors.length}</div>
          </div>
        </div>

        {/* Available Supervisors Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Supervisors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSupervisors.map(supervisor => (
              <div
                key={supervisor.supervisorUserId}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{supervisor.supervisorName}</h3>
                    <p className="text-sm text-gray-600">{supervisor.specialty || 'General'}</p>
                    <div className="mt-2 text-sm text-gray-700">
                      <span>Supervising: {supervisor.currentSupervisees}/{supervisor.maxSupervisees}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    supervisor.availableSlots > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {supervisor.availableSlots} slots
                  </span>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(supervisor.currentSupervisees / supervisor.maxSupervisees) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {['all', 'active', 'pending', 'expired', 'revoked'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                filterStatus === status
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 text-sm">
                ({status === 'all' ? supervisedUsers.length : supervisedUsers.filter(u => u.status.toLowerCase() === status).length})
              </span>
            </button>
          ))}
        </div>

        {/* Supervised Users List */}
        <div className="space-y-4">
          {filteredUsers.map(user => {
            const StatusIcon = getStatusIcon(user.status);
            const statusColor = getStatusColor(user.status);

            return (
              <div
                key={user.userId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{user.userName}</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 bg-${statusColor}-100 text-${statusColor}-800 text-sm font-medium rounded-full`}>
                        <StatusIcon className="h-4 w-4" />
                        {user.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-medium text-gray-900">{user.departmentName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(user.supervisionStartDate).toLocaleDateString()}
                        </p>
                      </div>
                      {user.supervisionEndDate && (
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(user.supervisionEndDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {user.supervisorId ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">Assigned Supervisor</span>
                        </div>
                        <p className="text-green-800">{user.supervisorName}</p>
                        <div className="mt-3 flex items-center gap-4">
                          <div>
                            <p className="text-sm text-green-700">Oversight Level</p>
                            <select
                              value={user.oversightLevel}
                              onChange={(e) => handleUpdateOversightLevel(user.userId, e.target.value)}
                              className="mt-1 px-3 py-1 border border-green-300 rounded-md text-sm"
                            >
                              {OVERSIGHT_LEVELS.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <p className="text-sm text-green-700">Compliance Score</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-24 bg-green-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${user.complianceScore}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-green-900">{user.complianceScore}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-green-700">Recent Activity</p>
                            <p className="text-sm font-medium text-green-900 mt-1">{user.recentActivity} actions</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-yellow-900">No Supervisor Assigned</span>
                        </div>
                        <p className="text-yellow-800 text-sm">This user requires supervisor assignment to continue working.</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-6">
                    {user.status === 'Pending' && (
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                      >
                        <UserCheck className="h-5 w-5" />
                        Assign Supervisor
                      </button>
                    )}
                    {user.status === 'Active' && (
                      <button
                        onClick={() => handleRevokeSupervision(user.userId)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        <XCircle className="h-5 w-5" />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assign Supervisor Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Assign Supervisor</h2>
              <p className="text-gray-600 mb-6">
                Select a supervisor for <strong>{selectedUser.userName}</strong>
              </p>

              <div className="space-y-3 mb-6">
                {availableSupervisors
                  .filter(s => s.availableSlots > 0)
                  .map(supervisor => (
                    <button
                      key={supervisor.supervisorUserId}
                      onClick={() => handleAssignSupervisor(selectedUser.userId, supervisor.supervisorUserId)}
                      disabled={assigningSupervisor}
                      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{supervisor.supervisorName}</h3>
                          <p className="text-sm text-gray-600">{supervisor.specialty || 'General'}</p>
                          <p className="text-xs text-gray-500">
                            Currently supervising {supervisor.currentSupervisees}/{supervisor.maxSupervisees}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          {supervisor.availableSlots} slots available
                        </span>
                      </div>
                    </button>
                  ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
