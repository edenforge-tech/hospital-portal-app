'use client';

import { useState } from 'react';
import { X, UserPlus, User, Phone, Clock } from 'lucide-react';

interface VisitorManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisitorManagementModal({ isOpen, onClose }: VisitorManagementModalProps) {
  const [formData, setFormData] = useState({
    visitorName: '',
    phoneNumber: '',
    purposeOfVisit: '',
    visitingPerson: '',
    department: '',
    idProof: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to register visitor
    console.log('Registering visitor:', formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-purple-50">
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-slate-900">Visitor Management</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-4">
            {/* Visitor Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Visitor Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.visitorName}
                  onChange={(e) => handleInputChange('visitorName', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter visitor name"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Purpose of Visit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Purpose of Visit *
              </label>
              <select
                required
                value={formData.purposeOfVisit}
                onChange={(e) => handleInputChange('purposeOfVisit', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select purpose</option>
                <option value="patient-visit">Patient Visit</option>
                <option value="meeting">Meeting</option>
                <option value="delivery">Delivery</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Visiting Person */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Visiting Person/Patient
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.visitingPerson}
                  onChange={(e) => handleInputChange('visitingPerson', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Name of person/patient being visited"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                  <option value="">Select department</option>
                  <option value="ophthalmology">Ophthalmology</option>
                  <option value="general">General Medicine</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="emergency">Emergency</option>
                  <option value="administration">Administration</option>
                </select>
            </div>

            {/* ID Proof */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ID Proof Type *
              </label>
              <select
                required
                value={formData.idProof}
                onChange={(e) => handleInputChange('idProof', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select ID proof</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="passport">Passport</option>
                <option value="driving-license">Driving License</option>
                <option value="voter-id">Voter ID</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Visitor Entry</p>
                  <p className="text-xs text-purple-700 mt-1">
                    The visitor will receive a visitor pass upon check-in. Please ensure all details are accurate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Register Visitor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
