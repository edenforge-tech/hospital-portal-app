'use client';

import { Eye, FilePlus, Edit3, Trash2, CheckCircle, Download, Info, Shield } from 'lucide-react';

export interface GranularPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

interface GranularPermissionSelectorProps {
  permissions: GranularPermissions;
  onChange: (permissions: GranularPermissions) => void;
  disabled?: boolean;
  recommendedPermissions?: Partial<GranularPermissions>;
  showRecommended?: boolean;
}

const PERMISSION_DEFINITIONS = [
  {
    key: 'canView' as keyof GranularPermissions,
    label: 'View',
    description: 'View patient records and department data',
    icon: Eye,
    color: 'blue',
    medicalContext: 'Read-only access to clinical information',
  },
  {
    key: 'canCreate' as keyof GranularPermissions,
    label: 'Create',
    description: 'Create new records and entries',
    icon: FilePlus,
    color: 'teal',
    medicalContext: 'Add new patient records and documentation',
  },
  {
    key: 'canEdit' as keyof GranularPermissions,
    label: 'Edit',
    description: 'Modify existing records',
    icon: Edit3,
    color: 'amber',
    medicalContext: 'Update clinical notes and patient information',
  },
  {
    key: 'canDelete' as keyof GranularPermissions,
    label: 'Delete',
    description: 'Delete records (soft delete)',
    icon: Trash2,
    color: 'rose',
    medicalContext: 'Archive records (maintains audit trail)',
  },
  {
    key: 'canApprove' as keyof GranularPermissions,
    label: 'Approve',
    description: 'Approve/reject access requests',
    icon: CheckCircle,
    color: 'emerald',
    medicalContext: 'Authorize clinical decisions and access requests',
  },
  {
    key: 'canExport' as keyof GranularPermissions,
    label: 'Export',
    description: 'Export data to files',
    icon: Download,
    color: 'indigo',
    medicalContext: 'Generate reports and export patient data',
  },
];

export default function GranularPermissionSelector({
  permissions,
  onChange,
  disabled = false,
  recommendedPermissions,
  showRecommended = false,
}: GranularPermissionSelectorProps) {
  const handlePermissionChange = (key: keyof GranularPermissions, value: boolean) => {
    onChange({
      ...permissions,
      [key]: value,
    });
  };

  const isRecommended = (key: keyof GranularPermissions): boolean => {
    return showRecommended && recommendedPermissions?.[key] === true;
  };

  const getColorClasses = (color: string, isChecked: boolean) => {
    const colors = {
      blue: {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-50',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
      },
      teal: {
        border: 'border-teal-200',
        bg: 'bg-teal-50',
        hover: 'hover:bg-teal-50',
        text: 'text-teal-700',
        icon: 'text-teal-600',
        badge: 'bg-teal-100 text-teal-700',
      },
      amber: {
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        hover: 'hover:bg-amber-50',
        text: 'text-amber-700',
        icon: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
      },
      rose: {
        border: 'border-rose-200',
        bg: 'bg-rose-50',
        hover: 'hover:bg-rose-50',
        text: 'text-rose-700',
        icon: 'text-rose-600',
        badge: 'bg-rose-100 text-rose-700',
      },
      emerald: {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50',
        hover: 'hover:bg-emerald-50',
        text: 'text-emerald-700',
        icon: 'text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700',
      },
      indigo: {
        border: 'border-indigo-200',
        bg: 'bg-indigo-50',
        hover: 'hover:bg-indigo-50',
        text: 'text-indigo-700',
        icon: 'text-indigo-600',
        badge: 'bg-indigo-100 text-indigo-700',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      {showRecommended && recommendedPermissions && (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800 mb-1">
              Clinical Access Recommendations
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              Permissions marked with <Shield className="h-3 w-3 inline mx-1 text-emerald-600" /> are recommended based on the user's role and department type to ensure appropriate clinical data access.
            </div>
          </div>
        </div>
      )}

      {/* Permission Grid - Healthcare Styled */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PERMISSION_DEFINITIONS.map((perm) => {
          const isChecked = permissions[perm.key];
          const recommended = isRecommended(perm.key);
          const colorClasses = getColorClasses(perm.color, isChecked);
          const IconComponent = perm.icon;

          return (
            <label
              key={perm.key}
              className={`
                group relative flex items-start p-4 border-2 rounded-xl cursor-pointer 
                transition-all duration-200 transform
                ${disabled ? 'opacity-50 cursor-not-allowed' : `hover:shadow-md hover:-translate-y-0.5 ${colorClasses.hover}`}
                ${isChecked && !disabled 
                  ? `${colorClasses.border} ${colorClasses.bg} shadow-sm` 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${recommended ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}
              `}
            >
              {/* Checkbox - Custom Styled */}
              <div className="flex items-center mt-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                  disabled={disabled}
                  className={`
                    h-5 w-5 rounded-md border-2 transition-colors cursor-pointer
                    ${isChecked 
                      ? `${colorClasses.icon} bg-current border-current` 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                    focus:ring-2 focus:ring-offset-2 ${colorClasses.icon}
                  `}
                />
              </div>

              {/* Content */}
              <div className="flex-1 ml-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-lg transition-colors
                    ${isChecked ? `${colorClasses.bg} ${colorClasses.border} border` : 'bg-gray-100 border border-gray-200'}
                  `}>
                    <IconComponent className={`h-4 w-4 ${isChecked ? colorClasses.icon : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`
                        font-semibold text-sm
                        ${isChecked ? colorClasses.text : 'text-gray-700'}
                      `}>
                        {perm.label}
                      </span>
                      {recommended && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 shadow-sm">
                          <Shield className="h-3 w-3" />
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-1">
                  {perm.description}
                </p>
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  {perm.medicalContext}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Permission Summary - Enhanced */}
      <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-inner">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-gray-600" />
          <div className="text-sm font-semibold text-gray-700">Access Level Summary</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERMISSION_DEFINITIONS.filter((p) => permissions[p.key]).map((perm) => {
            const colorClasses = getColorClasses(perm.color, true);
            const IconComponent = perm.icon;
            return (
              <span
                key={perm.key}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium 
                  ${colorClasses.badge} shadow-sm
                `}
              >
                <IconComponent className="h-3.5 w-3.5" />
                {perm.label}
              </span>
            );
          })}
          {Object.values(permissions).every((v) => !v) && (
            <div className="flex items-center gap-2 text-gray-500">
              <Info className="h-4 w-4" />
              <span className="text-xs italic">No permissions selected - user will have no access</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
