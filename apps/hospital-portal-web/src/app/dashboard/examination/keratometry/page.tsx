'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { keratometryApi } from '@/lib/api/examination.api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useHasPermission } from '@/hooks/use-permissions';
import KeratometryForm from '@/components/examination/KeratometryForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function KeratometryPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const { 
    currentPatient, 
    keratometry, 
    updateKeratometry,
    setLoading, 
    setError 
  } = useClinicalStore();
  
  const canView = useHasPermission('CLINICAL:EXAMINATION:VIEW');
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  useEffect(() => {
    if (patientId) {
      loadKeratometry(patientId);
    }
  }, [patientId]);

  const loadKeratometry = async (pid: string) => {
    try {
      setLoading(true);
      const data = await keratometryApi.get(pid);
      updateKeratometry(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load keratometry:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load keratometry data');
        toast.error('Failed to load keratometry data');
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
      
      if (keratometry?.id) {
        await keratometryApi.update(keratometry.id, data);
        toast.success('Keratometry updated successfully');
      } else {
        await keratometryApi.save(data);
        toast.success('Keratometry saved successfully');
      }
      
      if (patientId) {
        await loadKeratometry(patientId);
      }
      
      // Check for keratoconus alerts
      if (data.keratoconusSuspectOD || data.keratoconusSuspectOS) {
        toast.error('⚠️ KERATOCONUS SUSPECT: Irregular astigmatism detected. Consider corneal topography.', {
          duration: 8000,
        });
      }
      
      setError(null);
    } catch (error: any) {
      console.error('Failed to save keratometry:', error);
      setError('Failed to save keratometry data');
      toast.error('Failed to save keratometry data');
    } finally {
      setLoading(false);
    }
  };

  if (!patientId) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Keratometry</h1>
          <p className="text-gray-600">Search and select a patient to measure corneal curvature.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/keratometry"
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
              <h1 className="text-2xl font-bold text-gray-900">Keratometry - Corneal Curvature Measurement</h1>
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
                <span className="font-semibold text-blue-900">Age:</span>
                <span className="ml-2 text-blue-700">
                  {new Date().getFullYear() - new Date(currentPatient.dateOfBirth).getFullYear()} years
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Keratoconus Alert */}
        {keratometry && (keratometry.keratoconusSuspectOD || keratometry.keratoconusSuspectOS) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">⚠️ Keratoconus Suspect Detected</h3>
                <div className="mt-2 space-y-1 text-sm text-red-800">
                  {keratometry.keratoconusSuspectOD && (
                    <p>• <strong>OD (Right Eye):</strong> Irregular astigmatism or steep K readings detected</p>
                  )}
                  {keratometry.keratoconusSuspectOS && (
                    <p>• <strong>OS (Left Eye):</strong> Irregular astigmatism or steep K readings detected</p>
                  )}
                </div>
                <p className="mt-3 text-sm font-medium text-red-900">
                  Recommended Action: Corneal topography (Pentacam/Orbscan), pachymetry, and ophthalmology referral
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Keratometry Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Keratometry Measurement</h2>
            <p className="text-sm text-gray-600 mb-6">
              Measure corneal curvature for contact lens fitting, IOL power calculation, and astigmatism analysis.
            </p>
            <KeratometryForm 
              initialData={keratometry}
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
