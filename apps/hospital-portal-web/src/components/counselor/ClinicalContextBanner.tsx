/**
 * Clinical Context Banner
 * Displayed at the top of the active session workspace.
 * Bridges Optometrist findings → Counselor session context.
 * Shows VA, IOP, diagnosis, doctor's referral notes so the counselor
 * has the full clinical picture without leaving their workspace.
 * Created: March 10, 2026
 */

'use client';

import React, { useState } from 'react';
import { Eye, Activity, FileText, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClinicalContext {
  // From Optometrist examination
  visualAcuityOD?: string;
  visualAcuityOS?: string;
  iopOD?: number;
  iopOS?: number;
  optometristDiagnosis?: string;
  optometristNotes?: string;
  examsCompleted?: string[]; // ['Visual Acuity', 'IOP', 'Retinoscopy']

  // From Doctor referral
  referredByDoctorName?: string;
  doctorDiagnosis?: string;
  doctorNotes?: string;
  recommendedProcedure?: string;
  recommendedEye?: string; // 'OD' | 'OS' | 'OU'
  operatingDoctorName?: string;
}

interface ClinicalContextBannerProps {
  context: ClinicalContext | null;
  patientName: string;
  isLoading?: boolean;
}

export function ClinicalContextBanner({
  context,
  patientName,
  isLoading = false,
}: ClinicalContextBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-4 my-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 animate-pulse">
        <div className="h-3 bg-blue-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-blue-100 rounded w-2/3" />
      </div>
    );
  }

  if (!context) return null;

  const iopHigh =
    (context.iopOD != null && context.iopOD > 21) ||
    (context.iopOS != null && context.iopOS > 21);

  const hasOptometristData =
    context.visualAcuityOD ||
    context.visualAcuityOS ||
    context.iopOD != null ||
    context.iopOS != null ||
    context.optometristDiagnosis;

  const hasDoctorData =
    context.referredByDoctorName ||
    context.doctorDiagnosis ||
    context.recommendedProcedure;

  if (!hasOptometristData && !hasDoctorData) return null;

  return (
    <div
      className={cn(
        'mx-4 mt-3 border rounded-xl overflow-hidden transition-all',
        iopHigh ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'
      )}
    >
      {/* Collapsed header (always visible) */}
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-blue-100/50 transition-colors"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Optometrist summary pills */}
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-800">
            <Eye className="w-3.5 h-3.5" />
            Clinical Summary — {patientName}
          </span>
          {context.visualAcuityOD && (
            <span className="bg-white border border-blue-200 text-blue-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
              VA OD: {context.visualAcuityOD}
            </span>
          )}
          {context.visualAcuityOS && (
            <span className="bg-white border border-blue-200 text-blue-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
              VA OS: {context.visualAcuityOS}
            </span>
          )}
          {context.iopOD != null && (
            <span
              className={cn(
                'text-[11px] px-2 py-0.5 rounded-full font-mono',
                context.iopOD > 21
                  ? 'bg-red-100 border border-red-300 text-red-700 font-bold'
                  : 'bg-white border border-blue-200 text-blue-700'
              )}
            >
              IOP OD: {context.iopOD}{context.iopOD > 21 ? ' ⚠️' : ''}
            </span>
          )}
          {context.iopOS != null && (
            <span
              className={cn(
                'text-[11px] px-2 py-0.5 rounded-full font-mono',
                context.iopOS > 21
                  ? 'bg-red-100 border border-red-300 text-red-700 font-bold'
                  : 'bg-white border border-blue-200 text-blue-700'
              )}
            >
              IOP OS: {context.iopOS}{context.iopOS > 21 ? ' ⚠️' : ''}
            </span>
          )}
          {context.recommendedProcedure && (
            <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] px-2 py-0.5 rounded-full font-semibold">
              🔧 {context.recommendedProcedure}
            </span>
          )}
        </div>
        <span className="flex-shrink-0 ml-2 text-blue-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-blue-200 grid grid-cols-2 gap-px bg-blue-200">
          {/* Optometrist column */}
          {hasOptometristData && (
            <div className="bg-blue-50 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Optometrist Findings</p>
              </div>
              {(context.visualAcuityOD || context.visualAcuityOS) && (
                <div className="text-xs text-gray-700">
                  <span className="font-semibold">Visual Acuity: </span>
                  OD {context.visualAcuityOD || '—'} · OS {context.visualAcuityOS || '—'}
                </div>
              )}
              {(context.iopOD != null || context.iopOS != null) && (
                <div className={cn('text-xs', iopHigh ? 'text-red-700 font-semibold' : 'text-gray-700')}>
                  <span className="font-semibold">IOP: </span>
                  OD {context.iopOD ?? '—'} · OS {context.iopOS ?? '—'} mmHg
                  {iopHigh && ' ⚠️ HIGH'}
                </div>
              )}
              {context.optometristDiagnosis && (
                <div className="text-xs text-gray-700">
                  <span className="font-semibold">Diagnosis: </span>
                  {context.optometristDiagnosis}
                </div>
              )}
              {context.examsCompleted && context.examsCompleted.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {context.examsCompleted.map((exam, i) => (
                    <span key={i} className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded">
                      ✓ {exam}
                    </span>
                  ))}
                </div>
              )}
              {context.optometristNotes && (
                <p className="text-[11px] text-gray-600 italic mt-1 line-clamp-2">{context.optometristNotes}</p>
              )}
            </div>
          )}

          {/* Doctor referral column */}
          {hasDoctorData && (
            <div className="bg-indigo-50 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Doctor's Referral</p>
              </div>
              {context.referredByDoctorName && (
                <div className="text-xs text-gray-700">
                  <span className="font-semibold">Referred by: </span>
                  {context.referredByDoctorName}
                </div>
              )}
              {context.doctorDiagnosis && (
                <div className="text-xs text-gray-700">
                  <span className="font-semibold">Diagnosis: </span>
                  {context.doctorDiagnosis}
                </div>
              )}
              {context.recommendedProcedure && (
                <div className="text-xs text-gray-700">
                  <span className="font-semibold">Procedure: </span>
                  {context.recommendedProcedure}
                  {context.recommendedEye && ` (${context.recommendedEye})`}
                </div>
              )}
              {context.operatingDoctorName && (
                <div className="text-xs text-gray-700">
                  <span className="font-semibold">Operating: </span>
                  {context.operatingDoctorName}
                </div>
              )}
              {context.doctorNotes && (
                <p className="text-[11px] text-gray-600 italic mt-1 line-clamp-3">{context.doctorNotes}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
