'use client';

import React, { useState, useEffect } from 'react';
import { departmentsApi, Department, DepartmentFormData } from '@/lib/api/departments.api';
import { usersApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface DepartmentFormProps {
  department: Department | null;
  onClose: (saved: boolean) => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<DepartmentFormData>({
    departmentCode: '',
    departmentName: '',
    departmentType: '',
    description: '',
    branchId: '',
    organizationId: '',
    parentDepartmentId: '',
    departmentHeadId: '',
    operatingHours: '',
    budget: 0,
    currency: 'INR',
    maxConcurrentPatients: 50,
    approvalWorkflowRequired: false,
    status: 'Active',
  });

  // Options
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [departmentTypes] = useState([
    'Clinical',
    'Administrative',
    'Support',
    'Diagnostic',
    'Therapeutic',
    'Emergency',
    'Surgical',
    'Medical',
  ]);

  useEffect(() => {
    if (department) {
      setFormData({
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        departmentType: department.departmentType,
        description: department.description || '',
        branchId: department.branchId,
        organizationId: department.organizationId || '',
        parentDepartmentId: department.parentDepartmentId || '',
        departmentHeadId: department.departmentHeadId || '',
        operatingHours: department.operatingHours || '',
        budget: department.budget || 0,
        currency: department.currency || 'INR',
        maxConcurrentPatients: department.maxConcurrentPatients || 50,
        approvalWorkflowRequired: department.approvalWorkflowRequired,
        status: department.status,
      });
    }

    loadOptions();
  }, [department]);

  const loadOptions = async () => {
    try {
      const [depts, usersData] = await Promise.all([
        departmentsApi.getAll(),
        usersApi.getAll(),
      ]);
      setDepartments(depts.filter((d) => d.id !== department?.id));
      setUsers(usersData.data || []);
    } catch (err) {
      console.error('Error loading options:', err);
    }
  };

  const handleChange = (field: keyof DepartmentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (department) {
        await departmentsApi.update(department.id, formData);
      } else {
        await departmentsApi.create(formData);
      }

      onClose(true);
    } catch (err: any) {
      console.error('Error saving department:', err);
      setError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Parent & Hierarchy' },
    { number: 3, title: 'Department Head' },
    { number: 4, title: 'Operating Hours' },
    { number: 5, title: 'Budget' },
    { number: 6, title: 'Workflow Settings' },
    { number: 7, title: 'Capacity Settings' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {department ? 'Edit Department' : 'Create New Department'}
            </h2>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-4 flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.number
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <p className="mt-1 hidden text-xs text-gray-600 md:block">{step.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.departmentCode}
                  onChange={(e) => handleChange('departmentCode', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="DEPT001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.departmentName}
                  onChange={(e) => handleChange('departmentName', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Cardiology"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department Type *
                </label>
                <select
                  value={formData.departmentType}
                  onChange={(e) => handleChange('departmentType', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Select Type</option>
                  {departmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  rows={3}
                  placeholder="Brief description of the department..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="UnderMaintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Parent & Hierarchy */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Parent Department & Hierarchy</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parent Department (Optional)
                </label>
                <select
                  value={formData.parentDepartmentId}
                  onChange={(e) => handleChange('parentDepartmentId', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">None (Top-level department)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName} ({dept.departmentCode})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Select a parent department to create a sub-department
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Department Head */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Department Head Assignment</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department Head (Optional)
                </label>
                <select
                  value={formData.departmentHeadId}
                  onChange={(e) => handleChange('departmentHeadId', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Select Department Head</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Operating Hours */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Operating Hours</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => handleChange('operatingHours', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM, Sat 9:00 AM - 1:00 PM"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Specify the department's operational hours
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Budget */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Budget & Currency</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', parseFloat(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Workflow Settings */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Approval Workflow Settings</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.approvalWorkflowRequired}
                  onChange={(e) => handleChange('approvalWorkflowRequired', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Require approval workflow for this department
                </label>
              </div>
              <p className="text-sm text-gray-500">
                When enabled, certain actions will require approval from department head or administrators
              </p>
            </div>
          )}

          {/* Step 7: Capacity Settings */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Capacity Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Concurrent Patients
                </label>
                <input
                  type="number"
                  value={formData.maxConcurrentPatients}
                  onChange={(e) => handleChange('maxConcurrentPatients', parseInt(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="50"
                  min="1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum number of patients that can be handled concurrently
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => onClose(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              {currentStep < 7 ? (
                <button
                  onClick={nextStep}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Saving...' : department ? 'Update Department' : 'Create Department'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;
