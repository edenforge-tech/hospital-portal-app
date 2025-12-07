'use client';

import { ReactNode } from 'react';
import { PermissionGate } from './PermissionGate';

interface PermissionFieldProps {
  /** Permission required to show the field */
  permission?: string;
  /** Role required to show the field */
  role?: string;
  /** Whether to require ALL permissions (AND) or ANY permission (OR) when multiple permissions are provided */
  requireAll?: boolean;
  /** Children (form field components) */
  children: ReactNode;
}

/**
 * PermissionField component for conditionally rendering form fields based on user permissions.
 * Useful for showing/hiding sensitive form fields based on user access levels.
 *
 * @example
 * // Hide sensitive patient fields from basic users
 * <PermissionField permission="patient.update_sensitive">
 *   <div>
 *     <label>Medical History</label>
 *     <textarea name="medicalHistory" />
 *   </div>
 * </PermissionField>
 *
 * // Show admin-only configuration fields
 * <PermissionField role="Admin">
 *   <div>
 *     <label>System Configuration</label>
 *     <input name="systemConfig" />
 *   </div>
 * </PermissionField>
 */
export function PermissionField({
  permission,
  role,
  requireAll = false,
  children
}: PermissionFieldProps) {
  return (
    <PermissionGate
      permission={permission}
      role={role}
      requireAll={requireAll}
    >
      {children}
    </PermissionGate>
  );
}

interface PermissionInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Permission required to show the input */
  permission?: string;
  /** Role required to show the input */
  role?: string;
  /** Whether to require ALL permissions (AND) or ANY permission (OR) when multiple permissions are provided */
  requireAll?: boolean;
  /** Label for the input field */
  label?: string;
  /** Error message to show when permission is denied */
  permissionDeniedMessage?: string;
}

/**
 * PermissionInput component that conditionally renders an input field.
 * Shows a disabled input or custom message when permission is denied.
 *
 * @example
 * <PermissionInput
 *   permission="patient.update_emergency_contact"
 *   label="Emergency Contact"
 *   name="emergencyContact"
 *   type="text"
 *   permissionDeniedMessage="Contact admin to update emergency contact"
 * />
 */
export function PermissionInput({
  permission,
  role,
  requireAll = false,
  label,
  permissionDeniedMessage,
  className = '',
  ...inputProps
}: PermissionInputProps) {
  return (
    <PermissionGate
      permission={permission}
      role={role}
      requireAll={requireAll}
      fallback={
        <div className={`form-field ${className}`}>
          {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
          <input
            {...inputProps}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            placeholder={permissionDeniedMessage || "Access denied"}
          />
          {permissionDeniedMessage && (
            <p className="mt-1 text-sm text-red-600">{permissionDeniedMessage}</p>
          )}
        </div>
      }
    >
      <div className={`form-field ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input
          {...inputProps}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputProps.className || ''}`}
        />
      </div>
    </PermissionGate>
  );
}

interface PermissionSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Permission required to show the select */
  permission?: string;
  /** Role required to show the select */
  role?: string;
  /** Whether to require ALL permissions (AND) or ANY permission (OR) when multiple permissions are provided */
  requireAll?: boolean;
  /** Label for the select field */
  label?: string;
  /** Options for the select */
  options: Array<{ value: string; label: string }>;
  /** Error message to show when permission is denied */
  permissionDeniedMessage?: string;
}

/**
 * PermissionSelect component that conditionally renders a select field.
 *
 * @example
 * <PermissionSelect
 *   permission="patient.update_priority"
 *   label="Priority Level"
 *   name="priority"
 *   options={[
 *     { value: 'low', label: 'Low' },
 *     { value: 'medium', label: 'Medium' },
 *     { value: 'high', label: 'High' }
 *   ]}
 * />
 */
export function PermissionSelect({
  permission,
  role,
  requireAll = false,
  label,
  options,
  permissionDeniedMessage,
  className = '',
  ...selectProps
}: PermissionSelectProps) {
  return (
    <PermissionGate
      permission={permission}
      role={role}
      requireAll={requireAll}
      fallback={
        <div className={`form-field ${className}`}>
          {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
          <select
            {...selectProps}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
          >
            <option>{permissionDeniedMessage || "Access denied"}</option>
          </select>
          {permissionDeniedMessage && (
            <p className="mt-1 text-sm text-red-600">{permissionDeniedMessage}</p>
          )}
        </div>
      }
    >
      <div className={`form-field ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <select
          {...selectProps}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${selectProps.className || ''}`}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </PermissionGate>
  );
}

interface PermissionTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Permission required to show the textarea */
  permission?: string;
  /** Role required to show the textarea */
  role?: string;
  /** Whether to require ALL permissions (AND) or ANY permission (OR) when multiple permissions are provided */
  requireAll?: boolean;
  /** Label for the textarea field */
  label?: string;
  /** Error message to show when permission is denied */
  permissionDeniedMessage?: string;
}

/**
 * PermissionTextarea component that conditionally renders a textarea field.
 *
 * @example
 * <PermissionTextarea
 *   permission="patient.update_medical_notes"
 *   label="Medical Notes"
 *   name="medicalNotes"
 *   rows={4}
 *   placeholder="Enter medical notes..."
 * />
 */
export function PermissionTextarea({
  permission,
  role,
  requireAll = false,
  label,
  permissionDeniedMessage,
  className = '',
  ...textareaProps
}: PermissionTextareaProps) {
  return (
    <PermissionGate
      permission={permission}
      role={role}
      requireAll={requireAll}
      fallback={
        <div className={`form-field ${className}`}>
          {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
          <textarea
            {...textareaProps}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed resize-none"
            placeholder={permissionDeniedMessage || "Access denied"}
          />
          {permissionDeniedMessage && (
            <p className="mt-1 text-sm text-red-600">{permissionDeniedMessage}</p>
          )}
        </div>
      }
    >
      <div className={`form-field ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea
          {...textareaProps}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${textareaProps.className || ''}`}
        />
      </div>
    </PermissionGate>
  );
}