'use client';

import { useState } from 'react';
import ElectrophysiologyForm from '@/components/imaging/ElectrophysiologyForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';
import { electrophysiologyApi } from '@/lib/api/examination.api';
import { usePermissions } from '@/hooks/usePermissions';
import { Patient } from '@/lib/types/patient.types';

export default function ElectrophysiologyPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState(null);

  const { hasPermission } = usePermissions();
  const canView = hasPermission('view:electrophysiology');
  const canCreate = hasPermission('create:electrophysiology');
  const canUpdate = hasPermission('update:electrophysiology');

  const handlePatientSelect = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsLoading(true);
    setError(null);

    try {
      const data = await electrophysiologyApi.get(patient.id);
      setInitialData(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Failed to load electrophysiology data');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (initialData) {
        await electrophysiologyApi.update(data);
      } else {
        await electrophysiologyApi.save(data);
      }
      alert('Electrophysiology data saved successfully');
    } catch (err) {
      console.error('Failed to save electrophysiology data:', err);
      throw err;
    }
  };

  if (!canView) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          You do not have permission to view electrophysiology tests.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Electrophysiology Testing</h1>
        <p className="text-sm text-gray-600 mt-1">
          ERG, VEP, EOG, Multifocal ERG - Retinal and visual pathway functional testing
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
            <button
              onClick={() => {
                setSelectedPatient(null);
                setInitialData(null);
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Change Patient
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <ElectrophysiologyForm
              patientId={selectedPatient.id}
              initialData={initialData}
              onSave={handleSave}
              readOnly={!canCreate && !canUpdate}
            />
          )}
        </div>
      )}
    </div>
  );
}
