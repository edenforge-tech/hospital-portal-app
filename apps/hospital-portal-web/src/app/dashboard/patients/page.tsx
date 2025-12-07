'use client';

import { useEffect, useState } from 'react';
import { patientApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionGate } from '@/components/permissions';
import PatientFormModal from '@/components/patients/PatientFormModal';
import PatientDetailsModal from '@/components/patients/PatientDetailsModal';
import { Search, Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';

interface Patient {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber?: string;
  email?: string;
  bloodGroup?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await patientApi.getAll();
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setError('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setShowFormModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowFormModal(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await patientApi.delete(patientId);
      setSuccess('Patient deleted successfully');
      fetchPatients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to delete patient:', error);
      setError('Failed to delete patient');
    }
  };

  const handlePatientSaved = () => {
    setSuccess('Patient saved successfully');
    fetchPatients();
    setTimeout(() => setSuccess(''), 3000);
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.contactNumber?.includes(searchQuery)
  );

  return (
    <ProtectedRoute requiredPermission="patient.view">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-gray-600 mt-1">Manage patient records and information</p>
            </div>
            <PermissionGate permission="patient.create">
              <button
                onClick={handleCreatePatient}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus size={20} />
                Add New Patient
              </button>
            </PermissionGate>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
              <button onClick={() => setError('')} className="float-right font-bold">×</button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name, MRN, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Patients Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="ml-4 text-gray-600">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchQuery ? 'No patients found' : 'No patients yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first patient'
                }
              </p>
              {!searchQuery && (
                <PermissionGate permission="patient.create">
                  <button
                    onClick={handleCreatePatient}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Add New Patient
                  </button>
                </PermissionGate>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MRN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age / Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {patient.medicalRecordNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {calculateAge(patient.dateOfBirth)} years
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {patient.gender}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patient.contactNumber || patient.email || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {patient.bloodGroup || 'Not set'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <PermissionGate permission="patient.view">
                              <button
                                onClick={() => handleViewPatient(patient)}
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                            </PermissionGate>
                            <PermissionGate permission="patient.update">
                              <button
                                onClick={() => handleEditPatient(patient)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Edit Patient"
                              >
                                <Edit size={16} />
                              </button>
                            </PermissionGate>
                            <PermissionGate permission="patient.delete">
                              <button
                                onClick={() => handleDeletePatient(patient.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete Patient"
                              >
                                <Trash2 size={16} />
                              </button>
                            </PermissionGate>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {filteredPatients.length} of {patients.length} patients
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          {showFormModal && (
            <PatientFormModal
              patient={selectedPatient || undefined}
              isOpen={showFormModal}
              onClose={() => {
                setShowFormModal(false);
                setSelectedPatient(null);
              }}
              onSave={handlePatientSaved}
            />
          )}

          {showDetailsModal && selectedPatient && (
            <PatientDetailsModal
              patientId={selectedPatient.id}
              isOpen={showDetailsModal}
              onClose={() => {
                setShowDetailsModal(false);
                setSelectedPatient(null);
              }}
              onEdit={() => {
                setShowDetailsModal(false);
                setShowFormModal(true);
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Helper function to calculate age
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}