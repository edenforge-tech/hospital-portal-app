'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { visualFieldApi } from '@/lib/api/examination.api';
import { VisualFieldData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import VisualFieldForm from '@/components/examination/VisualFieldForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';

function VisualFieldPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams?.get('patientId');
  const { user } = useAuthStore();
  const { currentPatient, updateVisualField } = useClinicalStore();
  const [visualFieldData, setVisualFieldData] = useState<VisualFieldData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  useEffect(() => {
    const loadVisualField = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await visualFieldApi.get(patientId);
        if (data) {
          setVisualFieldData(data);
          updateVisualField(data);
        }
      } catch (error) {
        console.error('Error loading visual field data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVisualField();
  }, [patientId]);

  const handleSave = async (data: VisualFieldData) => {
    try {
      if (visualFieldData?.id) {
        await visualFieldApi.update(visualFieldData.id, data);
        toast.success('Visual field test updated successfully');
      } else {
        await visualFieldApi.save(data);
        toast.success('Visual field test saved successfully');
      }
      updateVisualField(data);
      setVisualFieldData(data);

      // Alert for visual field defects
      if (data.confrontationDefectOD || data.confrontationDefectOS || data.amslerDefectOD || data.amslerDefectOS) {
        const defects = [];
        if (data.confrontationDefectOD) defects.push('Confrontation OD');
        if (data.confrontationDefectOS) defects.push('Confrontation OS');
        if (data.amslerDefectOD) defects.push('Amsler OD');
        if (data.amslerDefectOS) defects.push('Amsler OS');
        toast.error(
          `⚠️ VISUAL FIELD DEFECT DETECTED: ${defects.join(', ')}. Consider formal perimetry and neurological evaluation.`,
          { duration: 8000 }
        );
      }
    } catch (error) {
      toast.error('Failed to save visual field data');
      console.error('Save error:', error);
    }
  };

  if (!patientId || !currentPatient) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Visual Field Testing</h1>
          <p className="text-gray-600">Search and select a patient to perform visual field examination.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/visual-field"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visual Field Screening</h1>
              <p className="text-sm text-gray-500 mt-1">
                Confrontation, Amsler grid, and FDT screening tests
              </p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {currentPatient.firstName?.[0]}{currentPatient.lastName?.[0]}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900">
                {currentPatient.firstName} {currentPatient.lastName}
              </h3>
              <div className="mt-1 grid grid-cols-3 gap-4 text-sm text-blue-700">
                <div>
                  <span className="font-medium">MRN:</span> {currentPatient.medicalRecordNumber}
                </div>
                <div>
                  <span className="font-medium">DOB:</span>{' '}
                  {currentPatient.dateOfBirth
                    ? new Date(currentPatient.dateOfBirth).toLocaleDateString()
                    : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Age:</span>
                  {currentPatient.dateOfBirth
                    ? Math.floor(
                        (new Date().getTime() - new Date(currentPatient.dateOfBirth).getTime()) /
                          (365.25 * 24 * 60 * 60 * 1000)
                      )
                    : 'N/A'}{' '}
                  years
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Field Defect Alert */}
        {visualFieldData && (visualFieldData.confrontationDefectOD || visualFieldData.confrontationDefectOS || visualFieldData.amslerDefectOD || visualFieldData.amslerDefectOS) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Visual Field Defect Detected</h3>
                <div className="mt-2 text-sm text-red-700">
                  {visualFieldData.confrontationDefectOD && (
                    <p>
                      <strong>Confrontation OD:</strong> {visualFieldData.confrontationDefectLocation}
                    </p>
                  )}
                  {visualFieldData.confrontationDefectOS && (
                    <p>
                      <strong>Confrontation OS:</strong> {visualFieldData.confrontationDefectLocation}
                    </p>
                  )}
                  {visualFieldData.amslerDefectOD && (
                    <p>
                      <strong>Amsler Grid OD:</strong> Central/paracentral defect
                    </p>
                  )}
                  {visualFieldData.amslerDefectOS && (
                    <p>
                      <strong>Amsler Grid OS:</strong> Central/paracentral defect
                    </p>
                  )}
                  <p className="mt-2 font-medium">⚠️ Clinical Actions Required:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Perform formal automated perimetry (Humphrey/Octopus)</li>
                    <li>Rule out glaucoma, neurological lesions, retinal disease</li>
                    <li>Check for RAPD (relative afferent pupillary defect)</li>
                    <li>Consider OCT, fundus photography, neuroimaging if indicated</li>
                    <li>Urgent referral for sudden onset or progressive defects</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Field Form */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <VisualFieldForm
              patientId={patientId}
              initialData={visualFieldData || undefined}
              onSave={handleSave}
              canEdit={canEdit}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function VisualFieldPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <VisualFieldPageContent />
    </ProtectedRoute>
  );
}
