'use client';

import { useEffect, useState } from 'react';
import { Settings, Plus, Edit2, Trash2, Save, X, Shield, AlertTriangle } from 'lucide-react';
import { departmentRulesApi } from '@/lib/api/advanced-access.api';

interface AccessRule {
  id: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  departmentType: string;
  requiresApproval: boolean;
  approverRoles?: string[];
  requiresSupervision: boolean;
  supervisorRoles?: string[];
  maxAccessDuration?: number; // days
  autoExpire: boolean;
  requiresJustification: boolean;
  restrictedPermissions?: string[];
  emergencyAccessAllowed: boolean;
  isActive: boolean;
  customRules?: string;
}

const DEFAULT_RULE: Partial<AccessRule> = {
  requiresApproval: false,
  approverRoles: [],
  requiresSupervision: false,
  supervisorRoles: [],
  autoExpire: false,
  requiresJustification: false,
  restrictedPermissions: [],
  emergencyAccessAllowed: true,
  customRules: '',
  isActive: true,
};

const STANDARD_DEPARTMENTS = [
  'STD_ADMIN',
  'STD_RECEPTION',
  'STD_BILLING',
  'STD_PHARMACY',
  'STD_LAB',
  'STD_RADIOLOGY',
  'STD_NURSING_STATION',
  'STD_OPD',
  'STD_IPD',
  'STD_ICU',
  'STD_EMERGENCY',
  'STD_OT',
  'STD_JUNIOR_DOCTOR',
  'STD_SENIOR_DOCTOR',
];

const AVAILABLE_ROLES = [
  'Admin',
  'Senior Doctor',
  'Consultant',
  'Department Head',
  'Medical Director',
  'Hospital Director',
  'Supervisor',
];

const PERMISSION_TYPES = [
  'canDelete',
  'canApprove',
  'canExport',
  'canModifyPrescriptions',
  'canAccessFinancials',
];

