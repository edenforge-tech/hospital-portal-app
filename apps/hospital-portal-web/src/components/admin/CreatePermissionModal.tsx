'use client';

import { useState } from 'react';
import { getApi } from '@/lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Common modules in hospital system
const MODULES = [
  'appointments',
  'patient_management',
  'hrm',
  'billing_revenue',
  'inventory',
  'pharmacy',
  'bed_management',
  'ambulance',
  'lab_diagnostics',
  'radiology',
  'ot_management',
  'clinical_documentation',
  'document_sharing',
  'quality_assurance',
  'vendor_procurement',
  'system_settings',
  'user_management',
  'department_management',
  'role_management',
  'permission_management',
  'audit',
  'reports',
];

// Common resources
const RESOURCES = [
  'appointment',
  'patient',
  'user',
  'employee',
  'doctor',
  'nurse',
  'staff',
  'department',
  'branch',
  'role',
  'permission',
  'tenant',
  'organization',
  'invoice',
  'payment',
  'bed',
  'room',
  'ward',
  'medicine',
  'inventory_item',
  'lab_test',
  'radiology_exam',
  'surgery',
  'operation_theater',
  'ambulance',
  'document',
  'report',
  'setting',
];

// Common actions
const ACTIONS = [
  'view',
  'create',
  'update',
  'delete',
  'approve',
  'reject',
  'assign',
  'unassign',
  'schedule',
  'cancel',
  'complete',
  'export',
  'import',
  'print',
  'share',
  'download',
  'upload',
  'search',
  'manage',
  'execute',
];

// Scopes
const SCOPES = [
  { value: 'global', label: 'Global (All data across system)' },
  { value: 'organization', label: 'Organization (Tenant-wide)' },
  { value: 'branch', label: 'Branch (Specific branch only)' },
  { value: 'department', label: 'Department (Specific department)' },
  { value: 'self', label: 'Self (Own data only)' },
];

// Data classifications
const DATA_CLASSIFICATIONS = [
  { value: 'public', label: 'Public (Non-sensitive)' },
  { value: 'internal', label: 'Internal (Standard protection)' },
  { value: 'confidential', label: 'Confidential (High protection)' },
  { value: 'restricted', label: 'Restricted (Maximum protection)' },
];

