'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { departmentsApi } from '@/lib/api/departments.api';

interface Props {
  initialUser?: any;
  onClose?: () => void;
}

interface DepartmentAssignment {
  departmentId: string;
  departmentName: string;
  isPrimary: boolean;
  accessLevel: 'Full' | 'Read-only' | 'Approval-only';
}

export default function UserFormEnhanced({ initialUser, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    id: initialUser?.id || '',
    firstName: initialUser?.firstName || '',
    lastName: initialUser?.lastName || '',
    email: initialUser?.email || '',
    userName: initialUser?.userName || '',
    phoneNumber: initialUser?.phoneNumber || '',
    userType: initialUser?.userType || 'STAFF',
    password: '', // Required for new users
    
    // Professional Information
    designation: initialUser?.designation || '',
    specialization: initialUser?.specialization || '',
    licenseNumber: initialUser?.licenseNumber || '',
    professionalRegistrationDate: initialUser?.professionalRegistrationDate || '',
    
    // Organizational Assignment
    organizationId: initialUser?.organizationId || '',
    branchId: initialUser?.branchId || '',
    
    // Multi-Department Assignment
    departments: initialUser?.departments || [] as DepartmentAssignment[],
    
    // Other settings
    sendWelcomeEmail: true,
    setTemporaryPassword: false,
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentsApi.getAll();
      setDepartments(data);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleAddDepartment = () => {
    setForm({
      ...form,
      departments: [
        ...form.departments,
        {
          departmentId: '',
          departmentName: '',
          isPrimary: form.departments.length === 0,
          accessLevel: 'Full' as const,
        },
      ],
    });
  };

  const handleRemoveDepartment = (index: number) => {
    const newDepartments = form.departments.filter((_, i) => i !== index);
    // If removing primary department, make first one primary
    if (form.departments[index].isPrimary && newDepartments.length > 0) {
      newDepartments[0].isPrimary = true;
    }
    setForm({ ...form, departments: newDepartments });
  };

  const handleDepartmentChange = (index: number, field: keyof DepartmentAssignment, value: any) => {
    const newDepartments = [...form.departments];
    newDepartments[index] = { ...newDepartments[index], [field]: value };
    
    // If setting as primary, unset others
    if (field === 'isPrimary' && value === true) {
      newDepartments.forEach((dept, i) => {
        if (i !== index) dept.isPrimary = false;
      });
    }
    
    // Update department name when ID changes
    if (field === 'departmentId') {
      const dept = departments.find(d => d.id === value);
      if (dept) {
        newDepartments[index].departmentName = dept.departmentName;
      }
    }
    
    setForm({ ...form, departments: newDepartments });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (form.id) {
        // Update existing user
        const { password, sendWelcomeEmail, setTemporaryPassword, ...updateData } = form;
        await usersApi.update(form.id, updateData);
        
        // Update department assignments
        if (form.departments.length > 0) {
          await usersApi.assignDepartments(form.id, form.departments);
        }
      } else {
        // Create new user
        if (!form.password && !form.setTemporaryPassword) {
          alert('Password is required for new users');
          setIsSaving(false);
          return;
        }
        
        const newUser = await usersApi.create(form);
        
        // Assign departments if any
        if (form.departments.length > 0 && newUser.data?.id) {
          await usersApi.assignDepartments(newUser.data.id, form.departments);
        }
      }
      
      alert('User saved successfully!');
      onClose?.();
    } catch (err: any) {
      console.error('Error saving user:', err);
      const errorMessage = err.response?.data?.errors 
        ? err.response.data.errors.join(', ')
        : err.response?.data?.message || err.message || 'Failed to save user';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Professional Info & Departments' },
    { number: 3, title: 'Review & Submit' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep === step.number
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.number
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <p className="mt-2 text-xs text-gray-600">{step.title}</p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name <span className="text-red-500">*</span></label>
              <input 
                name="firstName" 
                value={form.firstName} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg" 
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
              <input 
                name="lastName" 
                value={form.lastName} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg" 
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
              <input 
                type="email"
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg" 
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <input 
                type="tel"
                name="phoneNumber" 
                value={form.phoneNumber} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Username <span className="text-red-500">*</span></label>
              <input 
                name="userName" 
                value={form.userName} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg" 
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">User Type <span className="text-red-500">*</span></label>
              <select 
                name="userType" 
                value={form.userType} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                required
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="RECEPTIONIST">Receptionist</option>
              </select>
            </div>
          </div>

          {!form.id && (
            <div>
              <label className="text-sm font-medium">
                Password {!form.setTemporaryPassword && <span className="text-red-500">*</span>}
              </label>
              <input 
                type="password"
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-3 py-2 rounded-lg" 
                required={!form.setTemporaryPassword}
                disabled={form.setTemporaryPassword}
              />
              <label className="mt-2 flex items-center text-sm">
                <input
                  type="checkbox"
                  name="setTemporaryPassword"
                  checked={form.setTemporaryPassword}
                  onChange={handleChange}
                  className="mr-2"
                />
                Set temporary password (user must change on first login)
              </label>
            </div>
          )}

          {!form.id && (
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                name="sendWelcomeEmail"
                checked={form.sendWelcomeEmail}
                onChange={handleChange}
                className="mr-2"
              />
              Send welcome email with login credentials
            </label>
          )}
        </div>
      )}

      {/* Step 2: Professional Info & Departments */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Designation</label>
                <input 
                  name="designation" 
                  value={form.designation} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  placeholder="e.g., Senior Consultant, Staff Nurse"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Specialization</label>
                <input 
                  name="specialization" 
                  value={form.specialization} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  placeholder="e.g., Cardiology, Orthopedics"
                />
              </div>
              <div>
                <label className="text-sm font-medium">License Number</label>
                <input 
                  name="licenseNumber" 
                  value={form.licenseNumber} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  placeholder="Professional license number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Registration Date</label>
                <input 
                  type="date"
                  name="professionalRegistrationDate" 
                  value={form.professionalRegistrationDate} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Department Assignments</h3>
              <button
                type="button"
                onClick={handleAddDepartment}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Add Department
              </button>
            </div>

            {form.departments.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <p className="text-gray-500">No departments assigned yet</p>
                <button
                  type="button"
                  onClick={handleAddDepartment}
                  className="mt-3 text-blue-600 hover:text-blue-700"
                >
                  Add first department →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {form.departments.map((dept, index) => (
                  <div key={index} className="rounded-lg border border-gray-300 bg-white p-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Department</label>
                        <select
                          value={dept.departmentId}
                          onChange={(e) => handleDepartmentChange(index, 'departmentId', e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.departmentName} ({d.departmentCode})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Access Level</label>
                        <select
                          value={dept.accessLevel}
                          onChange={(e) => handleDepartmentChange(index, 'accessLevel', e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        >
                          <option value="Full">Full Access</option>
                          <option value="Read-only">Read-only</option>
                          <option value="Approval-only">Approval-only</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={dept.isPrimary}
                          onChange={(e) => handleDepartmentChange(index, 'isPrimary', e.target.checked)}
                          className="mr-2"
                        />
                        Primary Department
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveDepartment(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Review Information</h3>
          
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-600">Name:</span> {form.firstName} {form.lastName}</div>
              <div><span className="text-gray-600">Email:</span> {form.email}</div>
              <div><span className="text-gray-600">Username:</span> {form.userName}</div>
              <div><span className="text-gray-600">User Type:</span> {form.userType}</div>
              {form.phoneNumber && <div><span className="text-gray-600">Phone:</span> {form.phoneNumber}</div>}
            </div>
          </div>

          {(form.designation || form.specialization || form.licenseNumber) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Professional Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {form.designation && <div><span className="text-gray-600">Designation:</span> {form.designation}</div>}
                {form.specialization && <div><span className="text-gray-600">Specialization:</span> {form.specialization}</div>}
                {form.licenseNumber && <div><span className="text-gray-600">License:</span> {form.licenseNumber}</div>}
              </div>
            </div>
          )}

          {form.departments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Department Assignments ({form.departments.length})</h4>
              <div className="space-y-2 text-sm">
                {form.departments.map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>
                      {dept.departmentName || 'Department'} 
                      {dept.isPrimary && <span className="ml-2 text-blue-600">(Primary)</span>}
                    </span>
                    <span className="text-gray-600">{dept.accessLevel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Previous
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onClose?.()} 
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : form.id ? 'Update User' : 'Create User'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
