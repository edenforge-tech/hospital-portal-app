'use client';

import { useEffect, useState } from 'react';
import { X, Building2, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useConfirmation } from '@/components/common/ConfirmationDialog';

interface BranchAssignmentModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Branch {
  id: string;
  name: string;
  branchCode?: string;
  branchType?: string;
}

interface UserBranchAssignment {
  id: string;
  branchId: string;
  branchName: string;
  branchCode?: string;
  isDefault: boolean;
  assignedAt: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  status: string;
}

export default function BranchAssignmentModal({
  userId,
  userName,
  onClose,
  onSuccess
}: BranchAssignmentModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [userBranches, setUserBranches] = useState<UserBranchAssignment[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<Set<string>>(new Set());
  const [defaultBranch, setDefaultBranch] = useState<string>('');

  const { showConfirmation, ConfirmationComponent } = useConfirmation();

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
      const { token, tenantId } = useAuthStore.getState();

      if (!tenantId) {
        throw new Error('Tenant ID not found. Please log in again.');
      }

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Fetch all branches
      const branchesRes = await fetch(`${apiUrl}/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        }
      });
      if (!branchesRes.ok) {
        const errorText = await branchesRes.text();
        console.error('Branches API error:', branchesRes.status, errorText);
        throw new Error(`Failed to load branches: ${branchesRes.status} ${branchesRes.statusText}`);
      }
      const branchesData = await branchesRes.json();
      console.log('Branches data received:', branchesData);

      // Fetch user's current branch assignments
      const userBranchesRes = await fetch(`${apiUrl}/user-branches/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || ''
        }
      });
      if (!userBranchesRes.ok) throw new Error('Failed to load user branches');
      const userBranchesData = await userBranchesRes.json();
      
      console.log('🔍 USER BRANCHES API RESPONSE:', userBranchesData);
      console.log('🔍 Response type:', typeof userBranchesData);
      console.log('🔍 Is array?', Array.isArray(userBranchesData));
      console.log('🔍 Has .branches?', userBranchesData.branches);
      console.log('🔍 Has .Branches?', userBranchesData.Branches);
      console.log('🔍 Has .data?', userBranchesData.data);

      // API returns BranchListResponse with Branches property (capital B)
      setAllBranches(branchesData.branches || branchesData.Branches || []);
      
      // Try multiple possible response structures
      const extractedUserBranches = Array.isArray(userBranchesData) 
        ? userBranchesData 
        : (userBranchesData.branches || userBranchesData.Branches || userBranchesData.data || []);
      
      console.log('🔍 Extracted user branches:', extractedUserBranches);
      console.log('🔍 Extracted count:', extractedUserBranches.length);
      
      setUserBranches(extractedUserBranches);

      // Find default branch
      const defaultBranchAssignment = extractedUserBranches.find((b: UserBranchAssignment) => b.isDefault);
      if (defaultBranchAssignment) {
        setDefaultBranch(defaultBranchAssignment.branchId);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      const errorMessage = err.message || 'Failed to load data';
      setError(`Error: ${errorMessage}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBranches = async () => {
    if (selectedBranches.size === 0) {
      setError('Please select at least one branch');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
      const { token, tenantId } = useAuthStore.getState();

      if (!tenantId || !token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`${apiUrl}/user-branches/bulk-assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          userId,
          branchIds: Array.from(selectedBranches),
          defaultBranchId: defaultBranch || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign branches');
      }

      const result = await response.json();
      setSuccess(result.message || 'Branches assigned successfully');
      setSelectedBranches(new Set());

      // Reload user branches
      await fetchData();

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error assigning branches:', err);
      setError(err.message || 'Failed to assign branches');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBranch = (assignmentId: string, branchName: string) => {
    showConfirmation({
      title: 'Remove Branch',
      message: `Remove ${branchName} from ${userName}?`,
      variant: 'danger',
      confirmText: 'Remove',
      onConfirm: async () => {
        try {
          setSaving(true);
          setError('');

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
          const { token, tenantId } = useAuthStore.getState();

          if (!tenantId || !token) {
            throw new Error('Authentication required. Please log in again.');
          }

          const response = await fetch(`${apiUrl}/user-branches/${assignmentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Tenant-ID': tenantId
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove branch');
          }

          setSuccess(`${branchName} removed successfully`);
          await fetchData();
        } catch (err: any) {
          console.error('Error removing branch:', err);
          setError(err.message || 'Failed to remove branch');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleSetDefault = async (assignmentId: string, branchName: string) => {
    try {
      setSaving(true);
      setError('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5073/api';
      const { token, tenantId } = useAuthStore.getState();

      if (!tenantId || !token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`${apiUrl}/user-branches/${assignmentId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set default branch');
      }

      setSuccess(`${branchName} set as default`);
      await fetchData();
    } catch (err: any) {
      console.error('Error setting default:', err);
      setError(err.message || 'Failed to set default branch');
    } finally {
      setSaving(false);
    }
  };

  const toggleBranchSelection = (branchId: string) => {
    const newSelection = new Set(selectedBranches);
    if (newSelection.has(branchId)) {
      newSelection.delete(branchId);
      if (defaultBranch === branchId) {
        setDefaultBranch('');
      }
    } else {
      newSelection.add(branchId);
      if (!defaultBranch) {
        setDefaultBranch(branchId);
      }
    }
    setSelectedBranches(newSelection);
  };

  const assignedBranchIds = new Set(userBranches.map(ub => ub.branchId));
  const availableBranches = allBranches.filter(b => !assignedBranchIds.has(b.id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <ConfirmationComponent />
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Branch Access</h2>
              <p className="text-sm text-gray-600">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-800">{success}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading branches...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Assignments */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Assigned Branches ({userBranches.length})
                </h3>
                {userBranches.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No branches assigned yet</p>
                ) : (
                  <div className="space-y-2">
                    {userBranches.map((ub) => (
                      <div
                        key={ub.id}
                        className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{ub.branchName}</span>
                              {ub.isDefault && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            {ub.branchCode && (
                              <span className="text-xs text-gray-500">Code: {ub.branchCode}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!ub.isDefault && (
                            <button
                              onClick={() => handleSetDefault(ub.id, ub.branchName)}
                              disabled={saving}
                              className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveBranch(ub.id, ub.branchName)}
                            disabled={saving || userBranches.length === 1}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={userBranches.length === 1 ? "Cannot remove last branch" : "Remove branch"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Branches */}
              {availableBranches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Assign New Branches
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                    {availableBranches.map((branch) => (
                      <label
                        key={branch.id}
                        className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedBranches.has(branch.id)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBranches.has(branch.id)}
                          onChange={() => toggleBranchSelection(branch.id)}
                          className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{branch.name}</div>
                          {branch.branchCode && (
                            <div className="text-xs text-gray-500">Code: {branch.branchCode}</div>
                          )}
                        </div>
                        {defaultBranch === branch.id && selectedBranches.has(branch.id) && (
                          <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                        )}
                      </label>
                    ))}
                  </div>

                  {selectedBranches.size > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Select Default Branch
                      </label>
                      <select
                        value={defaultBranch}
                        onChange={(e) => setDefaultBranch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">No default</option>
                        {Array.from(selectedBranches).map((branchId) => {
                          const branch = allBranches.find(b => b.id === branchId);
                          return (
                            <option key={branchId} value={branchId}>
                              {branch?.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 disabled:opacity-50"
          >
            Close
          </button>
          {selectedBranches.size > 0 && (
            <button
              onClick={handleAssignBranches}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Assign {selectedBranches.size} Branch{selectedBranches.size > 1 ? 'es' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
