'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { patientApi } from '@/lib/api/patients.api';
import { appointmentsApi } from '@/lib/api/appointments.api';
import { examinationApi } from '@/lib/api/examinations.api';
import { EyeHistoryPanel } from '@/components/patients/EyeHistoryPanel';

interface PatientDetails {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  patientCode: string;
  bloodGroup: string;
  allergies: string[];
  medicalHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  status: string;
  createdAt: string;
  lastVisit?: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentType: string;
  status: string;
  doctorName: string;
  notes: string;
}

interface Examination {
  id: string;
  examinationDate: string;
  examinationType: string;
  findings: string;
  diagnosis: string;
  prescriptions: string;
}

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'eye-history' | 'appointments' | 'examinations' | 'history'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [patientRes, appointmentsRes, examinationsRes] = await Promise.all([
        patientApi.getById(patientId),
        appointmentsApi.getByPatient(patientId),
        examinationApi.getByPatient(patientId)
      ]);

      setPatient(patientRes.data);
      setAppointments(appointmentsRes.data);
      setExaminations(examinationsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load patient data');
      console.error('Error loading patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!patient) return;

    try {
      await patientApi.update(patientId, patient);
      setIsEditing(false);
      alert('Patient updated successfully!');
    } catch (err: any) {
      alert('Failed to update patient: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await patientApi.delete(patientId);
      alert('Patient deleted successfully');
      router.push('/dashboard/patients');
    } catch (err: any) {
      alert('Failed to delete patient: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Patient not found'}</p>
          <button
            onClick={() => router.push('/dashboard/patients')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-600 mt-1">Patient ID: {patient.patientCode}</p>
            <div className="flex gap-4 mt-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {patient.status}
              </span>
              {patient.bloodGroup && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Blood: {patient.bloodGroup}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadPatientData();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['details', 'eye-history', 'appointments', 'examinations', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'eye-history' ? '👁️ Eye History' : tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={patient.firstName}
                      onChange={(e) => setPatient({ ...patient, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={patient.lastName}
                      onChange={(e) => setPatient({ ...patient, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      value={patient.dateOfBirth?.split('T')[0]}
                      onChange={(e) => setPatient({ ...patient, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      value={patient.gender}
                      onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <input
                      type="text"
                      value={patient.bloodGroup || ''}
                      onChange={(e) => setPatient({ ...patient, bloodGroup: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={patient.email || ''}
                      onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={patient.phone || ''}
                      onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      value={patient.address || ''}
                      onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        value={patient.city || ''}
                        onChange={(e) => setPatient({ ...patient, city: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        value={patient.state || ''}
                        onChange={(e) => setPatient({ ...patient, state: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input
                        type="text"
                        value={patient.postalCode || ''}
                        onChange={(e) => setPatient({ ...patient, postalCode: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <h3 className="text-lg font-semibold mb-4 mt-6">Emergency Contact</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={patient.emergencyContactName || ''}
                      onChange={(e) => setPatient({ ...patient, emergencyContactName: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={patient.emergencyContactPhone || ''}
                      onChange={(e) => setPatient({ ...patient, emergencyContactPhone: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relation</label>
                    <input
                      type="text"
                      value={patient.emergencyContactRelation || ''}
                      onChange={(e) => setPatient({ ...patient, emergencyContactRelation: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information - Full Width */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <input
                      type="text"
                      value={patient.allergies?.join(', ') || ''}
                      onChange={(e) => setPatient({ ...patient, allergies: e.target.value.split(',').map(a => a.trim()) })}
                      disabled={!isEditing}
                      placeholder="Separate multiple allergies with commas"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medical History</label>
                    <textarea
                      value={patient.medicalHistory || ''}
                      onChange={(e) => setPatient({ ...patient, medicalHistory: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                      <input
                        type="text"
                        value={patient.insuranceProvider || ''}
                        onChange={(e) => setPatient({ ...patient, insuranceProvider: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                      <input
                        type="text"
                        value={patient.insurancePolicyNumber || ''}
                        onChange={(e) => setPatient({ ...patient, insurancePolicyNumber: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eye-history' && (
            <EyeHistoryPanel patientId={patientId} />
          )}

          {activeTab === 'appointments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Appointments ({appointments.length})</h3>
                <button
                  onClick={() => router.push(`/dashboard/appointments/schedule?patientId=${patientId}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Book Appointment
                </button>
              </div>
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No appointments found</p>
                ) : (
                  appointments.map((apt) => (
                    <div key={apt.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{apt.appointmentType} - Dr. {apt.doctorName}</p>
                          {apt.notes && <p className="text-sm text-gray-500 mt-1">{apt.notes}</p>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          apt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'examinations' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Clinical Examinations ({examinations.length})</h3>
                <button
                  onClick={() => router.push(`/dashboard/examinations?patientId=${patientId}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  New Examination
                </button>
              </div>
              <div className="space-y-3">
                {examinations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No examinations found</p>
                ) : (
                  examinations.map((exam) => (
                    <div key={exam.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{exam.examinationType}</p>
                          <p className="text-sm text-gray-600">{new Date(exam.examinationDate).toLocaleDateString()}</p>
                          {exam.diagnosis && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                              <p className="text-sm text-gray-600">{exam.diagnosis}</p>
                            </div>
                          )}
                          {exam.findings && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Findings:</p>
                              <p className="text-sm text-gray-600">{exam.findings}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Patient History Timeline</h3>
              <div className="space-y-4">
                <div className="border-l-2 border-blue-600 pl-4">
                  <p className="text-sm text-gray-500">Registered</p>
                  <p className="font-medium">{new Date(patient.createdAt).toLocaleDateString()}</p>
                </div>
                {patient.lastVisit && (
                  <div className="border-l-2 border-green-600 pl-4">
                    <p className="text-sm text-gray-500">Last Visit</p>
                    <p className="font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                  </div>
                )}
                <div className="border-l-2 border-gray-300 pl-4">
                  <p className="text-sm text-gray-500">Total Appointments</p>
                  <p className="font-medium">{appointments.length}</p>
                </div>
                <div className="border-l-2 border-gray-300 pl-4">
                  <p className="text-sm text-gray-500">Total Examinations</p>
                  <p className="font-medium">{examinations.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
