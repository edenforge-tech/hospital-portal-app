'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle, Eye, User, Calendar, Activity } from 'lucide-react';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { contactLensApi } from '@/lib/api/examination.api';
import { useHasPermission } from '@/hooks/use-permissions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';
import ContactLensForm from '@/components/examination/ContactLensForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';
import type { ContactLensData, KeratometryData } from '@/lib/stores/clinical-store';

function ContactLensPageContent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const { currentPatient, keratometry } = useClinicalStore();
  const [contactLensData, setContactLensData] = useState<ContactLensData | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  useEffect(() => {
    const loadContactLensData = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        const data = await contactLensApi.get(patientId);
        if (data) {
          setContactLensData(data);
        }
      } catch (error) {
        console.error('Failed to load contact lens data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContactLensData();
  }, [patientId]);

  const handleSave = async (data: ContactLensData) => {
    try {
      if (contactLensData?.id) {
        await contactLensApi.update(contactLensData.id, data);
        toast.success('Contact lens data updated successfully');
      } else {
        await contactLensApi.save(data);
        toast.success('Contact lens data saved successfully');
      }

      // Special notification for successful fit
      if (data.fitStatus === 'Successful Fit') {
        toast.success(
          `✓ SUCCESSFUL FIT: ${data.lensType} lens (${data.lensBrand}). Schedule 1-day follow-up.`,
          { duration: 6000 }
        );
      }

      // Reload data
      const updatedData = await contactLensApi.get(patientId);
      if (updatedData) {
        setContactLensData(updatedData);
      }
    } catch (error) {
      console.error('Failed to save contact lens data:', error);
      toast.error('Failed to save contact lens data');
    }
  };

  if (!currentPatient) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Lens Fitting</h1>
          <p className="text-gray-600">Search and select a patient to fit contact lenses.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/contact-lens"
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Calculate age from DOB
  const calculateAge = (dob: string | Date) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/dashboard/patients/${patientId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Lens Services</h1>
            <p className="text-gray-600 text-sm mt-1">
              Soft/RGP fitting, toric/multifocal selection, trial log, complications tracking
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {currentPatient.firstName?.[0]}{currentPatient.lastName?.[0]}
          </div>
          <div className="flex-1 grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-blue-600 font-semibold">Patient Name</p>
              <p className="text-sm text-blue-900 font-medium">{currentPatient.firstName} {currentPatient.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold">MRN</p>
              <p className="text-sm text-blue-900 font-medium font-mono">{currentPatient.patientCode || currentPatient.medicalRecordNumber}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold">Date of Birth</p>
              <p className="text-sm text-blue-900 font-medium">
                {currentPatient.dateOfBirth ? new Date(currentPatient.dateOfBirth).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold">Age</p>
              <p className="text-sm text-blue-900 font-medium">
                {currentPatient.dateOfBirth ? calculateAge(currentPatient.dateOfBirth) : 'N/A'} years
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keratometry Data Banner */}
      {keratometry ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Keratometry Data Available</h3>
              <p className="mt-1 text-sm text-green-700">
                K readings from {new Date(keratometry.examinationDate).toLocaleDateString()} will be
                used for base curve calculation.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  OD: K1={keratometry.k1OD.toFixed(2)}D @ {keratometry.axisOD}°, K2=
                  {keratometry.k2OD.toFixed(2)}D
                </div>
                <div>
                  OS: K1={keratometry.k1OS.toFixed(2)}D @ {keratometry.axisOS}°, K2=
                  {keratometry.k2OS.toFixed(2)}D
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">No Keratometry Data Found</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Please perform keratometry first for accurate base curve calculation, or enter manually.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complications Alert Banner */}
      {contactLensData && contactLensData.complications && contactLensData.complications.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Complications Detected</h3>
              <p className="mt-1 text-sm text-red-700 font-semibold">
                {contactLensData.complications.join(', ')}
              </p>
              <div className="mt-2 space-y-1 text-sm text-red-700">
                <p className="font-semibold">Clinical Actions Required:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Discontinue contact lens wear immediately if infection suspected</li>
                  <li>GPC: Consider daily disposable lenses, reduce wearing time, try preservative-free solutions</li>
                  <li>Corneal Infiltrates/Ulcers: Urgent referral, culture if indicated, topical antibiotics</li>
                  <li>Dry Eye: Artificial tears, reduce wearing time, consider high-water or silicone hydrogel materials</li>
                  <li>Over-wear Syndrome: Rest period, corneal hypoxia assessment, switch to higher Dk/t lenses</li>
                  <li>Protein/Lipid Deposits: Enzymatic cleaners, consider daily disposables, check cleaning compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fit Status Banner */}
      {contactLensData && contactLensData.fitStatus && (
        <div
          className={`border-l-4 p-4 rounded-md ${
            contactLensData.fitStatus === 'Successful Fit'
              ? 'bg-green-50 border-green-500'
              : contactLensData.fitStatus === 'Trial Lens Dispensed'
              ? 'bg-blue-50 border-blue-500'
              : contactLensData.fitStatus === 'Re-fit Required'
              ? 'bg-orange-50 border-orange-500'
              : 'bg-gray-50 border-gray-500'
          }`}
        >
          <div className="flex items-start">
            {contactLensData.fitStatus === 'Successful Fit' ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
            ) : (
              <Activity className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
            )}
            <div className="flex-1">
              <h3
                className={`text-sm font-medium ${
                  contactLensData.fitStatus === 'Successful Fit'
                    ? 'text-green-800'
                    : contactLensData.fitStatus === 'Trial Lens Dispensed'
                    ? 'text-blue-800'
                    : contactLensData.fitStatus === 'Re-fit Required'
                    ? 'text-orange-800'
                    : 'text-gray-800'
                }`}
              >
                Fit Status: {contactLensData.fitStatus}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">OD (Right Eye):</p>
                  <p className="font-mono text-xs mt-1">
                    {contactLensData.lensBrand} | BC: {contactLensData.baseCurveOD}mm | Dia:{' '}
                    {contactLensData.diameterOD}mm
                  </p>
                  <p className="font-mono text-xs">
                    Power: {contactLensData.powerOD >= 0 ? '+' : ''}
                    {contactLensData.powerOD.toFixed(2)}D
                  </p>
                </div>
                <div>
                  <p className="font-semibold">OS (Left Eye):</p>
                  <p className="font-mono text-xs mt-1">
                    {contactLensData.lensBrand} | BC: {contactLensData.baseCurveOS}mm | Dia:{' '}
                    {contactLensData.diameterOS}mm
                  </p>
                  <p className="font-mono text-xs">
                    Power: {contactLensData.powerOS >= 0 ? '+' : ''}
                    {contactLensData.powerOS.toFixed(2)}D
                  </p>
                </div>
              </div>
              {contactLensData.fitStatus === 'Successful Fit' && (
                <p className="mt-2 text-sm font-semibold">
                  Next Follow-up:{' '}
                  {contactLensData.nextFollowUpDate
                    ? new Date(contactLensData.nextFollowUpDate).toLocaleDateString()
                    : 'Schedule 1-day follow-up'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Lens Form */}
      <ContactLensForm
        patientId={patientId}
        initialData={contactLensData || undefined}
        keratometryData={keratometry || undefined}
        onSave={handleSave}
        canEdit={canEdit}
      />
    </div>
  );
}

export default function ContactLensPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <ContactLensPageContent />
    </ProtectedRoute>
  );
}
