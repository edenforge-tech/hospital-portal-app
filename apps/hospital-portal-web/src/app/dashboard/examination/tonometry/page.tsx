'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { tonometryApi } from '@/lib/api/examination.api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useHasPermission } from '@/hooks/use-permissions';
import TonometryForm from '@/components/examination/TonometryForm';
import IOPTrendChart from '@/components/examination/IOPTrendChart';import PatientSearchSelector from '@/components/examination/PatientSearchSelector';import { ArrowLeft, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TonometryPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const { currentPatient, tonometry, updateTonometry, pachymetry, setLoading, setError } = useClinicalStore();
  const canView = useHasPermission('CLINICAL:EXAMINATION:VIEW');
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  const [showTrendChart, setShowTrendChart] = useState(false);
  const [iopHistory, setIopHistory] = useState<any[]>([]);

  useEffect(() => {
    if (patientId) {
      loadTonometry(patientId);
      loadIOPTrend(patientId);
    }
  }, [patientId]);

  const loadTonometry = async (pid: string) => {
    try {
      setLoading(true);
      const data = await tonometryApi.get(pid);
      updateTonometry(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load tonometry:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load tonometry data');
        toast.error('Failed to load tonometry data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadIOPTrend = async (pid: string) => {
    try {
      const trendData = await tonometryApi.getTrend(pid);
      setIopHistory(trendData);
    } catch (error) {
      console.error('Failed to load IOP trend:', error);
    }
  };

  const handleSave = async (data: any) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit examinations');
      return;
    }

    try {
      setLoading(true);
      
      if (tonometry?.id) {
        await tonometryApi.update(tonometry.id, data);
        toast.success('IOP measurement updated successfully');
      } else {
        await tonometryApi.save(data);
        toast.success('IOP measurement saved successfully');
      }
      
      if (patientId) {
        await loadTonometry(patientId);
        await loadIOPTrend(patientId); // Refresh trend data
      }
      
      // Check for glaucoma alerts
      if (data.glaucomaSuspectOD || data.glaucomaSuspectOS) {
        toast.error('⚠️ GLAUCOMA SUSPECT: IOP >21 mmHg detected. Consider ophthalmology referral.', {
          duration: 8000,
        });
      }
      if (data.hypotonyOD || data.hypotonyOS) {
        toast.error('⚠️ HYPOTONY ALERT: IOP <10 mmHg detected. Check for uveitis, retinal detachment, or wound leak.', {
          duration: 8000,
        });
      }
      
      setError(null);
    } catch (error: any) {
      console.error('Failed to save tonometry:', error);
      setError('Failed to save tonometry data');
      toast.error('Failed to save tonometry data');
    } finally {
      setLoading(false);
    }
  };

  if (!patientId) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tonometry (IOP Measurement)</h1>
          <p className="text-gray-600">Search and select a patient to measure intraocular pressure.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/tonometry"
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
              <h1 className="text-2xl font-bold text-gray-900">Tonometry - IOP Measurement</h1>
              {currentPatient && (
                <p className="text-gray-600 mt-1">
                  Patient: {currentPatient.firstName} {currentPatient.lastName} (MRN: {currentPatient.mrn})
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {iopHistory.length > 0 && (
              <button
                onClick={() => setShowTrendChart(!showTrendChart)}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                {showTrendChart ? 'Hide' : 'Show'} IOP Trend
              </button>
            )}
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

        {/* Glaucoma Risk Alert */}
        {tonometry && (tonometry.glaucomaSuspectOD || tonometry.glaucomaSuspectOS || tonometry.hypotonyOD || tonometry.hypotonyOS) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">⚠️ Abnormal IOP Detected</h3>
                <div className="mt-2 space-y-1 text-sm text-red-800">
                  {tonometry.glaucomaSuspectOD && (
                    <p>• <strong>OD (Right Eye):</strong> IOP {tonometry.OD.measuredIOP} mmHg - Glaucoma suspect (Normal: 10-21 mmHg)</p>
                  )}
                  {tonometry.glaucomaSuspectOS && (
                    <p>• <strong>OS (Left Eye):</strong> IOP {tonometry.OS.measuredIOP} mmHg - Glaucoma suspect (Normal: 10-21 mmHg)</p>
                  )}
                  {tonometry.hypotonyOD && (
                    <p>• <strong>OD (Right Eye):</strong> IOP {tonometry.OD.measuredIOP} mmHg - Hypotony (Abnormally low)</p>
                  )}
                  {tonometry.hypotonyOS && (
                    <p>• <strong>OS (Left Eye):</strong> IOP {tonometry.OS.measuredIOP} mmHg - Hypotony (Abnormally low)</p>
                  )}
                </div>
                <p className="mt-3 text-sm font-medium text-red-900">
                  Recommended Action: {tonometry.glaucomaSuspectOD || tonometry.glaucomaSuspectOS 
                    ? 'Visual field test, OCT RNFL, ophthalmology referral' 
                    : 'Check for uveitis, retinal detachment, wound leak'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* IOP Trend Chart */}
        {showTrendChart && iopHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                IOP Trend - Last {iopHistory.length} Measurements
              </h2>
            </div>
            <IOPTrendChart 
              history={iopHistory}
              targetIOPOD={tonometry?.targetIOPOD}
              targetIOPOS={tonometry?.targetIOPOS}
            />
          </div>
        )}

        {/* Tonometry Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Intraocular Pressure Measurement</h2>
            <p className="text-sm text-gray-600 mb-6">
              Normal IOP range: 10-21 mmHg | Glaucoma suspect: &gt;21 mmHg | Hypotony: &lt;10 mmHg
            </p>
            <TonometryForm 
              initialData={tonometry}
              patientId={patientId}
              onSave={handleSave}
              canEdit={canEdit}
              pachymetryData={pachymetry} // Pass pachymetry for CCT correction
            />
          </div>
        </div>

        {/* IOP History Summary */}
        {iopHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent IOP Measurements</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OD (mmHg)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS (mmHg)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {iopHistory.slice(0, 5).map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(record.examinationDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(record.measurementTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.method}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-medium ${
                          record.OD.measuredIOP > 21 ? 'text-red-600' :
                          record.OD.measuredIOP < 10 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {record.OD.measuredIOP}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-medium ${
                          record.OS.measuredIOP > 21 ? 'text-red-600' :
                          record.OS.measuredIOP < 10 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {record.OS.measuredIOP}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.glaucomaSuspectOD || record.glaucomaSuspectOS ? (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Suspect
                          </span>
                        ) : record.hypotonyOD || record.hypotonyOS ? (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                            Hypotony
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
