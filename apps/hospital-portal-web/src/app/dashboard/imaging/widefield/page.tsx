'use client';

import { useState } from 'react';
import UltraWidefieldForm from '@/components/imaging/UltraWidefieldForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';
import { ultraWidefieldApi } from '@/lib/api/examination.api';
import { usePermissions } from '@/hooks/usePermissions';
import { Patient } from '@/lib/types/patient.types';

export default function UltraWidefieldPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState(null);

  const { hasPermission } = usePermissions();
  const canView = hasPermission('view:ultra_widefield');
  const canCreate = hasPermission('create:ultra_widefield');
  const canUpdate = hasPermission('update:ultra_widefield');

  const handlePatientSelect = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsLoading(true);
    setError(null);

    try {
      const data = await ultraWidefieldApi.get(patient.id);
      setInitialData(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Failed to load ultra-widefield data');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (initialData) {
        await ultraWidefieldApi.update(data);
      } else {
        await ultraWidefieldApi.save(data);
      }
      alert('Ultra-widefield data saved successfully');
    } catch (err) {
      console.error('Failed to save ultra-widefield data:', err);
      throw err;
    }
  };

  if (!canView) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          You do not have permission to view ultra-widefield imaging.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ultra-Widefield Retinal Imaging</h1>
        <p className="text-sm text-gray-600 mt-1">
          Optos 200° peripheral retina imaging - Retinal tears, detachment, peripheral lesions
        </p>
      </div>

      {!selectedPatient ? (
        <PatientSearchSelector onSelect={handlePatientSelect} />
      ) : (
        <div>
          <div className="bg-white shadow rounded-lg p-4 mb-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Current Patient</p>
              <p className="font-semibold text-gray-900">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-sm text-gray-600">MRN: {selectedPatient.mrn}</p>
            </div>
            <button onClick={() => { setSelectedPatient(null); setInitialData(null); setError(null); }} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Change Patient
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <UltraWidefieldForm patientId={selectedPatient.id} initialData={initialData} onSave={handleSave} readOnly={!canCreate && !canUpdate} />
          )}
        </div>
      )}
    </div>
  );
}
