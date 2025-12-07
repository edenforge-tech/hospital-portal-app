'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, Droplet, MapPin, FileText, Activity, Pill, AlertTriangle } from 'lucide-react';
import { patientApi, examinationApi } from '@/lib/api';

interface Patient {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Examination {
  id: string;
  examinationDate: string;
  examinationType: string;
  doctorName: string;
  departmentName: string;
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
  status: string;
}

interface PatientDetailsModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function PatientDetailsModal({
  patientId,
  isOpen,
  onClose,
  onEdit
}: PatientDetailsModalProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'examinations'>('details');

  useEffect(() => {
    if (isOpen && patientId) {
      loadPatientData();
    }
  }, [isOpen, patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const [patientResponse, examinationsResponse] = await Promise.all([
        patientApi.getById(patientId),
        examinationApi.getByPatient(patientId)
      ]);

      setPatient(patientResponse.data);
      setExaminations(examinationsResponse.data || []);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  if (loading || !patient) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading patient details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>MRN: {patient.medicalRecordNumber}</span>
                <span>Age: {calculateAge(patient.dateOfBirth)} years</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Edit Patient
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'details', label: 'Patient Details', icon: User },
                { id: 'history', label: 'Medical History', icon: Activity },
                { id: 'examinations', label: 'Examinations', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplet className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="font-medium">{patient.bloodGroup || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.contactNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{patient.contactNumber}</p>
                      </div>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{patient.email}</p>
                      </div>
                    </div>
                  )}
                  {patient.address && (
                    <div className="md:col-span-2 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{patient.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {(patient.emergencyContactName || patient.emergencyContactNumber) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.emergencyContactName && (
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{patient.emergencyContactName}</p>
                      </div>
                    )}
                    {patient.emergencyContactNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{patient.emergencyContactNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                <div className="space-y-4">
                  {patient.allergies && (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Allergies</p>
                        <p className="font-medium text-red-700">{patient.allergies}</p>
                      </div>
                    </div>
                  )}
                  {patient.medicalConditions && (
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Medical Conditions</p>
                        <p className="font-medium">{patient.medicalConditions}</p>
                      </div>
                    </div>
                  )}
                  {patient.medications && (
                    <div className="flex items-start gap-3">
                      <Pill className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Current Medications</p>
                        <p className="font-medium">{patient.medications}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Information */}
              {(patient.insuranceProvider || patient.insuranceNumber) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.insuranceProvider && (
                      <div>
                        <p className="text-sm text-gray-500">Provider</p>
                        <p className="font-medium">{patient.insuranceProvider}</p>
                      </div>
                    )}
                    {patient.insuranceNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Policy Number</p>
                        <p className="font-medium">{patient.insuranceNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {patient.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{patient.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Medical history feature coming soon</p>
                <p className="text-sm text-gray-500 mt-2">
                  This will include past diagnoses, treatments, and medical records
                </p>
              </div>
            </div>
          )}

          {activeTab === 'examinations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Examination History</h3>
                <span className="text-sm text-gray-600">{examinations.length} examinations</span>
              </div>

              {examinations.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No examinations found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Examination records will appear here once created
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {examinations.map((exam) => (
                    <div key={exam.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{exam.examinationType}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(exam.examinationDate)} • Dr. {exam.doctorName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                          exam.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {exam.status}
                        </span>
                      </div>

                      {exam.diagnosis && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                          <p className="text-sm text-gray-600">{exam.diagnosis}</p>
                        </div>
                      )}

                      {exam.symptoms && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Symptoms:</p>
                          <p className="text-sm text-gray-600">{exam.symptoms}</p>
                        </div>
                      )}

                      {exam.treatment && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Treatment:</p>
                          <p className="text-sm text-gray-600">{exam.treatment}</p>
                        </div>
                      )}

                      {exam.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Notes:</p>
                          <p className="text-sm text-gray-600">{exam.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}