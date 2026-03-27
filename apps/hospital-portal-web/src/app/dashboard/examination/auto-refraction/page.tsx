'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { autoRefractionApi } from '@/lib/api/examination.api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useHasPermission } from '@/hooks/use-permissions';
import AutoRefractionForm from '@/components/examination/AutoRefractionForm';
import PatientSearchSelector from '@/components/examination/PatientSearchSelector';
import { ArrowLeft, AlertCircle, GitCompare } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AutoRefractionPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const { 
    currentPatient, 
    autoRefraction, 
    updateAutoRefraction,
    refraction,
    setLoading, 
    setError 
  } = useClinicalStore();
  
  const canView = useHasPermission('CLINICAL:EXAMINATION:VIEW');
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadAutoRefraction(patientId);
    }
  }, [patientId]);

  const loadAutoRefraction = async (pid: string) => {
    try {
      setLoading(true);
      const data = await autoRefractionApi.get(pid);
      updateAutoRefraction(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load auto-refraction:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load auto-refraction data');
        toast.error('Failed to load auto-refraction data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit examinations');
      return;
    }

    try {
      setLoading(true);
      
      if (autoRefraction?.id) {
        await autoRefractionApi.update(autoRefraction.id, data);
        toast.success('Auto-refraction updated successfully');
      } else {
        await autoRefractionApi.save(data);
        toast.success('Auto-refraction saved successfully');
      }
      
      if (patientId) {
        await loadAutoRefraction(patientId);
      }
      
      setError(null);
    } catch (error: any) {
      console.error('Failed to save auto-refraction:', error);
      setError('Failed to save auto-refraction data');
      toast.error('Failed to save auto-refraction data');
    } finally {
      setLoading(false);
    }
  };

  const formatRx = (rx: { sphere: number; cylinder: number; axis: number }) => {
    return `${rx.sphere > 0 ? '+' : ''}${rx.sphere.toFixed(2)} DS${
      rx.cylinder !== 0 ? ` / ${rx.cylinder.toFixed(2)} DC × ${rx.axis}°` : ''
    }`;
  };

  if (!patientId) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Auto Refraction</h1>
          <p className="text-gray-600">Search and select a patient to perform automated refraction.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          <PatientSearchSelector 
            currentPath="/dashboard/examination/auto-refraction"
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
              <h1 className="text-2xl font-bold text-gray-900">Auto-Refractometry (Objective Refraction)</h1>
              {currentPatient && (
                <p className="text-gray-600 mt-1">
                  Patient: {currentPatient.firstName} {currentPatient.lastName} (MRN: {currentPatient.mrn})
                </p>
              )}
            </div>
          </div>
          
          {refraction && autoRefraction && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <GitCompare className="h-5 w-5 mr-2" />
              {showComparison ? 'Hide' : 'Show'} Comparison
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

        {/* Comparison with Subjective Refraction */}
        {showComparison && refraction && autoRefraction && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <GitCompare className="h-5 w-5 mr-2 text-purple-600" />
              Auto-Refraction vs Subjective Refraction Comparison
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OD Comparison */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-900">OD (Right Eye)</h3>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Auto-Refraction (Device):</span>
                    <span className="text-xs text-gray-500">{autoRefraction.device.manufacturer}</span>
                  </div>
                  <div className="font-mono text-lg text-purple-900">
                    {formatRx({
                      sphere: autoRefraction.OD.sphere || 0,
                      cylinder: autoRefraction.OD.cylinder || 0,
                      axis: autoRefraction.OD.axis || 0
                    })}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Subjective Refraction (Manual):</span>
                  </div>
                  <div className="font-mono text-lg text-green-900">
                    {formatRx({
                      sphere: refraction.finalRx.OD.sphere || 0,
                      cylinder: refraction.finalRx.OD.cylinder || 0,
                      axis: refraction.finalRx.OD.axis || 0
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-700">Difference:</span>
                  <div className="mt-1 space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Sphere:</span>
                      <span className="ml-2 font-medium">
                        {Math.abs((autoRefraction.OD.sphere || 0) - (refraction.finalRx.OD.sphere || 0)).toFixed(2)} D
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cylinder:</span>
                      <span className="ml-2 font-medium">
                        {Math.abs((autoRefraction.OD.cylinder || 0) - (refraction.finalRx.OD.cylinder || 0)).toFixed(2)} D
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Axis:</span>
                      <span className="ml-2 font-medium">
                        {Math.abs((autoRefraction.OD.axis || 0) - (refraction.finalRx.OD.axis || 0))}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* OS Comparison */}
              <div className="space-y-4">
                <h3 className="font-semibold text-green-900">OS (Left Eye)</h3>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Auto-Refraction (Device):</span>
                    <span className="text-xs text-gray-500">{autoRefraction.device.manufacturer}</span>
                  </div>
                  <div className="font-mono text-lg text-purple-900">
                    {formatRx({
                      sphere: autoRefraction.OS.sphere || 0,
                      cylinder: autoRefraction.OS.cylinder || 0,
                      axis: autoRefraction.OS.axis || 0
                    })}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Subjective Refraction (Manual):</span>
                  </div>
                  <div className="font-mono text-lg text-green-900">
                    {formatRx({
                      sphere: refraction.finalRx.OS.sphere || 0,
                      cylinder: refraction.finalRx.OS.cylinder || 0,
                      axis: refraction.finalRx.OS.axis || 0
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-700">Difference:</span>
                  <div className="mt-1 space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Sphere:</span>
                      <span className="ml-2 font-medium">
                        {Math.abs((autoRefraction.OS.sphere || 0) - (refraction.finalRx.OS.sphere || 0)).toFixed(2)} D
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cylinder:</span>
                      <span className="ml-2 font-medium">
                        {Math.abs((autoRefraction.OS.cylinder || 0) - (refraction.finalRx.OS.cylinder || 0)).toFixed(2)} D
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Axis:</span>
                      <span className="ml-2 font-medium">
                        {Math.abs((autoRefraction.OS.axis || 0) - (refraction.finalRx.OS.axis || 0))}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Auto-refraction provides an objective starting point but should always be refined with subjective refraction for final prescription. Typical differences of 0.25-0.75D are normal.
              </p>
            </div>
          </div>
        )}

        {/* Auto-Refraction Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Auto-Refractometry Measurement</h2>
            <p className="text-sm text-gray-600 mb-6">
              Objective measurement of refractive error using automated refractometer. Provides starting point for subjective refraction.
            </p>
            <AutoRefractionForm 
              initialData={autoRefraction}
              patientId={patientId}
              onSave={handleSave}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
