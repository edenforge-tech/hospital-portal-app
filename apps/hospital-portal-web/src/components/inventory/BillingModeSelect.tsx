'use client';

import React from 'react';

/**
 * BillingModeSelect
 * Radio group for Bulk vs PatientSpecific IOL billing mode.
 * When PatientSpecific is selected, shows patient name + IP number inputs.
 */
interface Props {
  value: 'Bulk' | 'PatientSpecific';
  onChange: (mode: 'Bulk' | 'PatientSpecific') => void;
  patientName?: string;
  patientIpNo?: string;
  onPatientNameChange?: (v: string) => void;
  onPatientIpNoChange?: (v: string) => void;
  disabled?: boolean;
}

export function BillingModeSelect({
  value,
  onChange,
  patientName = '',
  patientIpNo = '',
  onPatientNameChange,
  onPatientIpNoChange,
  disabled = false,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex gap-6">
        {(['Bulk', 'PatientSpecific'] as const).map(mode => (
          <label key={mode} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="billingMode"
              value={mode}
              checked={value === mode}
              onChange={() => onChange(mode)}
              disabled={disabled}
              className="accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">
              {mode === 'Bulk' ? 'Bulk (OT Stock)' : 'Patient-Specific IOL'}
            </span>
          </label>
        ))}
      </div>

      {value === 'PatientSpecific' && (
        <div className="grid grid-cols-2 gap-3 bg-blue-50 border border-blue-200 rounded-md p-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Patient Name *</label>
            <input
              type="text"
              value={patientName}
              onChange={e => onPatientNameChange?.(e.target.value)}
              disabled={disabled}
              placeholder="Full name"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">IP Number *</label>
            <input
              type="text"
              value={patientIpNo}
              onChange={e => onPatientIpNoChange?.(e.target.value)}
              disabled={disabled}
              placeholder="IP/MR number"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
