'use client';

/**
 * FollowupPatientCard
 * Card for the Surgery Followup tab showing:
 *  - Aging badge (days since session)
 *  - Days since last contact
 *  - Delay reason (inline editable)
 *  - Quick actions: Log Call, Schedule Callback, Open session
 */

import React, { useState } from 'react';
import { Phone, Calendar, ChevronRight, Users, Zap, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PendingDecisionPatient } from '@/hooks/use-pending-decisions';
import { AgingBadge } from './AgingBadge';
import { ReasonForDelayBadge } from './ReasonForDelayBadge';
import { CommunicationLogModal } from './CommunicationLogModal';
import { CallbackSchedulerModal } from './CallbackSchedulerModal';
import { QuickSurgeryBookingModal } from './QuickSurgeryBookingModal';

interface FollowupPatientCardProps {
  patient: PendingDecisionPatient;
  isSelected?: boolean;
  onSelect: (patient: PendingDecisionPatient) => void;
  onDelayReasonUpdate?: (sessionId: string, reason: string) => void;
  multiSelectMode?: boolean;
  selectedInBatch?: boolean;
}

export function FollowupPatientCard({
  patient,
  isSelected = false,
  onSelect,
  onDelayReasonUpdate,
  multiSelectMode = false,
  selectedInBatch = false,
}: FollowupPatientCardProps) {
  const [showLogCall, setShowLogCall] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showQuickBook, setShowQuickBook] = useState(false);

  const isOverdue = patient.daysSinceContact > 7;
  const canConvert = patient.patientAgreedToSurgery === true;
  const isAttenderOnly = !!(patient.attenderName && !patient.patientId);
  const hasCallback = !!patient.nextCallbackDate;
  const callbackOverdue = hasCallback && new Date(patient.nextCallbackDate!) < new Date();

  const initials = (patient.patientName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div
        onClick={() => onSelect(patient)}
        className={cn(
          'border-l-4 bg-white border-b border-gray-100 px-4 py-3 cursor-pointer transition-all relative',
          isSelected ? 'border-l-blue-600 bg-blue-50' : 'border-l-amber-400',
          multiSelectMode && selectedInBatch ? 'bg-blue-50 border-l-blue-500' : '',
          'hover:bg-gray-50'
        )}
      >
        {/* Multi-select checkbox overlay */}
        {multiSelectMode && (
          <div className="absolute top-3 right-3 z-10">
            {selectedInBatch
              ? <CheckSquare className="w-5 h-5 text-blue-600" />
              : <Square className="w-5 h-5 text-gray-400" />
            }
          </div>
        )}
        {/* Row 1: Aging + contact + outcome pills */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <AgingBadge daysSince={patient.daysSinceSession} />
            {isOverdue && (
              <span className="animate-pulse text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">
                OVERDUE
              </span>
            )}
            {!isOverdue && patient.daysSinceContact > 0 && (
              <span className="text-[10px] text-gray-500">
                Contact: <strong>{patient.daysSinceContact}d ago</strong>
              </span>
            )}
            {isOverdue && (
              <span className="text-[10px] text-red-600">
                No contact: <strong>{patient.daysSinceContact}d</strong>
              </span>
            )}
            {patient.callbackCount > 0 && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                {patient.callbackCount}× called
              </span>
            )}
          </div>
          {/* Decision outcome badge */}
          {patient.patientAgreedToSurgery === true && (
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">Agreed</span>
          )}
          {patient.patientAgreedToSurgery === false && (
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">Declined</span>
          )}
          {patient.patientAgreedToSurgery === undefined && (
            <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded">Undecided</span>
          )}
        </div>

        {/* Row 2: Patient identity */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{patient.patientName}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              {patient.age && patient.gender && <span className="text-xs text-gray-500">{patient.gender} • {patient.age}y</span>}
              {patient.mrn && <span className="text-[10px] font-mono bg-gray-100 px-1 rounded text-gray-600">{patient.mrn}</span>}
              {isAttenderOnly && (
                <span className="flex items-center gap-0.5 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                  <Users className="w-2.5 h-2.5" /> Attender Only
                </span>
              )}
            </div>
            {patient.attenderName && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                Via: {patient.attenderName} ({patient.attenderRelation})
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Procedure + delay reason */}
        {(patient.recommendedSurgery || patient.reasonsForDelay) && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {patient.recommendedSurgery && (
              <span className="text-[11px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[180px]">
                {patient.recommendedSurgery}
              </span>
            )}
            <ReasonForDelayBadge
              sessionId={patient.sessionId}
              value={patient.reasonsForDelay}
              onUpdate={(reason) => onDelayReasonUpdate?.(patient.sessionId, reason)}
            />
          </div>
        )}

        {/* Row 4: Callback info */}
        {hasCallback && (
          <div className={cn(
            'flex items-center gap-1 text-[10px] px-2 py-1 rounded mb-2',
            callbackOverdue ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
          )}>
            <Calendar className="w-3 h-3 flex-shrink-0" />
            {callbackOverdue ? '⚠ Callback overdue: ' : 'Callback: '}
            {new Date(patient.nextCallbackDate!).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        )}

        {/* Row 5: Quick Actions */}
        <div className="flex items-center gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowLogCall(true)}
            className="flex items-center gap-1 text-xs py-1.5 px-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Phone className="w-3 h-3" /> Log Call
          </button>
          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-1 text-xs py-1.5 px-2.5 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-3 h-3" /> Schedule
          </button>
          {canConvert && (
            <button
              onClick={() => setShowQuickBook(true)}
              className="flex items-center gap-1 text-xs py-1.5 px-2.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-semibold"
              title="Convert to surgery booking"
            >
              <Zap className="w-3 h-3" /> Convert
            </button>
          )}
          <button
            onClick={() => onSelect(patient)}
            className="ml-auto p-1.5 text-gray-400 hover:bg-gray-100 rounded-md"
            title="Open session"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showLogCall && (
        <CommunicationLogModal
          sessionId={patient.sessionId}
          patientName={patient.patientName}
          onClose={() => setShowLogCall(false)}
        />
      )}

      {showSchedule && (
        <CallbackSchedulerModal
          sessionId={patient.sessionId}
          patientId={patient.patientId}
          patientName={patient.patientName}
          onClose={() => setShowSchedule(false)}
        />
      )}

      {showQuickBook && (
        <QuickSurgeryBookingModal
          sessionId={patient.sessionId}
          patientName={patient.patientName}
          recommendedSurgery={patient.recommendedSurgery}
          onClose={() => setShowQuickBook(false)}
        />
      )}
    </>
  );
}