export default function DepartmentAccessRulesPage() {
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentRulesApi.getAll();
      // Transform API response to match component interface
      const transformedRules: AccessRule[] = data.map((rule: any) => ({
        id: rule.id,
        departmentId: rule.departmentId,
        departmentCode: rule.departmentCode,
        departmentName: rule.departmentName,
        departmentType: rule.departmentType,
        requiresApproval: rule.requiresApproval,
        approverRoles: rule.approverRoles,
        requiresSupervision: rule.requiresSupervisor,
        supervisorRoles: rule.supervisorRoles,
        maxAccessDuration: rule.maxAccessDurationDays,
        autoExpire: rule.enableAutoExpiration,
        requiresJustification: rule.requiresJustification,
        restrictedPermissions: rule.restrictedPermissions,
        emergencyAccessAllowed: rule.allowEmergencyAccess,
        isActive: rule.isActive,
      }));
      setRules(transformedRules);
    } catch (err: any) {
      console.error('Error loading rules:', err);
      setError('Failed to load department access rules. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingRule({
      id: '',
      departmentCode: '',
      departmentName: '',
      ...DEFAULT_RULE,
    } as AccessRule);
    setIsCreating(true);
  };

  const handleEdit = (rule: AccessRule) => {
    setEditingRule({ ...rule });
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!editingRule) return;

    setError('');
    setSuccess('');
    try {
      const formData = {
        departmentId: editingRule.departmentId,
        requiresApproval: editingRule.requiresApproval,
        approverRoleIds: [], // You'll need to convert role names to IDs
        requiresSupervisor: editingRule.requiresSupervision,
        supervisorRoleIds: [], // You'll need to convert role names to IDs
        enableAutoExpiration: editingRule.autoExpire,
        maxAccessDurationDays: editingRule.maxAccessDuration,
        restrictedPermissions: editingRule.restrictedPermissions || [],
        requiresJustification: editingRule.requiresJustification,
        minJustificationLength: editingRule.requiresJustification ? 100 : undefined,
        allowEmergencyAccess: editingRule.emergencyAccessAllowed,
        emergencyRoleIds: [],
        isActive: editingRule.isActive,
      };

      if (isCreating) {
        const created = await departmentRulesApi.create(formData);
        setSuccess('Access rule created successfully');
        await fetchRules(); // Refresh the list
      } else {
        await departmentRulesApi.update(editingRule.id, formData);
        setSuccess('Access rule updated successfully');
        await fetchRules(); // Refresh the list
      }
      setEditingRule(null);
      setIsCreating(false);
    } catch (err: any) {
      console.error('Error saving rule:', err);
      setError('Failed to save access rule. ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Delete this access rule? This will affect access validation.')) return;

    try {
      await departmentRulesApi.delete(ruleId);
      setSuccess('Access rule deleted successfully');
      await fetchRules(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting rule:', err);
      setError('Failed to delete access rule. ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleRuleStatus = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    try {
      const formData = {
        departmentId: rule.departmentId,
        requiresApproval: rule.requiresApproval,
        approverRoleIds: [],
        requiresSupervisor: rule.requiresSupervision,
        supervisorRoleIds: [],
        enableAutoExpiration: rule.autoExpire,
        maxAccessDurationDays: rule.maxAccessDuration,
        restrictedPermissions: rule.restrictedPermissions || [],
        requiresJustification: rule.requiresJustification,
        minJustificationLength: rule.requiresJustification ? 100 : undefined,
        allowEmergencyAccess: rule.emergencyAccessAllowed,
        emergencyRoleIds: [],
        isActive: !rule.isActive,
      };
      await departmentRulesApi.update(ruleId, formData);
      await fetchRules(); // Refresh the list
    } catch (err: any) {
      console.error('Error toggling rule status:', err);
      setError('Failed to update rule status. ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-indigo-600" />
              Department Access Rules
            </h1>
            <p className="text-gray-600 mt-2">
              Configure validation rules and approval workflows for 14 standard departments
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
            Add Custom Rule
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Rules List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading rules...</div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-white rounded-lg shadow-sm border p-6 ${
                  !rule.isActive ? 'opacity-60 border-gray-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {rule.departmentName}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-mono rounded">
                        {rule.departmentCode}
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          onChange={() => toggleRuleStatus(rule.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600">Active</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Approval Required */}
                      <div className="flex items-center gap-2">
                        {rule.requiresApproval ? (
                          <Shield className="h-5 w-5 text-orange-500" />
                        ) : (
                          <Shield className="h-5 w-5 text-gray-300" />
                        )}
                        <span className="text-sm text-gray-700">
                          {rule.requiresApproval ? 'Approval Required' : 'No Approval'}
                        </span>
                      </div>

                      {/* Supervision */}
                      {rule.requiresSupervision && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <span className="text-sm text-gray-700">Supervision Required</span>
                        </div>
                      )}

                      {/* Auto Expire */}
                      {rule.autoExpire && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            Auto-expires: {rule.maxAccessDuration} days
                          </span>
                        </div>
                      )}

                      {/* Justification */}
                      {rule.requiresJustification && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">Justification Required</span>
                        </div>
                      )}
                    </div>

                    {/* Approver Roles */}
                    {rule.approverRoles.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700">Approvers: </span>
                        <span className="text-sm text-gray-600">
                          {rule.approverRoles.join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Restricted Permissions */}
                    {rule.restrictedPermissions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Restricted: </span>
                        {rule.restrictedPermissions.map(perm => (
                          <span key={perm} className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded mr-2">
                            {perm}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Edit Rule"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isCreating ? 'Create Access Rule' : 'Edit Access Rule'}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingRule(null);
                      setIsCreating(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Department Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department Code *
                      </label>
                      <select
                        value={editingRule.departmentCode}
                        onChange={(e) => setEditingRule({
                          ...editingRule,
                          departmentCode: e.target.value,
                          departmentName: e.target.value.replace('STD_', '').replace(/_/g, ' ')
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        disabled={!isCreating}
                      >
                        <option value="">Select Department</option>
                        {STANDARD_DEPARTMENTS.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department Name
                      </label>
                      <input
                        type="text"
                        value={editingRule.departmentName}
                        onChange={(e) => setEditingRule({ ...editingRule, departmentName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  {/* Approval Settings */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Settings</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editingRule.requiresApproval}
                          onChange={(e) => setEditingRule({ ...editingRule, requiresApproval: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Requires Approval</div>
                          <div className="text-sm text-gray-600">Access requests must be approved by designated roles</div>
                        </div>
                      </label>

                      {editingRule.requiresApproval && (
                        <div className="ml-7 p-4 bg-gray-50 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Approver Roles
                          </label>
                          <div className="space-y-2">
                            {AVAILABLE_ROLES.map(role => (
                              <label key={role} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editingRule.approverRoles.includes(role)}
                                  onChange={(e) => {
                                    const newRoles = e.target.checked
                                      ? [...editingRule.approverRoles, role]
                                      : editingRule.approverRoles.filter(r => r !== role);
                                    setEditingRule({ ...editingRule, approverRoles: newRoles });
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{role}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Supervision Settings */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supervision Settings</h3>
                    
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={editingRule.requiresSupervision}
                        onChange={(e) => setEditingRule({ ...editingRule, requiresSupervision: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Requires Supervision</div>
                        <div className="text-sm text-gray-600">Users must work under designated supervisors (e.g., Junior Doctors)</div>
                      </div>
                    </label>

                    {editingRule.requiresSupervision && (
                      <div className="ml-7 mt-4 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Supervisor Roles
                        </label>
                        <div className="space-y-2">
                          {AVAILABLE_ROLES.map(role => (
                            <label key={role} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingRule.supervisorRoles.includes(role)}
                                onChange={(e) => {
                                  const newRoles = e.target.checked
                                    ? [...editingRule.supervisorRoles, role]
                                    : editingRule.supervisorRoles.filter(r => r !== role);
                                  setEditingRule({ ...editingRule, supervisorRoles: newRoles });
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">{role}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Time-Based Settings */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Time-Based Access</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editingRule.autoExpire}
                          onChange={(e) => setEditingRule({ ...editingRule, autoExpire: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Auto-Expire Access</div>
                          <div className="text-sm text-gray-600">Automatically revoke access after specified duration</div>
                        </div>
                      </label>

                      {editingRule.autoExpire && (
                        <div className="ml-7">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Access Duration (Days)
                          </label>
                          <input
                            type="number"
                            value={editingRule.maxAccessDuration || ''}
                            onChange={(e) => setEditingRule({ ...editingRule, maxAccessDuration: parseInt(e.target.value) || undefined })}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="90"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Validations */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Validations</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editingRule.requiresJustification}
                          onChange={(e) => setEditingRule({ ...editingRule, requiresJustification: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Requires Justification</div>
                          <div className="text-sm text-gray-600">Users must provide reason for access request</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editingRule.emergencyAccessAllowed}
                          onChange={(e) => setEditingRule({ ...editingRule, emergencyAccessAllowed: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Emergency Access Allowed</div>
                          <div className="text-sm text-gray-600">Allow emergency bypass of approval workflow</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Restricted Permissions */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Restrictions</h3>
                    <p className="text-sm text-gray-600 mb-3">Select permissions that should be restricted for this department</p>
                    
                    <div className="space-y-2">
                      {PERMISSION_TYPES.map(perm => (
                        <label key={perm} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRule.restrictedPermissions.includes(perm)}
                            onChange={(e) => {
                              const newPerms = e.target.checked
                                ? [...editingRule.restrictedPermissions, perm]
                                : editingRule.restrictedPermissions.filter(p => p !== perm);
                              setEditingRule({ ...editingRule, restrictedPermissions: newPerms });
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Custom Rules */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Rules (Optional)
                    </label>
                    <textarea
                      value={editingRule.customRules}
                      onChange={(e) => setEditingRule({ ...editingRule, customRules: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Additional validation logic or notes..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditingRule(null);
                      setIsCreating(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="h-5 w-5" />
                    Save Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
