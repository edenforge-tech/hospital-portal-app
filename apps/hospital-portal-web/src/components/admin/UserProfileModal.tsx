'use client';

import React, { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
  onRefresh: () => void;
}

interface UserProfile {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: string;
  userStatus: string;
  designation?: string;
  specialization?: string;
  licenseNumber?: string;
  professionalRegistrationDate?: string;
  departments?: {
    id: string;
    name: string;
    isPrimary: boolean;
    accessLevel: string;
  }[];
  roles?: {
    id: string;
    roleName: string;
    scope: string;
  }[];
  branchName?: string;
  organizationName?: string;
  lastLoginAt?: string;
  mfaEnabled: boolean;
  mfaMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Activity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose, onRefresh }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'departments' | 'roles' | 'activity' | 'settings'>('personal');

  useEffect(() => {
    loadProfile();
    loadActivities();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getProfile(userId);
      setProfile(response.data);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await usersApi.getActivity(userId, 20);
      setActivities(response.data || []);
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded-lg bg-white p-8">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-600">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
                <p className="text-blue-100">{profile.email}</p>
                <div className="mt-1 flex gap-2">
                  <StatusBadge status={profile.userStatus} size="sm" />
                  <StatusBadge status={profile.mfaEnabled ? 'MFA Enabled' : 'MFA Disabled'} size="sm" />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-4 border-t border-blue-500 pt-4">
            {['personal', 'professional', 'departments', 'roles', 'activity', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-white text-white'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Username</p>
                  <p className="mt-1 text-gray-900">{profile.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">User Type</p>
                  <p className="mt-1 text-gray-900">{profile.userType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="mt-1 text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone Number</p>
                  <p className="mt-1 text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Organization</p>
                  <p className="mt-1 text-gray-900">{profile.organizationName || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Branch</p>
                  <p className="mt-1 text-gray-900">{profile.branchName || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Created</p>
                  <p className="mt-1 text-gray-900">{formatDate(profile.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Login</p>
                  <p className="mt-1 text-gray-900">{formatDate(profile.lastLoginAt)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Designation</p>
                  <p className="mt-1 text-gray-900">{profile.designation || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Specialization</p>
                  <p className="mt-1 text-gray-900">{profile.specialization || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">License Number</p>
                  <p className="mt-1 text-gray-900">{profile.licenseNumber || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Registration Date</p>
                  <p className="mt-1 text-gray-900">{formatDate(profile.professionalRegistrationDate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === 'departments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Department Assignments</h3>
              {!profile.departments || profile.departments.length === 0 ? (
                <p className="text-center text-gray-500">No department assignments</p>
              ) : (
                <div className="space-y-2">
                  {profile.departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{dept.name}</p>
                        {dept.isPrimary && (
                          <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Primary Department
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Access Level</p>
                        <p className="font-medium text-gray-900">{dept.accessLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Role Assignments</h3>
              {!profile.roles || profile.roles.length === 0 ? (
                <p className="text-center text-gray-500">No role assignments</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {profile.roles.map((role) => (
                    <div
                      key={role.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="font-medium text-gray-900">{role.roleName}</p>
                      <p className="mt-1 text-sm text-gray-600">Scope: {role.scope}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              {activities.length === 0 ? (
                <p className="text-center text-gray-500">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div className="mt-1 text-2xl">
                        {activity.action === 'login' ? '🔐' :
                         activity.action === 'logout' ? '🚪' :
                         activity.action === 'update' ? '✏️' :
                         activity.action === 'create' ? '➕' :
                         activity.action === 'delete' ? '🗑️' : '📋'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                          {activity.ipAddress && (
                            <>
                              <span>•</span>
                              <span>IP: {activity.ipAddress}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security & Settings</h3>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Multi-Factor Authentication</p>
                      <p className="text-sm text-gray-600">
                        {profile.mfaEnabled ? `Enabled (${profile.mfaMethod || 'Method not specified'})` : 'Not enabled'}
                      </p>
                    </div>
                    <StatusBadge status={profile.mfaEnabled ? 'Enabled' : 'Disabled'} />
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Account Status</p>
                      <p className="text-sm text-gray-600">Current account status</p>
                    </div>
                    <StatusBadge status={profile.userStatus} />
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="font-medium text-gray-900">Last Updated</p>
                  <p className="mt-1 text-sm text-gray-600">{formatDate(profile.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-6 py-2 font-medium text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
