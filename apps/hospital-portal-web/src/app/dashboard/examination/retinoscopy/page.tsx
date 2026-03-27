'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { retinoscopyApi } from '@/lib/api/examination.api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useHasPermission } from '@/hooks/use-permissions';
import RetinoscopyForm from '@/components/examination/RetinoscopyForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RetinoscopyPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const { currentPatient, retinoscopy, updateRetinoscopy, setLoading, setError } = useClinicalStore();
  const canView = useHasPermission('CLINICAL:EXAMINATION:VIEW');
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  useEffect(() => {
    if (patientId) {
      loadRetinoscopy(patientId);
    }
  }, [patientId]);

  const loadRetinoscopy = async (pid: string) => {
    try {
      setLoading(true);
      const data = await retinoscopyApi.get(pid);
      updateRetinoscopy(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load retinoscopy:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load retinoscopy data');
        toast.error('Failed to load retinoscopy data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit examinations');
      return;
    }

    try {
      setLoading(true);
      
      if (retinoscopy?.id) {
        await retinoscopyApi.update(retinoscopy.id, data);
        toast.success('Retinoscopy updated successfully');
      } else {
        await retinoscopyApi.save(data);
        toast.success('Retinoscopy saved successfully');
      }
      
      if (patientId) {
        await loadRetinoscopy(patientId);
      }
      
      setError(null);
    } catch (error: any) {
      console.error('Failed to save retinoscopy:', error);
      setError('Failed to save retinoscopy data');
      toast.error('Failed to save retinoscopy data');
    } finally {
      setLoading(false);
    }
  };

  if (!patientId) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Retinoscopy</h1>
          <p className="text-gray-600">Search and select a patient to begin retinoscopy examination.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/retinoscopy"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900">Quick Tip</h3>
              <p className="text-blue-800 mt-1">
                Use the search box above to find a patient by name, MRN, email, or phone number.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/dashboard/patients/${patientId}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Retinoscopy</h1>
              {currentPatient && (
                <p className="text-gray-600 mt-1">
                  Patient: {currentPatient.firstName} {currentPatient.lastName} (MRN: {currentPatient.mrn})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Patient Info Card */}
        {currentPatient && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-blue-900">Name:</span>
                <span className="ml-2 text-blue-700">{currentPatient.firstName} {currentPatient.lastName}</span>
              </div>
              <div>
                <span className="font-semibold text-blue-900">MRN:</span>
                <span className="ml-2 text-blue-700">{currentPatient.mrn}</span>
              </div>
              <div>
                <span className="font-semibold text-blue-900">DOB:</span>
                <span className="ml-2 text-blue-700">
                  {new Date(currentPatient.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-semibold text-blue-900">Gender:</span>
                <span className="ml-2 text-blue-700">{currentPatient.gender}</span>
              </div>
            </div>
          </div>
        )}

        {/* Retinoscopy Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Objective Refraction - Retinoscopy</h2>
            <p className="text-sm text-gray-600 mb-6">
              Measure the refractive error objectively by observing the reflex from the retina
            </p>
            <RetinoscopyForm 
              initialData={retinoscopy}
              patientId={patientId}
              onSave={handleSave}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
