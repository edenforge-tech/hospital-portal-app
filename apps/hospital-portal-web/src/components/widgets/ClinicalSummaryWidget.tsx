/**
 * Clinical Summary Widget
 * Displays diagnosis, IOP, visual acuity, previous history from doctor referral
 */

'use client';

import React, { useState, useEffect } from 'react';
import { XCircle as Eye, TrendingUp, FileText, AlertCircle as AlertTriangle, Clock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi, type ClinicalSummaryData } from '@/lib/api/widgets.api';

export default function ClinicalSummaryWidget({
  widgetId,
  patientId,
  sessionId,
  size,
  isMinimized,
  data,
  onAction,
  onDataChange,
}: WidgetProps) {
  const [clinicalData, setClinicalData] = useState<ClinicalSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      loadClinicalData();
    }
  }, [patientId]);

  const loadClinicalData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await widgetsApi.getClinicalSummary(patientId);
      setClinicalData(data);
    } catch (err: any) {
      console.error('Error loading clinical data:', err);
      setError(err.message || 'Failed to load clinical data');
    } finally {
      setLoading(false);
    }
  };

  const isCompact = size === 'small';

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 py-6 min-h-[150px]">
        <FileText className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No patient selected</p>
        <p className="text-xs text-gray-400 mt-1">Select a patient to view clinical summary</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 min-h-[150px]">
        <Activity className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading clinical data...</span>
      </div>
    );
  }

  if (error || !clinicalData) {
    return (
      <div className="text-center p-4 min-h-[150px]">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-gray-700">{error || 'No clinical data available'}</p>
        <button
          onClick={loadClinicalData}
          className="mt-3 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isCompact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{clinicalData.diagnosis}</span>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>VA: RE {clinicalData.visualAcuity?.rightEye?.distance || 'N/A'} | LE {clinicalData.visualAcuity?.leftEye?.distance || 'N/A'}</div>
          <div>IOP: RE {clinicalData.iop?.rightEye || 'N/A'}mmHg | LE {clinicalData.iop?.leftEye || 'N/A'}mmHg</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-start gap-2">
          <Eye className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{clinicalData.diagnosis}</p>
            <p className="text-xs text-gray-600 mt-1">ICD-10: {clinicalData.icd10Code}</p>
          </div>
        </div>
      </div>

      {/* Referral Information */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 font-medium">Referring Doctor</p>
          <p className="text-sm text-gray-900 font-medium mt-1">{clinicalData.referringDoctor}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Referral Date</p>
          <p className="text-sm text-gray-900 font-medium mt-1">
            {clinicalData.referralDate ? new Date(clinicalData.referralDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Chief Complaint */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">Chief Complaint</p>
        <p className="text-sm text-gray-700">{clinicalData.chiefComplaint}</p>
      </div>

      {/* Visual Acuity Grid */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">Visual Acuity</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center font-medium text-gray-600"></div>
          <div className="text-center font-medium text-gray-600">Distance</div>
          <div className="text-center font-medium text-gray-600">Near</div>
          
          <div className="text-left font-medium text-gray-700">RE</div>
          <div className="text-center bg-gray-50 rounded px-2 py-1">{clinicalData.visualAcuity?.rightEye?.distance || 'N/A'}</div>
          <div className="text-center bg-gray-50 rounded px-2 py-1">{clinicalData.visualAcuity?.rightEye?.near || 'N/A'}</div>
          
          <div className="text-left font-medium text-gray-700">LE</div>
          <div className="text-center bg-gray-50 rounded px-2 py-1">{clinicalData.visualAcuity?.leftEye?.distance || 'N/A'}</div>
          <div className="text-center bg-gray-50 rounded px-2 py-1">{clinicalData.visualAcuity?.leftEye?.near || 'N/A'}</div>
        </div>
      </div>

      {/* IOP & Cataract Grade */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Intraocular Pressure</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between bg-gray-50 rounded px-2 py-1">
              <span className="text-gray-700">RE</span>
              <span className="font-medium">{clinicalData.iop?.rightEye || 'N/A'} mmHg</span>
            </div>
            <div className="flex justify-between bg-gray-50 rounded px-2 py-1">
              <span className="text-gray-700">LE</span>
              <span className="font-medium">{clinicalData.iop?.leftEye || 'N/A'} mmHg</span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Cataract Grade</p>
          <div className="space-y-1 text-xs">
            <div className="bg-gray-50 rounded px-2 py-1">
              <span className="text-gray-600">RE: </span>
              <span className="font-medium text-gray-900">{clinicalData.cataractGrade?.rightEye || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1">
              <span className="text-gray-600">LE: </span>
              <span className="font-medium text-gray-900">{clinicalData.cataractGrade?.leftEye || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Allergies Alert */}
      {clinicalData.allergies?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-900">Allergies</p>
              <p className="text-sm text-red-800 mt-1">{clinicalData.allergies.join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comorbidities */}
      {clinicalData.comorbidities?.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Comorbidities</p>
          <div className="flex flex-wrap gap-2">
            {clinicalData.comorbidities.map((condition: string, idx: number) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Medications */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">Current Medications</p>
        <div className="space-y-1">
          {clinicalData.currentMedications?.map((med, idx: number) => (
            <div key={idx} className="text-sm text-gray-700 bg-gray-50 rounded px-2 py-1 flex items-center gap-2">
              <Activity className="h-3 w-3 text-gray-400" />
              {typeof med === 'string' ? med : `${med.name} - ${med.dosage}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
