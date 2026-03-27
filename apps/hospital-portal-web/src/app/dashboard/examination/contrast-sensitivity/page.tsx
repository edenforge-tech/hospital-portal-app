'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { contrastSensitivityApi } from '@/lib/api/examination.api';
import { ContrastSensitivityData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import ContrastSensitivityForm from '@/components/examination/ContrastSensitivityForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';

function ContrastSensitivityPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams?.get('patientId');
  const { user } = useAuthStore();
  const { currentPatient, updateContrastSensitivity } = useClinicalStore();
  const [contrastSensitivityData, setContrastSensitivityData] = useState<ContrastSensitivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  useEffect(() => {
    const loadContrastSensitivity = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await contrastSensitivityApi.get(patientId);
        if (data) {
          setContrastSensitivityData(data);
          updateContrastSensitivity(data);
        }
      } catch (error) {
        console.error('Error loading contrast sensitivity data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContrastSensitivity();
  }, [patientId]);

  const handleSave = async (data: ContrastSensitivityData) => {
    try {
      if (contrastSensitivityData?.id) {
        await contrastSensitivityApi.update(contrastSensitivityData.id, data);
        toast.success('Contrast sensitivity test updated successfully');
      } else {
        await contrastSensitivityApi.save(data);
        toast.success('Contrast sensitivity test saved successfully');
      }
      updateContrastSensitivity(data);
      setContrastSensitivityData(data);

      // Alert for abnormal contrast sensitivity
      if (data.pelliRobsonScoreOD < 1.5 || data.pelliRobsonScoreOS < 1.5) {
        const affectedEyes = [];
        if (data.pelliRobsonScoreOD < 1.5) affectedEyes.push(`OD: ${data.pelliRobsonScoreOD}`);
        if (data.pelliRobsonScoreOS < 1.5) affectedEyes.push(`OS: ${data.pelliRobsonScoreOS}`);
        toast.error(
          `⚠️ REDUCED CONTRAST SENSITIVITY: ${affectedEyes.join(', ')}. Consider cataract, glaucoma, or neurological evaluation.`,
          { duration: 8000 }
        );
      }
    } catch (error) {
      toast.error('Failed to save contrast sensitivity data');
      console.error('Save error:', error);
    }
  };

  if (!patientId || !currentPatient) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contrast Sensitivity</h1>
          <p className="text-gray-600">Search and select a patient to assess contrast sensitivity.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/contrast-sensitivity"
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
              <h1 className="text-2xl font-bold text-gray-900">Contrast Sensitivity Testing</h1>
              <p className="text-sm text-gray-500 mt-1">
                Pelli-Robson chart and other contrast sensitivity assessments
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

        {/* Reduced Contrast Sensitivity Alert */}
        {contrastSensitivityData && (contrastSensitivityData.pelliRobsonScoreOD < 1.5 || contrastSensitivityData.pelliRobsonScoreOS < 1.5) && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-orange-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">Reduced Contrast Sensitivity Detected</h3>
                <div className="mt-2 text-sm text-orange-700">
                  {contrastSensitivityData.pelliRobsonScoreOD < 1.5 && (
                    <p>
                      <strong>OD (Right Eye):</strong> {contrastSensitivityData.pelliRobsonScoreOD} log CS (Normal: ≥1.5)
                    </p>
                  )}
                  {contrastSensitivityData.pelliRobsonScoreOS < 1.5 && (
                    <p>
                      <strong>OS (Left Eye):</strong> {contrastSensitivityData.pelliRobsonScoreOS} log CS (Normal: ≥1.5)
                    </p>
                  )}
                  <p className="mt-2 font-medium">⚠️ Differential Diagnosis:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Cataract (most common cause)</li>
                    <li>Glaucoma (especially with normal visual acuity)</li>
                    <li>Age-related macular degeneration</li>
                    <li>Optic neuropathy or demyelinating disease</li>
                    <li>Corneal pathology (dystrophies, edema)</li>
                    <li>Amblyopia or uncorrected refractive error</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contrast Sensitivity Form */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ContrastSensitivityForm
              patientId={patientId}
              initialData={contrastSensitivityData || undefined}
              onSave={handleSave}
              canEdit={canEdit}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContrastSensitivityPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <ContrastSensitivityPageContent />
    </ProtectedRoute>
  );
}
