'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Users, Clock, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { getApi } from '@/lib/api';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  mrn?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
}

interface Department {
  id: string;
  name: string;
}

export default function AppointmentModal({ isOpen, onClose, onSuccess }: AppointmentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const loadFormData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const api = getApi();
      
      // Load patients
      try {
        const patientsRes = await api.get('/patients');
        const patientsData = Array.isArray(patientsRes.data) ? patientsRes.data : 
                            patientsRes.data?.data ? patientsRes.data.data : [];
        setPatients(patientsData);
      } catch (err: any) {
        console.error('Failed to load patients:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
        }
      }

      // Load doctors
      try {
        const usersRes = await api.get('/users/with-details');
        const doctors = usersRes.data.filter((u: any) => u.userType === 'Doctor');
        setDoctors(doctors);
      } catch (err: any) {
        console.error('Failed to load doctors:', err);
      }

      // Load departments
      try {
        const deptsRes = await api.get('/departments');
        const deptsData = Array.isArray(deptsRes.data) ? deptsRes.data : 
                         deptsRes.data?.data ? deptsRes.data.data : [];
        setDepartments(deptsData);
      } catch (err: any) {
        console.error('Failed to load departments:', err);
      }

    } catch (err: any) {
      console.error('Error loading form data:', err);
      setError('Failed to load form data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedDoctor || !appointmentDate || !appointmentTime) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const api = getApi();
      
      const appointmentData = {
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        departmentId: selectedDepartment || null,
        appointmentDate: `${appointmentDate}T${appointmentTime}:00`,
        appointmentType,
        status: 'scheduled',
        notes,
        paymentMethod,
        paymentStatus: 'pending'
      };

      await api.post('/appointments', appointmentData);
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Failed to create appointment:', err);
      setError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedPatient('');
    setSelectedDoctor('');
    setSelectedDepartment('');
    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentType('consultation');
    setNotes('');
    setPaymentMethod('cash');
    setError('');
    onClose();
  };

  const nextStep = () => {
    setError('');
    if (currentStep === 1 && (!selectedPatient || !selectedDoctor)) {
      setError('Please select both patient and doctor');
      return;
    }
    if (currentStep === 2 && (!appointmentDate || !appointmentTime)) {
      setError('Please select date and time');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'Patient & Doctor', icon: Users },
    { num: 2, title: 'Date & Time', icon: Calendar },
    { num: 3, title: 'Details', icon: FileText },
    { num: 4, title: 'Confirm', icon: CheckCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Book Appointment</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.num 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium ${
                    currentStep >= step.num ? 'text-teal-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.num ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-600 text-sm">{error}</span>
            {error.includes('log in') && (
              <a href="/auth/login" className="text-red-700 underline text-sm ml-auto">
                Log in →
              </a>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Patient & Doctor */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient *
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select a patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} {p.mrn ? `(${p.mrn})` : ''} {p.phone ? `- ${p.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor *
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select a doctor...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.firstName} {d.lastName} {d.specialization ? `- ${d.specialization}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department (Optional)
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select a department...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="consultation">Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="checkup">Check-up</option>
                  <option value="procedure">Procedure</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any additional notes or special instructions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Appointment Details</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-medium text-gray-900">
                    {patients.find(p => p.id === selectedPatient)?.firstName} {patients.find(p => p.id === selectedPatient)?.lastName}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium text-gray-900">
                    Dr. {doctors.find(d => d.id === selectedDoctor)?.firstName} {doctors.find(d => d.id === selectedDoctor)?.lastName}
                  </span>
                </div>
                
                {selectedDepartment && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-gray-900">
                      {departments.find(d => d.id === selectedDepartment)?.name}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(appointmentDate).toLocaleDateString()} at {appointmentTime}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{appointmentType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium text-gray-900 capitalize">{paymentMethod}</span>
                </div>
                
                {notes && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 block mb-1">Notes:</span>
                    <span className="text-gray-900">{notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          
          <span className="text-sm text-gray-500">Step {currentStep} of 4</span>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? 'Creating...' : 'Book Appointment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
