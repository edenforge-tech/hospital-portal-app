'use client';

import React, { useState } from 'react';
import { X, LogIn, Users, User, FileText, Calendar } from 'lucide-react';

interface CheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (data: CheckInData) => void;
  patientName: string;
  isLoading?: boolean;
}

export interface CheckInData {
  departmentId: string;
  doctorId?: string;
  checkInType: 'appointment' | 'walk-in';
  reasonForVisit: string;
  appointmentId?: string;
}

const mockDepartments = [
  { id: 'dept-001', name: 'Ophthalmology' },
  { id: 'dept-002', name: 'Optometry' },
  { id: 'dept-003', name: 'Retina Clinic' },
  { id: 'dept-004', name: 'Glaucoma Clinic' },
  { id: 'dept-005', name: 'Pediatric Ophthalmology' }
];

const mockDoctors = [
  { id: 'doc-001', name: 'Dr. Johnson', department: 'dept-001' },
  { id: 'doc-002', name: 'Dr. Anderson', department: 'dept-002' },
  { id: 'doc-003', name: 'Dr. Smith', department: 'dept-001' },
  { id: 'doc-004', name: 'Dr. Wilson', department: 'dept-003' }
];

export const CheckInDialog: React.FC<CheckInDialogProps> = ({
  isOpen,
  onClose,
  onCheckIn,
  patientName,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CheckInData>({
    departmentId: '',
    doctorId: '',
    checkInType: 'walk-in',
    reasonForVisit: ''
  });

  const filteredDoctors = formData.departmentId
    ? mockDoctors.filter(d => d.department === formData.departmentId)
    : mockDoctors;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckIn(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Check-In Patient</h2>
              <p className="text-sm text-gray-600">{patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Check-In Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Check-In Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, checkInType: 'walk-in' })}
                className={`p-3 border-2 rounded-lg transition-all ${
                  formData.checkInType === 'walk-in'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm font-medium">Walk-In</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, checkInType: 'appointment' })}
                className={`p-3 border-2 rounded-lg transition-all ${
                  formData.checkInType === 'appointment'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm font-medium">Appointment</p>
              </button>
            </div>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Department *
            </label>
            <select
              required
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value, doctorId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Department</option>
              {mockDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Doctor Selection (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Preferred Doctor (Optional)
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              disabled={!formData.departmentId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Any Available Doctor</option>
              {filteredDoctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Reason for Visit *
            </label>
            <textarea
              required
              value={formData.reasonForVisit}
              onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
              placeholder="Brief description of symptoms or reason for visit..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.departmentId || !formData.reasonForVisit}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Checking In...' : 'Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
