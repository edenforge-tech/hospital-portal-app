'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { visualAcuityApi } from '@/lib/api/examination.api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useHasPermission } from '@/hooks/use-permissions';
import VisualAcuityForm from '@/components/examination/VisualAcuityForm';
import VisualAcuityHistory from '@/components/examination/VisualAcuityHistory';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';
import { ArrowLeft, Save, History, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function VisualAcuityPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const { currentPatient, visualAcuity, updateVisualAcuity, setLoading, setError } = useClinicalStore();
  const canView = useHasPermission('CLINICAL:EXAMINATION:VIEW');
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');
  
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (patientId) {
      loadVisualAcuity(patientId);
    }
  }, [patientId]);

  const loadVisualAcuity = async (pid: string) => {
    try {
      setLoading(true);
      const data = await visualAcuityApi.get(pid);
      updateVisualAcuity(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load visual acuity:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load visual acuity data');
        toast.error('Failed to load visual acuity data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!patientId) return;
    
    try {
      const historyData = await visualAcuityApi.getHistory(patientId);
      setHistory(historyData);
      setShowHistory(true);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load visual acuity history');
    }
  };

  const handleSave = async (data: any) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit examinations');
      return;
    }

    try {
      setLoading(true);
      
      if (visualAcuity?.id) {
        await visualAcuityApi.update(visualAcuity.id, data);
        toast.success('Visual acuity updated successfully');
      } else {
        await visualAcuityApi.save(data);
        toast.success('Visual acuity saved successfully');
      }
      
      if (patientId) {
        await loadVisualAcuity(patientId);
      }
      
      setError(null);
    } catch (error: any) {
      console.error('Failed to save visual acuity:', error);
      setError('Failed to save visual acuity data');
      toast.error('Failed to save visual acuity data');
    } finally {
      setLoading(false);
    }
  };

  if (!patientId) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Visual Acuity Testing</h1>
          <p className="text-gray-600">Search and select a patient to begin visual acuity assessment.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/visual-acuity"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900">Quick Tip</h3>
              <p className="text-blue-800 mt-1">
                Use the search box above to find a patient by name, MRN, email, or phone number. 
                Select a patient to begin the visual acuity examination.
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
              <h1 className="text-2xl font-bold text-gray-900">Visual Acuity Testing</h1>
              {currentPatient && (
                <p className="text-gray-600 mt-1">
                  Patient: {currentPatient.firstName} {currentPatient.lastName} (MRN: {currentPatient.mrn})
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadHistory}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <History className="h-5 w-5 mr-2" />
              History
            </button>
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

        {/* Visual Acuity Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visual Acuity Measurement</h2>
            <VisualAcuityForm 
              initialData={visualAcuity}
              patientId={patientId}
              onSave={handleSave}
              canEdit={canEdit}
            />
          </div>
        </div>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Visual Acuity History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <VisualAcuityHistory history={history} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