export default function CreatePermissionModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    module: '',
    resource: '',
    action: '',
    name: '',
    description: '',
    scope: 'global',
    dataClassification: 'internal',
    departmentSpecific: false,
  });

  const [customModule, setCustomModule] = useState('');
  const [customResource, setCustomResource] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [useCustomModule, setUseCustomModule] = useState(false);
  const [useCustomResource, setUseCustomResource] = useState(false);
  const [useCustomAction, setUseCustomAction] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const generateCode = () => {
    const module = useCustomModule ? customModule : formData.module;
    const resource = useCustomResource ? customResource : formData.resource;
    const action = useCustomAction ? customAction : formData.action;

    if (!module || !resource || !action) return '';
    return `${module}.${resource}.${action}`.toLowerCase();
  };

  const generateName = () => {
    const module = useCustomModule ? customModule : formData.module;
    const resource = useCustomResource ? customResource : formData.resource;
    const action = useCustomAction ? customAction : formData.action;

    if (!module || !resource || !action) return '';

    const formatWord = (word: string) =>
      word
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    return `${formatWord(action)} ${formatWord(resource)} (${formatWord(module)})`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const module = useCustomModule ? customModule : formData.module;
    const resource = useCustomResource ? customResource : formData.resource;
    const action = useCustomAction ? customAction : formData.action;

    if (!module) newErrors.module = 'Module is required';
    if (!resource) newErrors.resource = 'Resource is required';
    if (!action) newErrors.action = 'Action is required';
    if (!formData.scope) newErrors.scope = 'Scope is required';

    // Validate custom values if used
    if (useCustomModule && customModule && !/^[a-z_]+$/.test(customModule)) {
      newErrors.customModule = 'Module must be lowercase letters and underscores only';
    }
    if (useCustomResource && customResource && !/^[a-z_]+$/.test(customResource)) {
      newErrors.customResource = 'Resource must be lowercase letters and underscores only';
    }
    if (useCustomAction && customAction && !/^[a-z_]+$/.test(customAction)) {
      newErrors.customAction = 'Action must be lowercase letters and underscores only';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const module = useCustomModule ? customModule : formData.module;
      const resource = useCustomResource ? customResource : formData.resource;
      const action = useCustomAction ? customAction : formData.action;

      const code = generateCode();
      const name = formData.name || generateName();

      await getApi().post('/permissions', {
        code,
        name,
        description: formData.description,
        module,
        resource,
        resourceType: resource, // Alias
        action,
        scope: formData.scope,
        dataClassification: formData.dataClassification,
        departmentSpecific: formData.departmentSpecific,
        isCustom: true,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create permission');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      module: '',
      resource: '',
      action: '',
      name: '',
      description: '',
      scope: 'global',
      dataClassification: 'internal',
      departmentSpecific: false,
    });
    setCustomModule('');
    setCustomResource('');
    setCustomAction('');
    setUseCustomModule(false);
    setUseCustomResource(false);
    setUseCustomAction(false);
    setErrors({});
    setError('');
    onClose();
  };

  const code = generateCode();
  const autoName = generateName();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create Custom Permission</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Define a new permission with module, resource, and action
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Preview */}
          {code && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-indigo-900">Preview</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-600 font-medium">Code:</span>
                  <code className="text-sm bg-white px-2 py-1 rounded border border-indigo-200 font-mono">
                    {code}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-600 font-medium">Name:</span>
                  <span className="text-sm text-indigo-900">{formData.name || autoName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Module */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setUseCustomModule(!useCustomModule);
                  if (useCustomModule) setCustomModule('');
                }}
                className={`px-3 py-1 text-xs rounded-full ${
                  useCustomModule
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600'
                } hover:bg-indigo-200 transition-colors`}
              >
                {useCustomModule ? '✓ Custom' : 'Use Custom'}
              </button>
            </div>
            {useCustomModule ? (
              <input
                type="text"
                value={customModule}
                onChange={(e) => setCustomModule(e.target.value.toLowerCase())}
                placeholder="e.g., custom_module"
                className={`w-full px-3 py-2 border ${
                  errors.customModule ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            ) : (
              <select
                value={formData.module}
                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                className={`w-full px-3 py-2 border ${
                  errors.module ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="">Select module...</option>
                {MODULES.map((m) => (
                  <option key={m} value={m}>
                    {m.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            )}
            {(errors.module || errors.customModule) && (
              <p className="mt-1 text-sm text-red-500">{errors.module || errors.customModule}</p>
            )}
          </div>

          {/* Resource */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setUseCustomResource(!useCustomResource);
                  if (useCustomResource) setCustomResource('');
                }}
                className={`px-3 py-1 text-xs rounded-full ${
                  useCustomResource
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600'
                } hover:bg-indigo-200 transition-colors`}
              >
                {useCustomResource ? '✓ Custom' : 'Use Custom'}
              </button>
            </div>
            {useCustomResource ? (
              <input
                type="text"
                value={customResource}
                onChange={(e) => setCustomResource(e.target.value.toLowerCase())}
                placeholder="e.g., custom_resource"
                className={`w-full px-3 py-2 border ${
                  errors.customResource ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            ) : (
              <select
                value={formData.resource}
                onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                className={`w-full px-3 py-2 border ${
                  errors.resource ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="">Select resource...</option>
                {RESOURCES.map((r) => (
                  <option key={r} value={r}>
                    {r.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            )}
            {(errors.resource || errors.customResource) && (
              <p className="mt-1 text-sm text-red-500">{errors.resource || errors.customResource}</p>
            )}
          </div>

          {/* Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setUseCustomAction(!useCustomAction);
                  if (useCustomAction) setCustomAction('');
                }}
                className={`px-3 py-1 text-xs rounded-full ${
                  useCustomAction
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600'
                } hover:bg-indigo-200 transition-colors`}
              >
                {useCustomAction ? '✓ Custom' : 'Use Custom'}
              </button>
            </div>
            {useCustomAction ? (
              <input
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value.toLowerCase())}
                placeholder="e.g., custom_action"
                className={`w-full px-3 py-2 border ${
                  errors.customAction ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            ) : (
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className={`w-full px-3 py-2 border ${
                  errors.action ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="">Select action...</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </option>
                ))}
              </select>
            )}
            {(errors.action || errors.customAction) && (
              <p className="mt-1 text-sm text-red-500">{errors.action || errors.customAction}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scope <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                className={`w-full px-3 py-2 border ${
                  errors.scope ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                {SCOPES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.scope && <p className="mt-1 text-sm text-red-500">{errors.scope}</p>}
            </div>

            {/* Data Classification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Classification</label>
              <select
                value={formData.dataClassification}
                onChange={(e) => setFormData({ ...formData, dataClassification: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DATA_CLASSIFICATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name <span className="text-gray-400 text-xs">(optional - auto-generated if empty)</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={autoName}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this permission allows..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Specific */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="departmentSpecific"
              checked={formData.departmentSpecific}
              onChange={(e) => setFormData({ ...formData, departmentSpecific: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="departmentSpecific" className="text-sm text-gray-700">
              Department-specific permission (requires department context)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Create Permission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
