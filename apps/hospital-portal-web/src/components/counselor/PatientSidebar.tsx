'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Activity, MapPin, Calendar, AlertCircle, Clock, ChevronDown, ChevronRight, Stethoscope, Eye } from 'lucide-react';
import { getApi } from '@/lib/api';

interface PreviousSession {
  id: string;
  sessionDate?: string;
  createdAt: string;
  procedure?: string;
  surgerySurgeonName?: string;
  surgeryTentativeSurgeonName?: string;
  packageSelected?: string;
  iolSelected?: string;
  status: string;
  surgeryTentativeDate?: string;
}

interface PatientSidebarProps {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    mrn: string;
    phone?: string;
    email?: string;
    address?: string;
    photoUrl?: string;
    bloodGroup?: string;
    dateOfBirth?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
  };
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    recordedAt?: string;
  };
  surgeryRecommendation?: {
    doctorName: string;
    procedure: string;
    urgency: 'high' | 'medium' | 'low';
    notes?: string;
    recommendedDate?: string;
  };
  isLoading?: boolean;
}

export function PatientSidebar({ patient, vitals, surgeryRecommendation, isLoading }: PatientSidebarProps) {
  const [prevSessions, setPrevSessions] = useState<PreviousSession[]>([]);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [clinicalOpen, setClinicalOpen] = useState(false);
  const [clinicalSummary, setClinicalSummary] = useState<{
    diagnosis?: string;
    icd10Code?: string;
    chiefComplaint?: string;
    visualAcuity?: { rightEye: { distance: string }; leftEye: { distance: string } };
    iop?: { rightEye: number | null; leftEye: number | null };
    lastExamDate?: string;
    lastExamFindings?: string;
    referringDoctor?: string;
  } | null>(null);
  const [clinicalLoading, setClinicalLoading] = useState(false);

  useEffect(() => {
    if (patient?.id) {
      loadPrevSessions(patient.id);
      loadClinicalSummary(patient.id);
    }
  }, [patient?.id]);

  const loadPrevSessions = async (patientId: string) => {
    try {
      setSessionsLoading(true);
      const api = getApi();
      const res = await api.get(`/counseling/patients/${patientId}/sessions`);
      const raw = res.data;
      const arr = raw?.sessions ?? raw?.items ?? (Array.isArray(raw) ? raw : []);
      setPrevSessions(arr);
    } catch {
      // Non-critical — sidebar still shows patient info
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadClinicalSummary = async (patientId: string) => {
    try {
      setClinicalLoading(true);
      const api = getApi();
      const res = await api.get(`/examinations/patient/${patientId}`);
      const examinations: any[] = res.data || [];
      if (!examinations.length) return;
      const latest = examinations[0];
      setClinicalSummary({
        diagnosis: latest.diagnosis,
        icd10Code: latest.icd10Code,
        chiefComplaint: latest.chiefComplaint,
        visualAcuity: latest.visualAcuity ?? {
          rightEye: { distance: 'N/A' },
          leftEye: { distance: 'N/A' },
        },
        iop: latest.iop ?? { rightEye: null, leftEye: null },
        lastExamDate: latest.examinationDate,
        lastExamFindings: latest.findings,
        referringDoctor: latest.referringDoctor,
      });
    } catch {
      // Non-critical — sidebar still works without clinical history
    } finally {
      setClinicalLoading(false);
    }
  };

  const SESSION_STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    scheduled: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-600',
    'in-progress': 'bg-amber-100 text-amber-700',
  };
  if (isLoading || !patient) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <div className="p-4 space-y-4 animate-pulse overflow-y-auto flex-1 hide-scrollbar">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200"></div>
            <div className="h-6 w-32 bg-gray-200 rounded mt-4"></div>
            <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    return `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();
  };

  const getGradientForName = (name: string) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const getUrgencyColor = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-4 space-y-4 overflow-y-auto flex-1 hide-scrollbar">
        {/* Patient Photo & Basic Info — horizontal layout */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          {/* Semi-square photo — left */}
          <div className="flex-shrink-0">
            {patient.photoUrl ? (
              <img
                src={patient.photoUrl}
                alt={`${patient.firstName} ${patient.lastName}`}
                className="w-32 h-36 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
              />
            ) : (
              <div className={`w-32 h-36 rounded-xl bg-gradient-to-br ${getGradientForName(patient.firstName)} flex items-center justify-center border-2 border-gray-100 shadow-sm`}>
                <span className="text-4xl font-bold text-white">{getInitials()}</span>
              </div>
            )}
          </div>
          {/* Patient details — right */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 leading-tight truncate">
              {patient.firstName} {patient.lastName}
            </h2>
            <div className="mt-1 space-y-0.5">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{patient.age}Y</span>
                {' • '}
                <span className="font-medium text-gray-700">{patient.gender === 'male' ? 'Male' : patient.gender === 'female' ? 'Female' : patient.gender}</span>
              </p>
              {patient.dateOfBirth && (
                <p className="text-xs text-gray-500">
                  DOB: <span className="text-gray-700">{new Date(patient.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </p>
              )}
              <p className="text-xs font-mono text-gray-500 truncate">{patient.mrn}</p>
            </div>
            {patient.bloodGroup && (
              <div className="mt-1.5 inline-flex px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
                {patient.bloodGroup}
              </div>
            )}
          </div>
        </div>

        {/* Surgery Recommendation - Show FIRST for clinical priority */}
        {surgeryRecommendation && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Surgery Recommendation
            </h3>
            <div className={`border rounded-lg p-4 ${getUrgencyColor(surgeryRecommendation.urgency)}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold">{surgeryRecommendation.procedure}</p>
                  <p className="text-xs mt-1">Dr. {surgeryRecommendation.doctorName}</p>
                </div>
                <span className="px-2 py-1 text-xs font-semibold uppercase rounded">
                  {surgeryRecommendation.urgency}
                </span>
              </div>
              {surgeryRecommendation.notes && (
                <p className="text-xs mt-2 opacity-90">{surgeryRecommendation.notes}</p>
              )}
              {surgeryRecommendation.recommendedDate && (
                <p className="text-xs mt-2 font-medium">
                  Recommended: {new Date(surgeryRecommendation.recommendedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <User className="w-4 h-4" />
            Contact Information
          </h3>
          {patient.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm text-gray-900 font-medium">{patient.phone}</p>
              </div>
            </div>
          )}
          {patient.email && (
            <div className="flex items-start gap-3">
                           <Activity className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-900 break-all">{patient.email}</p>
              </div>
            </div>
          )}
          {patient.dateOfBirth && (
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="text-sm text-gray-900">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          {patient.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm text-gray-900">{patient.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        {(patient.emergencyContactName || patient.emergencyContactPhone) && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Emergency Contact
            </h3>
            {patient.emergencyContactName && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm text-gray-900 font-medium">{patient.emergencyContactName}</p>
                  {patient.emergencyContactRelation && (
                    <p className="text-xs text-gray-500 mt-0.5">({patient.emergencyContactRelation})</p>
                  )}
                </div>
              </div>
            )}
            {patient.emergencyContactPhone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900 font-medium">{patient.emergencyContactPhone}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vitals */}
        {vitals && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Vitals
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {vitals.bloodPressure && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">BP</p>
                  <p className="text-sm font-semibold text-gray-900">{vitals.bloodPressure}</p>
                </div>
              )}
              {vitals.heartRate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Heart Rate</p>
                  <p className="text-sm font-semibold text-gray-900">{vitals.heartRate} bpm</p>
                </div>
              )}
              {vitals.temperature && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Temp</p>
                  <p className="text-sm font-semibold text-gray-900">{vitals.temperature}°F</p>
                </div>
              )}
              {vitals.weight && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-sm font-semibold text-gray-900">{vitals.weight} kg</p>
                </div>
              )}
              {vitals.height && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Height</p>
                  <p className="text-sm font-semibold text-gray-900">{vitals.height} cm</p>
                </div>
              )}
              {vitals.bmi && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">BMI</p>
                  <p className="text-sm font-semibold text-gray-900">{vitals.bmi.toFixed(1)}</p>
                </div>
              )}
            </div>
            {vitals.recordedAt && (
              <p className="text-xs text-gray-500 italic">
                Recorded {new Date(vitals.recordedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
        {/* Clinical History */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setClinicalOpen(v => !v)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 uppercase tracking-wide py-1 hover:text-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Clinical History</span>
              {clinicalSummary?.lastExamDate && (
                <span className="text-[10px] bg-purple-100 text-purple-700 font-semibold px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                  {new Date(clinicalSummary.lastExamDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
              )}
            </div>
            {clinicalOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {clinicalOpen && (
            <div className="mt-2 space-y-2">
              {clinicalLoading ? (
                <div className="flex items-center gap-2 py-1 text-gray-400 text-xs">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  Loading…
                </div>
              ) : !clinicalSummary ? (
                <p className="text-xs text-gray-400 italic py-1">No clinical records found.</p>
              ) : (
                <>
                  {clinicalSummary.lastExamDate && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500">Last Exam:</span>
                      <span className="text-gray-800 font-medium">
                        {new Date(clinicalSummary.lastExamDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {clinicalSummary.diagnosis && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 text-xs">
                      <span className="text-blue-500 font-medium">Dx: </span>
                      <span className="text-blue-900 font-semibold">{clinicalSummary.diagnosis}</span>
                      {clinicalSummary.icd10Code && (
                        <span className="text-blue-400 ml-1">({clinicalSummary.icd10Code})</span>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-1">VA</p>
                      <p className="text-gray-700">RE: {clinicalSummary.visualAcuity?.rightEye?.distance || 'N/A'}</p>
                      <p className="text-gray-700">LE: {clinicalSummary.visualAcuity?.leftEye?.distance || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-1">IOP</p>
                      <p className="text-gray-700">RE: {clinicalSummary.iop?.rightEye ?? 'N/A'} mmHg</p>
                      <p className="text-gray-700">LE: {clinicalSummary.iop?.leftEye ?? 'N/A'} mmHg</p>
                    </div>
                  </div>
                  {clinicalSummary.chiefComplaint && (
                    <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 leading-relaxed line-clamp-2">
                      {clinicalSummary.chiefComplaint}
                    </p>
                  )}
                  {clinicalSummary.lastExamFindings && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Findings</p>
                      <p className="text-xs text-gray-600 line-clamp-3">{clinicalSummary.lastExamFindings}</p>
                    </div>
                  )}
                  {clinicalSummary.referringDoctor && (
                    <p className="text-xs text-gray-500">
                      Referred by: <span className="text-gray-700 font-medium">{clinicalSummary.referringDoctor}</span>
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Previous Sessions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setSessionsOpen(v => !v)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 uppercase tracking-wide py-1 hover:text-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span>Previous Sessions</span>
              {prevSessions.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                  {prevSessions.length}
                </span>
              )}
            </div>
            {sessionsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {sessionsOpen && (
            <div className="mt-3 space-y-2">
              {sessionsLoading ? (
                <div className="flex items-center gap-2 py-2 text-gray-400 text-xs">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  Loading sessions…
                </div>
              ) : prevSessions.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-1">No previous sessions found.</p>
              ) : (
                (() => {
                  // Group sessions by calendar date
                  const toDateKey = (s: PreviousSession) => {
                    const d = new Date(s.sessionDate || s.createdAt);
                    return d.toISOString().slice(0, 10); // YYYY-MM-DD
                  };
                  const groups: Record<string, PreviousSession[]> = {};
                  prevSessions.forEach(s => {
                    const k = toDateKey(s);
                    if (!groups[k]) groups[k] = [];
                    groups[k].push(s);
                  });
                  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
                  return (
                    <div className="space-y-2">
                      {sortedDates.map(dateKey => {
                        const dayLabel = new Date(dateKey).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                        const daySessions = groups[dateKey];
                        return (
                          <div key={dateKey}>
                            {/* Date header */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{dayLabel}</span>
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">{daySessions.length} session{daySessions.length > 1 ? 's' : ''}</span>
                            </div>
                            {/* Sessions under this date */}
                            <div className="space-y-1 pl-2 border-l-2 border-gray-200">
                              {daySessions.map((s, i) => (
                                <div key={s.id} className="rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-2 space-y-0.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-gray-700">Session {i + 1}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${SESSION_STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                      {s.status}
                                    </span>
                                  </div>
                                  {s.procedure && <p className="text-xs text-gray-600">{s.procedure}</p>}
                                  {(s.surgeryTentativeSurgeonName || s.surgerySurgeonName) && (
                                    <p className="text-xs text-gray-500">Dr. {s.surgeryTentativeSurgeonName ?? s.surgerySurgeonName}</p>
                                  )}
                                  {s.packageSelected && <p className="text-xs text-blue-600">Pkg: {s.packageSelected}</p>}
                                  {s.iolSelected && <p className="text-xs text-purple-600">IOL: {s.iolSelected}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
