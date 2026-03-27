'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Package } from 'lucide-react';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { spectacleDispensingApi } from '@/lib/api/examination.api';
import { SpectacleDispensingData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import SpectacleDispensingForm from '@/components/examination/SpectacleDispensingForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';

function SpectacleDispensingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams?.get('patientId');
  const { user } = useAuthStore();
  const { currentPatient, refraction } = useClinicalStore();
  const [dispensingData, setDispensingData] = useState<SpectacleDispensingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  useEffect(() => {
    const loadDispensingData = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await spectacleDispensingApi.get(patientId);
        if (data) {
          setDispensingData(data);
        }
      } catch (error) {
        console.error('Error loading spectacle dispensing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDispensingData();
  }, [patientId]);

  const handleSave = async (data: SpectacleDispensingData) => {
    try {
      if (dispensingData?.id) {
        await spectacleDispensingApi.update(dispensingData.id, data);
        toast.success('Spectacle order updated successfully');
      } else {
        await spectacleDispensingApi.save(data);
        toast.success('Spectacle order created successfully');
      }
      setDispensingData(data);

      // Alert for order status
      if (data.orderStatus === 'Ordered') {
        toast.success(
          `✓ ORDER PLACED: ${data.frameModel} with ${data.lensType}. Expected delivery: ${data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toLocaleDateString() : 'TBD'}`,
          { duration: 6000 }
        );
      }
    } catch (error) {
      toast.error('Failed to save spectacle order');
      console.error('Save error:', error);
    }
  };

  if (!patientId || !currentPatient) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Spectacle Dispensing</h1>
          <p className="text-gray-600">Search and select a patient to process spectacle dispensing.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/spectacle-dispensing"
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
              <h1 className="text-2xl font-bold text-gray-900">Spectacle Dispensing</h1>
              <p className="text-sm text-gray-500 mt-1">
                Prescription generation, frame selection, lens options, and order tracking
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

        {/* Refraction Data Available */}
        {refraction && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Prescription Data Available</h3>
                <p className="mt-1 text-sm text-green-700">
                  Latest refraction data from {new Date(refraction.examinationDate).toLocaleDateString()} will be
                  auto-loaded into the prescription.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Refraction Warning */}
        {!refraction && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">No Refraction Data Found</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Please perform refraction examination first, or enter prescription manually below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Status Banner */}
        {dispensingData && dispensingData.orderStatus && (
          <div
            className={`border-l-4 p-4 rounded-md ${
              dispensingData.orderStatus === 'Delivered'
                ? 'bg-green-50 border-green-500'
                : dispensingData.orderStatus === 'Ordered'
                ? 'bg-blue-50 border-blue-500'
                : dispensingData.orderStatus === 'In Progress'
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-gray-50 border-gray-500'
            }`}
          >
            <div className="flex">
              {dispensingData.orderStatus === 'Delivered' && <Package className="h-5 w-5 text-green-400 mr-3 mt-0.5" />}
              {dispensingData.orderStatus === 'Ordered' && <Clock className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />}
              {dispensingData.orderStatus === 'In Progress' && <Clock className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />}
              <div>
                <h3
                  className={`text-sm font-medium ${
                    dispensingData.orderStatus === 'Delivered'
                      ? 'text-green-800'
                      : dispensingData.orderStatus === 'Ordered'
                      ? 'text-blue-800'
                      : 'text-yellow-800'
                  }`}
                >
                  Order Status: {dispensingData.orderStatus}
                </h3>
                <div className="mt-1 text-sm">
                  {dispensingData.orderDate && (
                    <p>
                      <strong>Order Date:</strong> {new Date(dispensingData.orderDate).toLocaleDateString()}
                    </p>
                  )}
                  {dispensingData.expectedDeliveryDate && (
                    <p>
                      <strong>Expected Delivery:</strong>{' '}
                      {new Date(dispensingData.expectedDeliveryDate).toLocaleDateString()}
                    </p>
                  )}
                  {dispensingData.actualDeliveryDate && (
                    <p>
                      <strong>Delivered:</strong> {new Date(dispensingData.actualDeliveryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spectacle Dispensing Form */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SpectacleDispensingForm
              patientId={patientId}
              initialData={dispensingData || undefined}
              refractionData={refraction || undefined}
              onSave={handleSave}
              canEdit={canEdit}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpectacleDispensingPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <SpectacleDispensingPageContent />
    </ProtectedRoute>
  );
}
