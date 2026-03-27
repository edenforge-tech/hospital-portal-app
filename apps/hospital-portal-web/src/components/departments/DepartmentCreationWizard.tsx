'use client';

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Building2, FileText, Settings, UserCheck, CheckCircle } from 'lucide-react';

interface DepartmentFormData {
  departmentCode: string;
  departmentName: string;
  description: string;
  departmentType: string;
  branchId: string;
  parentDepartmentId: string | null;
  departmentHeadId: string | null;
  is24x7: boolean;
  requiresApproval: boolean;
  approvalLevel: number | null;
  maxConcurrentPatients: number | null;
  waitingRoomCapacity: number | null;
  status: string;
}

interface DepartmentCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData, templateName?: string) => Promise<void>;
  branches: Array<{ id: string; branchName: string }>;
  users: Array<{ id: string; firstName: string; lastName: string; email: string }>;
  departments: Array<{ id: string; departmentName: string }>;
  templates: string[];
}

const DEPARTMENT_TYPES = [
  'Emergency',
  'Cardiology',
  'Surgery',
  'Pediatrics',
  'Laboratory',
  'Radiology',
  'Neurology',
  'Orthopedics',
  'Oncology',
  'Obstetrics',
  'Other'
];

export const DepartmentCreationWizard: React.FC<DepartmentCreationWizardProps> = ({
  isOpen,
  onClose,
  onSubmit,
  branches,
  users,
  departments,
  templates
}) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<DepartmentFormData>({
    departmentCode: '',
    departmentName: '',
    description: '',
    departmentType: 'Other',
    branchId: branches[0]?.id || '',
    parentDepartmentId: null,
    departmentHeadId: null,
    is24x7: false,
    requiresApproval: false,
    approvalLevel: null,
    maxConcurrentPatients: null,
    waitingRoomCapacity: null,
    status: 'active'
  });
  
  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.departmentCode || !formData.departmentName || !formData.branchId) {
        alert('Please fill in all required fields');
        return;
      }
    }
    setStep(step + 1);
  };
  
  const handleBack = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData, selectedTemplate || undefined);
      onClose();
      // Reset form
      setStep(1);
      setSelectedTemplate(null);
      setFormData({
        departmentCode: '',
        departmentName: '',
        description: '',
        departmentType: 'Other',
        branchId: branches[0]?.id || '',
        parentDepartmentId: null,
        departmentHeadId: null,
        is24x7: false,
        requiresApproval: false,
        approvalLevel: null,
        maxConcurrentPatients: null,
        waitingRoomCapacity: null,
        status: 'active'
      });
    } catch (error: any) {
      alert(error.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  const steps = [
    { number: 1, title: 'Basic Info', icon: Building2 },
    { number: 2, title: 'Template', icon: FileText },
    { number: 3, title: 'Configuration', icon: Settings },
    { number: 4, title: 'Department Head', icon: UserCheck },
    { number: 5, title: 'Review', icon: CheckCircle }
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New Department</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          {steps.map((s, idx) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step >= s.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step > s.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <s.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-xs mt-2 ${step >= s.number ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.number ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.departmentCode}
                  onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., CARD-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  placeholder="e.g., Cardiology Department"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the department"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.departmentType}
                  onChange={(e) => setFormData({ ...formData, departmentType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DEPARTMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.branchName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Department (Optional)</label>
                <select
                  value={formData.parentDepartmentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentDepartmentId: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None (Top Level)</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {/* Step 2: Template Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Choose a template to pre-configure your department with recommended settings and sub-departments, or start from scratch.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    checked={selectedTemplate === null}
                    onChange={() => setSelectedTemplate(null)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Start from Scratch</div>
                    <div className="text-sm text-gray-500">Configure everything manually</div>
                  </div>
                </label>
                
                {templates.map(template => (
                  <label
                    key={template}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTemplate === template ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedTemplate === template}
                      onChange={() => setSelectedTemplate(template)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{template}</div>
                      <div className="text-sm text-gray-500">
                        Pre-configured with standard settings and sub-departments
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 3: Configuration */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is24x7}
                    onChange={(e) => setFormData({ ...formData, is24x7: e.target.checked })}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm font-medium">24/7 Operations</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm font-medium">Requires Approval</span>
                </label>
              </div>
              
              {formData.requiresApproval && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approval Level</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.approvalLevel || ''}
                    onChange={(e) => setFormData({ ...formData, approvalLevel: parseInt(e.target.value) || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Patients</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxConcurrentPatients || ''}
                  onChange={(e) => setFormData({ ...formData, maxConcurrentPatients: parseInt(e.target.value) || null })}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waiting Room Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.waitingRoomCapacity || ''}
                  onChange={(e) => setFormData({ ...formData, waitingRoomCapacity: parseInt(e.target.value) || null })}
                  placeholder="e.g., 30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Step 4: Department Head */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Assign a department head who will be responsible for managing this department.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department Head (Optional)</label>
                <select
                  value={formData.departmentHeadId || ''}
                  onChange={(e) => setFormData({ ...formData, departmentHeadId: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Review Your Department</h3>
                <p className="text-sm text-blue-800">
                  Please review the information below before creating the department.
                  {selectedTemplate && ` This will create the department using the "${selectedTemplate}" template with pre-configured sub-departments.`}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Department Code</label>
                  <p className="text-gray-900">{formData.departmentCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department Name</label>
                  <p className="text-gray-900">{formData.departmentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-gray-900">{formData.departmentType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Template</label>
                  <p className="text-gray-900">{selectedTemplate || 'Custom (No Template)'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">24/7 Operations</label>
                  <p className="text-gray-900">{formData.is24x7 ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requires Approval</label>
                  <p className="text-gray-900">{formData.requiresApproval ? `Yes (Level ${formData.approvalLevel})` : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Max Concurrent Patients</label>
                  <p className="text-gray-900">{formData.maxConcurrentPatients || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Waiting Room Capacity</label>
                  <p className="text-gray-900">{formData.waitingRoomCapacity || 'Not set'}</p>
                </div>
              </div>
              
              {formData.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{formData.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            {step === 1 ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Back
              </>
            )}
          </button>
          
          <div className="text-sm text-gray-500">
            Step {step} of {steps.length}
          </div>
          
          {step < 5 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Department'}
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
