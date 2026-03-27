'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { refractionApi } from '@/lib/api/examination.api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useHasPermission } from '@/hooks/use-permissions';
import RefractionForm from '@/components/examination/RefractionForm';import PatientSearchSelector from '@/components/examination/PatientSearchSelector';import { ArrowLeft, AlertCircle, History } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RefractionPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const { 
    currentPatient, 
    refraction, 
    updateRefraction, 
    retinoscopy,
    autoRefraction,
    setLoading, 
    setError 
  } = useClinicalStore();
  
  const canView = useHasPermission('CLINICAL:EXAMINATION:VIEW');
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  const [showHistory, setShowHistory] = useState(false);
  const [refractionHistory, setRefractionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (patientId) {
      loadRefraction(patientId);
      loadRefractionHistory(patientId);
    }
  }, [patientId]);

  const loadRefraction = async (pid: string) => {
    try {
      setLoading(true);
      const data = await refractionApi.get(pid);
      updateRefraction(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load refraction:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load refraction data');
        toast.error('Failed to load refraction data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRefractionHistory = async (pid: string) => {
    try {
      const history = await refractionApi.getHistory(pid);
      setRefractionHistory(history);
    } catch (error) {
      console.error('Failed to load refraction history:', error);
    }
  };

  const handleSave = async (data: any) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit examinations');
      return;
    }

    try {
      setLoading(true);
      
      if (refraction?.id) {
        await refractionApi.update(refraction.id, data);
        toast.success('Refraction updated successfully');
      } else {
        await refractionApi.save(data);
        toast.success('Refraction saved successfully');
      }
      
      if (patientId) {
        await loadRefraction(patientId);
        await loadRefractionHistory(patientId);
      }
      
      setError(null);
    } catch (error: any) {
      console.error('Failed to save refraction:', error);
      setError('Failed to save refraction data');
      toast.error('Failed to save refraction data');
    } finally {
      setLoading(false);
    }
  };

  if (!patientId) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Refraction</h1>
          <p className="text-gray-600">Search and select a patient to perform refraction examination.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/refraction"
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
              <h1 className="text-2xl font-bold text-gray-900">Subjective Refraction</h1>
              {currentPatient && (
                <p className="text-gray-600 mt-1">
                  Patient: {currentPatient.firstName} {currentPatient.lastName} (MRN: {currentPatient.mrn})
                </p>
              )}
            </div>
          </div>
          
          {refractionHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <History className="h-5 w-5 mr-2" />
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          )}
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

        {/* Data Availability Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">📊 Available Data Sources:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              {retinoscopy ? (
                <span className="text-green-600">✓ Retinoscopy data available (recommended starting point)</span>
              ) : (
                <span className="text-gray-500">✗ No retinoscopy data</span>
              )}
            </div>
            <div className="flex items-center">
              {autoRefraction ? (
                <span className="text-green-600">✓ Auto-refraction data available (for comparison)</span>
              ) : (
                <span className="text-gray-500">✗ No auto-refraction data</span>
              )}
            </div>
            <div className="flex items-center">
              {refractionHistory.length > 0 ? (
                <span className="text-green-600">✓ Previous prescription available ({refractionHistory.length} records)</span>
              ) : (
                <span className="text-gray-500">✗ No previous prescriptions</span>
              )}
            </div>
          </div>
        </div>

        {/* Refraction History */}
        {showHistory && refractionHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Refraction History</h2>
            <div className="space-y-4">
              {refractionHistory.slice(0, 5).map((record, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-medium text-gray-900">
                        {new Date(record.examinationDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                      {index === 0 && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Most Recent
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.refractionType || 'Manual Refraction'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* OD */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-semibold text-blue-900 mb-2">OD (Right Eye)</h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Distance:</span>{' '}
                          <span className="font-mono">
                            {record.finalRx?.OD?.sphere > 0 ? '+' : ''}{record.finalRx?.OD?.sphere?.toFixed(2)} DS
                            {record.finalRx?.OD?.cylinder && ` / ${record.finalRx.OD.cylinder.toFixed(2)} DC × ${record.finalRx.OD.axis}°`}
                          </span>
                        </div>
                        {record.nearRx?.OD && (
                          <div>
                            <span className="font-medium">Near Add:</span>{' '}
                            <span className="font-mono">+{record.nearRx.OD.add?.toFixed(2)} D</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* OS */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-semibold text-green-900 mb-2">OS (Left Eye)</h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Distance:</span>{' '}
                          <span className="font-mono">
                            {record.finalRx?.OS?.sphere > 0 ? '+' : ''}{record.finalRx?.OS?.sphere?.toFixed(2)} DS
                            {record.finalRx?.OS?.cylinder && ` / ${record.finalRx.OS.cylinder.toFixed(2)} DC × ${record.finalRx.OS.axis}°`}
                          </span>
                        </div>
                        {record.nearRx?.OS && (
                          <div>
                            <span className="font-medium">Near Add:</span>{' '}
                            <span className="font-mono">+{record.nearRx.OS.add?.toFixed(2)} D</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refraction Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subjective Refraction Procedure</h2>
            <p className="text-sm text-gray-600 mb-6">
              Systematic refinement of refractive error using patient responses to achieve best corrected visual acuity
            </p>
            <RefractionForm 
              initialData={refraction}
              patientId={patientId}
              onSave={handleSave}
              canEdit={canEdit}
              retinoscopyData={retinoscopy}
              autoRefractionData={autoRefraction}
              previousRx={refractionHistory[0]}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
