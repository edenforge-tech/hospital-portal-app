'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { colorVisionApi } from '@/lib/api/examination.api';
import { ColorVisionData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import ColorVisionForm from '@/components/examination/ColorVisionForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';

function ColorVisionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams?.get('patientId');
  const { user } = useAuthStore();
  const { currentPatient, updateColorVision } = useClinicalStore();
  const [colorVisionData, setColorVisionData] = useState<ColorVisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  useEffect(() => {
    const loadColorVision = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await colorVisionApi.get(patientId);
        if (data) {
          setColorVisionData(data);
          updateColorVision(data);
        }
      } catch (error) {
        console.error('Error loading color vision data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadColorVision();
  }, [patientId, updateColorVision]);

  const handleSave = async (data: ColorVisionData) => {
    try {
      if (colorVisionData?.id) {
        await colorVisionApi.update(colorVisionData.id, data);
        toast.success('Color vision test updated successfully');
      } else {
        await colorVisionApi.save(data);
        toast.success('Color vision test saved successfully');
      }
      updateColorVision(data);
      setColorVisionData(data);

      // Alert for color vision deficiency
      if (data.ishiharaResult !== 'Normal' || data.d15Result !== 'Normal') {
        const defects = [];
        if (data.ishiharaResult !== 'Normal') defects.push(`Ishihara: ${data.ishiharaResult}`);
        if (data.d15Result !== 'Normal') defects.push(`D-15: ${data.d15Result}`);
        toast.error(
          `⚠️ COLOR VISION DEFICIENCY DETECTED: ${defects.join(', ')}. Consider referral if occupational impact.`,
          { duration: 8000 }
        );
      }
    } catch (error) {
      toast.error('Failed to save color vision data');
      console.error('Save error:', error);
    }
  };

  if (!patientId || !currentPatient) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Color Vision Testing</h1>
          <p className="text-gray-600">Search and select a patient to assess color vision.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/color-vision"
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
              <h1 className="text-2xl font-bold text-gray-900">Color Vision Testing</h1>
              <p className="text-sm text-gray-500 mt-1">
                Ishihara plates and D-15 panel for color deficiency screening
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

        {/* Color Deficiency Alert */}
        {colorVisionData && (colorVisionData.ishiharaResult !== 'Normal' || colorVisionData.d15Result !== 'Normal') && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Color Vision Deficiency Detected</h3>
                <div className="mt-2 text-sm text-red-700">
                  {colorVisionData.ishiharaResult !== 'Normal' && (
                    <p>
                      <strong>Ishihara Test:</strong> {colorVisionData.ishiharaResult} ({colorVisionData.ishiharaScore}/24 plates correct)
                    </p>
                  )}
                  {colorVisionData.d15Result !== 'Normal' && (
                    <p>
                      <strong>D-15 Panel:</strong> {colorVisionData.d15Result} deficiency
                    </p>
                  )}
                  <p className="mt-2 font-medium">⚠️ Clinical Recommendations:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Assess occupational impact (driving, aviation, electrical work)</li>
                    <li>Patient education on color vision limitations</li>
                    <li>Consider genetic counseling for congenital defects</li>
                    <li>Rule out acquired causes: macular disease, optic neuropathy, medications</li>
                    <li>Document for licensing and employment purposes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Color Vision Form */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ColorVisionForm
              patientId={patientId}
              initialData={colorVisionData || undefined}
              onSave={handleSave}
              canEdit={canEdit}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ColorVisionPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <ColorVisionPageContent />
    </ProtectedRoute>
  );
}
