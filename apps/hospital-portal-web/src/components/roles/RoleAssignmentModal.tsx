'use client';

import React, { useState } from 'react';
import { RoleAssignmentModalProps, Role, RoleAction } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import {
  UserIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  AlertTriangleIcon,
  PlusIcon,
  TrashIcon,
  InfoIcon
} from 'lucide-react';

export const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  currentRoles,
  availableRoles,
  onAssignRole,
  onRemoveRole,
  loading = false
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [effectiveFrom, setEffectiveFrom] = useState<string>('');
  const [effectiveUntil, setEffectiveUntil] = useState<string>('');
  const [removalReason, setRemovalReason] = useState<string>('');
  const [showRemovalConfirm, setShowRemovalConfirm] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;

    try {
      await onAssignRole(
        selectedRoleId,
        effectiveFrom || undefined,
        effectiveUntil || undefined
      );
      
      // Reset form
      setSelectedRoleId('');
      setEffectiveFrom('');
      setEffectiveUntil('');
      setShowAssignForm(false);
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await onRemoveRole(roleId, removalReason || undefined);
      setShowRemovalConfirm(null);
      setRemovalReason('');
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  const unassignedRoles = availableRoles.filter(
    role => !currentRoles.some(currentRole => currentRole.id === role.id)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isRoleExpired = (role: Role) => {
    // Assuming role has effectiveUntil property
    return false; // Simplified for now
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <UserIcon className="w-5 h-5" />
              <span>Manage User Roles</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
          </div>
          
          <Button
            onClick={() => setShowAssignForm(!showAssignForm)}
            disabled={unassignedRoles.length === 0}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Assign Role</span>
          </Button>
        </div>

        {/* Role Assignment Form */}
        {showAssignForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-4">Assign New Role</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role...</option>
                  {unassignedRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective From (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={effectiveFrom}
                      onChange={(e) => setEffectiveFrom(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Until (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={effectiveUntil}
                      onChange={(e) => setEffectiveUntil(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-blue-200">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignRole}
                  disabled={!selectedRoleId || loading}
                >
                  Assign Role
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Current Roles List */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Current Roles ({currentRoles.length})</span>
          </h3>

          {currentRoles.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No roles assigned</p>
              <p className="text-sm text-gray-400 mt-1">
                Assign a role to give this user access to specific features
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentRoles.map(role => (
                <div
                  key={role.id}
                  className={`border rounded-lg p-4 ${
                    isRoleExpired(role) 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{role.name}</h4>
                        
                        {isRoleExpired(role) && (
                          <Badge variant="destructive" className="flex items-center space-x-1">
                            <AlertTriangleIcon className="w-3 h-3" />
                            <span>Expired</span>
                          </Badge>
                        )}
                        
                        {role.isActive && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                      
                      {role.description && (
                        <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {/* Add temporal role info if available */}
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>Assigned {formatDate(new Date().toISOString())}</span>
                        </div>
                        
                        {role.permissions && (
                          <div className="flex items-center space-x-1">
                            <ShieldCheckIcon className="w-3 h-3" />
                            <span>{role.permissions.length} permissions</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Show role details modal
                        }}
                        className="flex items-center space-x-1"
                      >
                        <InfoIcon className="w-3 h-3" />
                        <span>Details</span>
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowRemovalConfirm(role.id)}
                        disabled={loading}
                        className="flex items-center space-x-1"
                      >
                        <TrashIcon className="w-3 h-3" />
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Roles Info */}
        {unassignedRoles.length === 0 && !showAssignForm && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800">
              <InfoIcon className="w-4 h-4" />
              <span className="font-medium">All available roles are already assigned</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              This user has been assigned all available roles in the system.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Role Removal Confirmation Modal */}
      {showRemovalConfirm && (
        <Modal 
          isOpen={!!showRemovalConfirm} 
          onClose={() => setShowRemovalConfirm(null)}
          size="sm"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Role</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove this role from the user? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (Optional)
              </label>
              <textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="Provide a reason for removing this role..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowRemovalConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRemoveRole(showRemovalConfirm)}
                disabled={loading}
              >
                Remove Role
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};