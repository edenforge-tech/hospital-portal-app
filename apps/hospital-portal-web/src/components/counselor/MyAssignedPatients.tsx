/**
 * My Assigned Patients Component
 * Shows only patients assigned to the current counselor
 */

'use client';

import React from 'react';
import { Clock, Activity, AlertCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignedPatient {
  id: string;
  patientId: string;
  patientName?: string;
  tokenNumber: string;
  mrn?: string;
  age?: number;
  gender?: string;
  phone?: string;
  photoUrl?: string;
  urgencyLevel?: string;
  waitTime?: number;
  addedToQueueAt?: string;
  sessionType?: string;
  reason?: string;
}

interface MyAssignedPatientsProps {
  patients: AssignedPatient[];
  selectedPatientId: string | null;
  onSelectPatient: (patient: AssignedPatient) => void;
  isLoading?: boolean;
  className?: string;
}

export function MyAssignedPatients({
  patients,
  selectedPatientId,
  onSelectPatient,
  isLoading = false,
  className,
}: MyAssignedPatientsProps) {
  
  // Calculate wait time
  const getWaitTime = (addedToQueueAt?: string): number => {
    if (!addedToQueueAt) return 0;
    return Math.floor((Date.now() - new Date(addedToQueueAt).getTime()) / 60000);
  };

  // Get urgency styles
  const getUrgencyStyles = (urgency?: string) => {
    const level = urgency || 'Normal';
    switch (level) {
      case 'Critical':
        return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', dot: 'bg-red-500' };
      case 'High':
        return { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', dot: 'bg-orange-500' };
      case 'Medium':
        return { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      default:
        return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', dot: 'bg-blue-500' };
    }
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">
          📋 My Assigned Patients
          <span className="ml-2 text-gray-500">({patients.length})</span>
        </h3>
      </div>

      {/* Patients List */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-500">Loading assigned patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-900 mb-1">No Assigned Patients</p>
            <p className="text-xs text-gray-500">
              Patients assigned to you will appear here
            </p>
          </div>
        ) : (
          patients.map((patient) => {
            const waitTime = getWaitTime(patient.addedToQueueAt);
            const urgencyStyles = getUrgencyStyles(patient.urgencyLevel);
            const isSelected = selectedPatientId === patient.id;

            return (
              <div
                key={patient.id}
                className={cn(
                  'p-3 cursor-pointer transition-all border-l-4 hover:bg-gray-50',
                  isSelected
                    ? 'bg-blue-50 border-l-blue-600'
                    : urgencyStyles.border.replace('border-', 'border-l-')
                )}
              >
                {/* Header: Priority Badge + Wait Time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-bold rounded',
                      urgencyStyles.bg,
                      urgencyStyles.text
                    )}>
                      {patient.urgencyLevel === 'Critical' ? '🔴' : 
                       patient.urgencyLevel === 'High' ? '🟡' : '🟢'} {patient.tokenNumber}
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      urgencyStyles.bg
                    )}>
                      {patient.urgencyLevel || 'NORMAL'}
                    </span>
                  </div>
                  {waitTime > 0 && (
                    <span className="text-xs text-gray-600 font-medium">
                      Wait: {waitTime}m
                    </span>
                  )}
                </div>

                {/* Patient Info with Photo */}
                <div className="flex items-start gap-3 mb-2">
                  {/* Patient Photo */}
                  <div className="flex-shrink-0">
                    {patient.photoUrl ? (
                      <img
                        src={patient.photoUrl}
                        alt={patient.patientName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {(patient.patientName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Patient Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {patient.patientName || 'Unknown Patient'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      {patient.gender && patient.age && (
                        <span>{patient.gender}, {patient.age}y</span>
                      )}
                      {patient.mrn && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{patient.mrn}</span>
                        </>
                      )}
                    </div>
                    {patient.phone && (
                      <p className="text-xs text-gray-500 mt-0.5">📞 {patient.phone}</p>
                    )}
                  </div>
                </div>

                {/* Reason/Session Type */}
                {(patient.reason || patient.sessionType) && (
                  <p className="text-xs text-blue-600 mb-2 line-clamp-1">
                    {patient.reason || patient.sessionType}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    ▶️ {isSelected ? 'Continue' : 'Start Session'}
                  </button>
                  <button
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="View patient history"
                  >
                    📋
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      {patients.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Avg Wait: <span className="font-semibold">
                {Math.round(patients.reduce((sum, p) => sum + getWaitTime(p.addedToQueueAt), 0) / patients.length)}m
              </span>
            </span>
            <span>
              Longest: <span className="font-semibold">
                {Math.max(...patients.map(p => getWaitTime(p.addedToQueueAt)), 0)}m
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
