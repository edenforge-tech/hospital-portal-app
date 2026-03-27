/**
 * Patient Summary Widget
 * Displays patient demographics, MRN, referral source, chief complaint
 */

'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, User as Mail, MapPin, Calendar, XCircle as Droplet, AlertCircle, Activity as Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi, type PatientSummaryData } from '@/lib/api/widgets.api';

export default function PatientSummaryWidget({
  patientId,
  size,
  data,
}: WidgetProps) {
  const [patient, setPatient] = useState<PatientSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      const patientData = await widgetsApi.getPatientSummary(patientId);
      setPatient(patientData);
    } catch (err: any) {
      console.error('Error loading patient data:', err);
      setError(err.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const isCompact = size === 'small';

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
        <User className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No patient selected</p>
        <p className="text-xs text-gray-400 mt-1">Select a patient from the queue to view details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
        <Loader className="h-8 w-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading patient data...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
        <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
        <p className="text-sm text-red-600">{error || 'Failed to load patient'}</p>
        <button
          onClick={loadPatientData}
          className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900">
            {patient.firstName} {patient.lastName}
          </h4>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">MRN: {patient.mrn || 'Not assigned'}</span>
            <span>•</span>
            <span>{patient.age}Y / {patient.gender}</span>
            {patient.bloodGroup && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Droplet className="h-3 w-3" />
                  {patient.bloodGroup}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {!isCompact && (
        <>
          {/* Contact Information - Only show if data exists */}
          {(patient.contactNumber || patient.email || patient.address || patient.dateOfBirth) && (
            <div className="space-y-2">
              {patient.contactNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{patient.contactNumber}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 line-clamp-1">{patient.address}</span>
                </div>
              )}
              {patient.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Allergies Alert */}
          {patient.allergies && patient.allergies.trim() !== '' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Allergies</p>
                <p className="text-sm text-red-700">{patient.allergies}</p>
              </div>
            </div>
          )}

          {/* Chief Complaint */}
          {patient.chiefComplaint && patient.chiefComplaint.trim() !== '' && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chief Complaint</p>
              <p className="text-sm text-gray-700 leading-relaxed">{patient.chiefComplaint}</p>
            </div>
          )}

          {/* Referral Information */}
          {patient.referralSource && patient.referralSource.trim() !== '' && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Referred By
              </p>
              <p className="text-sm text-gray-700">{patient.referralSource}</p>
              {patient.referredDate && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(patient.referredDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
