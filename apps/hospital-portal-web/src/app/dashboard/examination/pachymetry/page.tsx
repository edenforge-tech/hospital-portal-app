'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { pachymetryApi } from '@/lib/api/examination.api';
import { PachymetryData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import PachymetryForm from '@/components/examination/PachymetryForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';

function PachymetryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams?.get('patientId');
  const { user } = useAuthStore();
  const { currentPatient, updatePachymetry } = useClinicalStore();
  const [pachymetryData, setPachymetryData] = useState<PachymetryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  useEffect(() => {
    const loadPachymetry = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await pachymetryApi.get(patientId);
        if (data) {
          setPachymetryData(data);
          updatePachymetry(data);
        }
      } catch (error) {
        console.error('Error loading pachymetry data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPachymetry();
  }, [patientId, updatePachymetry]);

  const handleSave = async (data: PachymetryData) => {
    try {
      if (pachymetryData?.id) {
        await pachymetryApi.update(pachymetryData.id, data);
        toast.success('Pachymetry updated successfully');
      } else {
        await pachymetryApi.save(data);
        toast.success('Pachymetry saved successfully');
      }
      updatePachymetry(data);
      setPachymetryData(data);

      // Alert for thin corneas (glaucoma risk)
      if (data.OD.centralThickness < 500 || data.OS.centralThickness < 500) {
        const affectedEyes = [];
        if (data.OD.centralThickness < 500) affectedEyes.push('OD (Right)');
        if (data.OS.centralThickness < 500) affectedEyes.push('OS (Left)');
        toast.error(
          `⚠️ THIN CORNEA DETECTED (${affectedEyes.join(', ')}): Increased glaucoma risk. Consider IOP correction and monitoring.`,
          { duration: 8000 }
        );
      }

      // Alert for very thick corneas (potential measurement error or edema)
      if (data.OD.centralThickness > 600 || data.OS.centralThickness > 600) {
        const affectedEyes = [];
        if (data.OD.centralThickness > 600) affectedEyes.push('OD (Right)');
        if (data.OS.centralThickness > 600) affectedEyes.push('OS (Left)');
        toast.error(
          `⚠️ THICK CORNEA DETECTED (${affectedEyes.join(', ')}): Rule out corneal edema or measurement error.`,
          { duration: 6000 }
        );
      }
    } catch (error) {
      toast.error('Failed to save pachymetry data');
      console.error('Save error:', error);
    }
  };

  if (!patientId || !currentPatient) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pachymetry</h1>
          <p className="text-gray-600">Search and select a patient to measure corneal thickness.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/pachymetry"
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
              <h1 className="text-2xl font-bold text-gray-900">Pachymetry (Corneal Thickness)</h1>
              <p className="text-sm text-gray-500 mt-1">
                Central and peripheral corneal thickness measurement
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
                  <span className="font-medium">Age:</span>{' '}
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

        {/* Thin Cornea Alert */}
        {pachymetryData && (pachymetryData.OD.centralThickness < 500 || pachymetryData.OS.centralThickness < 500) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Thin Cornea Detected</h3>
                <div className="mt-2 text-sm text-red-700">
                  {pachymetryData.OD.centralThickness < 500 && (
                    <p>
                      <strong>OD (Right Eye):</strong> CCT {pachymetryData.OD.centralThickness} μm (Normal: 530-560 μm)
                    </p>
                  )}
                  {pachymetryData.OS.centralThickness < 500 && (
                    <p>
                      <strong>OS (Left Eye):</strong> CCT {pachymetryData.OS.centralThickness} μm (Normal: 530-560 μm)
                    </p>
                  )}
                  <p className="mt-2 font-medium">⚠️ Clinical Recommendations:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Higher risk for glaucoma progression</li>
                    <li>IOP measurements may underestimate true IOP</li>
                    <li>Apply CCT correction to tonometry readings</li>
                    <li>Consider closer monitoring intervals</li>
                    <li>Not suitable for LASIK (thin corneas contraindicated)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thick Cornea Alert */}
        {pachymetryData && (pachymetryData.OD.centralThickness > 600 || pachymetryData.OS.centralThickness > 600) && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-orange-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">Thick Cornea Detected</h3>
                <div className="mt-2 text-sm text-orange-700">
                  {pachymetryData.OD.centralThickness > 600 && (
                    <p>
                      <strong>OD (Right Eye):</strong> CCT {pachymetryData.OD.centralThickness} μm (Normal: 530-560 μm)
                    </p>
                  )}
                  {pachymetryData.OS.centralThickness > 600 && (
                    <p>
                      <strong>OS (Left Eye):</strong> CCT {pachymetryData.OS.centralThickness} μm (Normal: 530-560 μm)
                    </p>
                  )}
                  <p className="mt-2">
                    ⚠️ Rule out corneal edema, measurement error, or congenital thick corneas. IOP readings may
                    overestimate true IOP.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LASIK Suitability */}
        {pachymetryData && (
          <div
            className={`border-l-4 p-4 rounded-md ${
              pachymetryData.lasikSuitableOD && pachymetryData.lasikSuitableOS
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex">
              {pachymetryData.lasikSuitableOD && pachymetryData.lasikSuitableOS ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              )}
              <div>
                <h3
                  className={`text-sm font-medium ${
                    pachymetryData.lasikSuitableOD && pachymetryData.lasikSuitableOS
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}
                >
                  LASIK Suitability Assessment
                </h3>
                <div
                  className={`mt-2 text-sm ${
                    pachymetryData.lasikSuitableOD && pachymetryData.lasikSuitableOS
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                >
                  <p>
                    <strong>OD (Right):</strong>{' '}
                    {pachymetryData.lasikSuitableOD ? '✓ Suitable' : '✗ Not Suitable'} (Residual Bed:{' '}
                    {pachymetryData.OD.residualStromalBed} μm)
                  </p>
                  <p>
                    <strong>OS (Left):</strong>{' '}
                    {pachymetryData.lasikSuitableOS ? '✓ Suitable' : '✗ Not Suitable'} (Residual Bed:{' '}
                    {pachymetryData.OS.residualStromalBed} μm)
                  </p>
                  <p className="mt-2 text-xs">
                    Minimum residual stromal bed after LASIK must be ≥250 μm to maintain corneal integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pachymetry Form */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <PachymetryForm
              patientId={patientId}
              initialData={pachymetryData || undefined}
              onSave={handleSave}
              canEdit={canEdit}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function PachymetryPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <PachymetryPageContent />
    </ProtectedRoute>
  );
}
