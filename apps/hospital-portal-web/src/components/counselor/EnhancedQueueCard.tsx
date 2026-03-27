/**
 * Enhanced Patient Queue Card
 * Rich counselor queue card cross-pollinated from Optometrist dashboard:
 *   - Clinical summary (VA / IOP from optometrist)
 *   - Doctor's referral reason + recommended procedure
 *   - Package preference surfaced upfront
 *   - Urgency colour-coded border + wait-time animation
 *   - Source badge, session type, red-flags
 * Created: March 10, 2026
 */

'use client';

import React from 'react';
import {
  Clock,
  AlertCircle,
  Eye,
  Activity,
  FileText,
  ChevronRight,
  CheckCircle,
  Phone,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EnhancedPatientData {
  // Core identifiers
  id: string;
  patientId: string;
  tokenNumber: string;
  patientName?: string;
  mrn?: string;
  age?: number;
  gender?: string;
  phone?: string;
  photoUrl?: string;

  // Queue / scheduling
  urgencyLevel?: string; // 'Critical' | 'High' | 'Medium' | 'Normal'
  sessionType?: string;  // 'Initial' | 'Followup' | 'Pre-admission' | 'Post-op' | 'AttenderCounseling'
  source?: string;       // 'OPD' | 'Walk-in' | 'Post-Op' | 'Follow-up'
  addedToQueueAt?: string;
  queueStatus?: string;  // 'Waiting' | 'InProgress' | 'Completed'
  status?: string;
  sessionCount?: number; // total counseling sessions for this patient (Nth Visit)

  // Doctor's referral context (key addition)
  referralReason?: string;        // "Cataract OD — surgery advised"
  referredByDoctorName?: string;  // "Dr. Ravi Shankar"
  recommendedProcedure?: string;  // "Phacoemulsification + PCIOL"
  preferredPackage?: string;      // "Premium (₹85,000)"

  // Optometrist clinical summary (key addition)
  visualAcuityOD?: string;  // "6/60"
  visualAcuityOS?: string;  // "6/36"
  iopOD?: number;           // 18
  iopOS?: number;           // 22
  optometristNotes?: string;

  // Red flags
  redFlags?: string[];  // ['High IOP', 'Diabetic']
}

interface EnhancedQueueCardProps {
  patient: EnhancedPatientData;
  isSelected?: boolean;
  onStartSession: (patient: EnhancedPatientData) => void;
  onViewHistory?: (patient: EnhancedPatientData) => void;
  onLogCall?: (patient: EnhancedPatientData) => void;
}

const URGENCY_STYLES: Record<string, { border: string; badge: string; badgeText: string; dot: string }> = {
  Critical: {
    border: 'border-l-red-500',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'text-red-700',
    dot: 'bg-red-500',
  },
  High: {
    border: 'border-l-orange-400',
    badge: 'bg-orange-100 text-orange-700',
    badgeText: 'text-orange-700',
    dot: 'bg-orange-400',
  },
  Medium: {
    border: 'border-l-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700',
    badgeText: 'text-yellow-700',
    dot: 'bg-yellow-400',
  },
  Normal: {
    border: 'border-l-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    badgeText: 'text-blue-700',
    dot: 'bg-blue-400',
  },
};

const SOURCE_BADGE: Record<string, string> = {
  OPD: 'bg-blue-50 text-blue-700',
  'Walk-in': 'bg-teal-50 text-teal-700',
  'Post-Op': 'bg-purple-50 text-purple-700',
  'Follow-up': 'bg-indigo-50 text-indigo-700',
};

function getWaitMinutes(addedAt?: string): number {
  if (!addedAt) return 0;
  return Math.floor((Date.now() - new Date(addedAt).getTime()) / 60000);
}

export function EnhancedQueueCard({
  patient,
  isSelected = false,
  onStartSession,
  onViewHistory,
  onLogCall,
}: EnhancedQueueCardProps) {
  const urgency = patient.urgencyLevel || 'Normal';
  const urgencyStyle = URGENCY_STYLES[urgency] || URGENCY_STYLES.Normal;
  const waitMins = getWaitMinutes(patient.addedToQueueAt);
  const status = patient.queueStatus || patient.status || 'Waiting';
  const isInProgress = status === 'InProgress' || status === 'In Progress';
  const isCompleted = status === 'Completed';
  const isAttenderOnly = patient.sessionType === 'AttenderCounseling';
  const visitLabel = patient.sessionCount && patient.sessionCount > 1
    ? `${patient.sessionCount}${ordinalSuffix(patient.sessionCount)} Visit`
    : null;

  const iopHigh = (patient.iopOD && patient.iopOD > 21) || (patient.iopOS && patient.iopOS > 21);

  const initials = (patient.patientName || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'relative border-l-4 bg-white border-b border-gray-100 px-4 py-3 transition-all',
        isSelected ? 'border-l-blue-600 bg-blue-50' : urgencyStyle.border,
        'hover:bg-gray-50 cursor-pointer'
      )}
      onClick={() => onStartSession(patient)}
    >
      {/* Row 1: Token + Urgency + Wait + Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Token badge */}
          <span className={cn('px-2 py-0.5 text-xs font-bold rounded font-mono', urgencyStyle.badge)}>
            {patient.tokenNumber}
          </span>
          {/* Urgency label */}
          <span className={cn('text-xs font-semibold', urgencyStyle.badgeText)}>
            {urgency === 'Critical' ? '🔴' : urgency === 'High' ? '🟠' : urgency === 'Medium' ? '🟡' : '🟢'} {urgency.toUpperCase()}
          </span>
          {/* Source */}
          {patient.source && (
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', SOURCE_BADGE[patient.source] || 'bg-gray-50 text-gray-600')}>
              {patient.source}
            </span>
          )}
          {/* Nth Visit badge */}
          {visitLabel && (
            <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
              {visitLabel}
            </span>
          )}
          {/* Attender-only badge */}
          {isAttenderOnly && (
            <span className="flex items-center gap-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
              <Users className="w-3 h-3" /> Attender Only
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Status pill */}
          {isInProgress && (
            <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              In Progress
            </span>
          )}
          {/* Wait time */}
          {waitMins > 0 && !isCompleted && (
            <span className={cn(
              'flex items-center gap-1 text-xs font-semibold',
              waitMins > 90 ? 'text-red-600' : waitMins > 45 ? 'text-orange-600' : 'text-gray-600'
            )}>
              <Clock className="w-3 h-3" />
              {waitMins}m
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Avatar + Name + Demographics */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-shrink-0">
          {patient.photoUrl ? (
            <img
              src={patient.photoUrl}
              alt={patient.patientName}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{patient.patientName || 'Unknown Patient'}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 flex-wrap">
            {patient.age && patient.gender && <span>{patient.gender} • {patient.age}y</span>}
            {patient.mrn && <span className="font-mono bg-gray-100 px-1 rounded">{patient.mrn}</span>}
            {patient.sessionType && (
              <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0 rounded text-[10px] font-medium">
                {patient.sessionType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Doctor Referral Context (NEW) */}
      {(patient.referralReason || patient.recommendedProcedure || patient.referredByDoctorName) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-2">
          <div className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              {patient.referredByDoctorName && (
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-0.5">
                  Referred by {patient.referredByDoctorName}
                </p>
              )}
              {patient.referralReason && (
                <p className="text-xs text-blue-800 font-medium line-clamp-1">{patient.referralReason}</p>
              )}
              {patient.recommendedProcedure && (
                <p className="text-[11px] text-blue-600 mt-0.5">Procedure: {patient.recommendedProcedure}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Row 4: Clinical Summary from Optometrist (NEW) */}
      {(patient.visualAcuityOD || patient.iopOD || patient.optometristNotes) && (
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {(patient.visualAcuityOD || patient.visualAcuityOS) && (
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <div className="flex items-center gap-1 mb-0.5">
                <Eye className="w-3 h-3 text-gray-500" />
                <p className="text-[10px] font-semibold text-gray-500 uppercase">Visual Acuity</p>
              </div>
              <p className="text-[11px] font-mono text-gray-800">OD: {patient.visualAcuityOD || '—'}</p>
              <p className="text-[11px] font-mono text-gray-800">OS: {patient.visualAcuityOS || '—'}</p>
            </div>
          )}
          {(patient.iopOD != null || patient.iopOS != null) && (
            <div className={cn('rounded px-2 py-1.5', iopHigh ? 'bg-red-50' : 'bg-gray-50')}>
              <div className="flex items-center gap-1 mb-0.5">
                <Activity className="w-3 h-3 text-gray-500" />
                <p className={cn('text-[10px] font-semibold uppercase', iopHigh ? 'text-red-600' : 'text-gray-500')}>
                  IOP {iopHigh ? '⚠️' : ''}
                </p>
              </div>
              <p className={cn('text-[11px] font-mono', patient.iopOD && patient.iopOD > 21 ? 'text-red-700 font-bold' : 'text-gray-800')}>
                OD: {patient.iopOD ?? '—'}
              </p>
              <p className={cn('text-[11px] font-mono', patient.iopOS && patient.iopOS > 21 ? 'text-red-700 font-bold' : 'text-gray-800')}>
                OS: {patient.iopOS ?? '—'}
              </p>
            </div>
          )}
          {patient.preferredPackage && (
            <div className="bg-emerald-50 rounded px-2 py-1.5">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-0.5">Package</p>
              <p className="text-[11px] text-emerald-800 font-medium line-clamp-2">{patient.preferredPackage}</p>
            </div>
          )}
        </div>
      )}

      {/* Row 5: Red Flags */}
      {patient.redFlags && patient.redFlags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
          <span className="text-[10px] font-bold text-red-600 uppercase">Flags:</span>
          {patient.redFlags.map((flag, i) => (
            <span key={i} className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
              {flag}
            </span>
          ))}
        </div>
      )}

      {/* Row 6: Actions */}
      {isCompleted ? (
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-md flex-shrink-0">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onStartSession(patient); }}
            className="flex-1 py-1.5 px-3 rounded-md text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors text-center"
          >
            Re-Counsel
          </button>
          {onLogCall && (
            <button
              onClick={(e) => { e.stopPropagation(); onLogCall(patient); }}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
              title="Log call"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
          {onViewHistory && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory(patient); }}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
              title="View session details"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartSession(patient);
            }}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-1.5',
              isSelected
                ? 'bg-blue-700 text-white'
                : isInProgress
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            <span>{isInProgress ? '↩ Continue' : '▶ Start Session'}</span>
          </button>
          {onViewHistory && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory(patient); }}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
              title="View patient history"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
