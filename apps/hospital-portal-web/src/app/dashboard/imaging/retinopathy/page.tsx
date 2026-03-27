'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { usePermissions } from '@/hooks/use-permissions';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';
import RetinopathyScreeningForm from '@/components/imaging/RetinopathyScreeningForm';
import { retinopathyScreeningApi } from '@/lib/api/retinopathy-screening.api';
import { AlertCircle, Camera } from 'lucide-react';

export default function RetinopathyScreeningPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const { currentPatient } = useClinicalStore();
  const { user } = useAuthStore();
  const { can } = usePermissions();
  
  const [screeningData, setScreeningData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canView = can('view:retinopathy_screening');
  const canCreate = can('create:retinopathy_screening');
  const canEdit = can('update:retinopathy_screening');
  
  useEffect(() => {
    if (patientId && canView) {
      loadScreeningData(patientId);
    }
  }, [patientId, canView]);
  
  const loadScreeningData = async (pid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await retinopathyScreeningApi.get(pid);
      setScreeningData(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load screening data');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (screeningData?.id) {
        await retinopathyScreeningApi.update(screeningData.id, data);
      } else {
        await retinopathyScreeningApi.save(data);
      }
      
      router.push(`/dashboard/imaging/retinopathy?patientId=${patientId}`);
      loadScreeningData(patientId!);
    } catch (err: any) {
      setError(err.message || 'Failed to save screening data');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!canView) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to view diabetic retinopathy screening.</p>
        </div>
      </div>
    );
  }
  
  if (!patientId || !currentPatient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Camera className="h-8 w-8 mr-3 text-red-600" />
              Diabetic Retinopathy Screening
            </h1>
            <p className="text-gray-600 mt-2">
              ETDRS Grading for DR & DME Severity
            </p>
          </div>
        </div>
        
        <PatientSearchSelector currentPath="/dashboard/imaging/retinopathy" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Camera className="h-8 w-8 mr-3 text-red-600" />
            DR Screening - {currentPatient.firstName} {currentPatient.lastName}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            MRN: {currentPatient.medicalRecordNumber}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/imaging/retinopathy')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Change Patient
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <RetinopathyScreeningForm
          initialData={screeningData}
          patientId={patientId}
          onSave={handleSave}
          canEdit={canEdit || canCreate}
        />
      )}
    </div>
  );
}
