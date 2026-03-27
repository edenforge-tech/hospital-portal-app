'use client';

/**
 * SurgeryConfirmedCard
 * Full patient card shown in the Surgery Confirmed tab.
 * Shows: countdown chip, surgery details, pre-admission checklist progress,
 * and quick-action buttons (Checklist | Coord | No-Show).
 */

import React, { useState } from 'react';
import {
  Calendar,
  Scissors,
  User,
  Clock,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SurgeryConfirmedPatient } from '@/hooks/use-surgery-confirmed';
import { usePreAdmissionWorkflow, getCurrentStep, getBlockers, isWorkflowComplete } from '@/hooks/use-pre-admission-workflow';
import { NoShowDialog } from './NoShowDialog';

/**
 * Adapter: convert hook's PreAdmissionChecklist shape → component's ChecklistState
 * Legacy helper — kept only for onChecklistChange callback signature compatibility.
 */
type ChecklistState = Record<string, boolean>;

function toChecklistState(p: SurgeryConfirmedPatient['preAdmissionChecklist']): ChecklistState {
  return {
    biometryDone:          p.preOpTestsDone,
    labsDone:              p.preOpTestsDone,
    ecgDone:               p.preOpTestsDone,
    anesthesiaClearance:   p.preOpTestsDone,
    consentSigned:         p.consentSigned,
    paymentConfirmed:      p.financialCleared,
    bedAssigned:           p.bedReserved === true,
    otSlotConfirmed:       p.otSlotConfirmed,
  };
}

interface SurgeryConfirmedCardProps {
  patient: SurgeryConfirmedPatient;
  isSelected?: boolean;
  onSelect: (patient: SurgeryConfirmedPatient) => void;
  onOpenCoordination?: (patient: SurgeryConfirmedPatient) => void;
  onChecklistChange?: (patient: SurgeryConfirmedPatient, updated: ChecklistState) => void;
  onNoShow?: (patient: SurgeryConfirmedPatient, action: 'reschedule' | 'hold' | 'cancel', notes: string) => void;
}

function surgeryCountdown(dateStr: string): { label: string; chip: string; bg: string } {
  const ms = new Date(dateStr).getTime() - Date.now();
  const hours = Math.floor(ms / 3_600_000);
  if (ms < 0) return { label: 'Past', chip: 'bg-gray-100 text-gray-500', bg: 'border-l-gray-400' };
  if (hours <= 24) return { label: `${hours}h left`, chip: 'bg-red-100 text-red-700', bg: 'border-l-red-500' };
  const days = Math.floor(ms / 86_400_000);
  if (days <= 2) return { label: `${days}d left`, chip: 'bg-amber-100 text-amber-700', bg: 'border-l-amber-400' };
  return { label: `${days}d left`, chip: 'bg-green-100 text-green-700', bg: 'border-l-green-500' };
}

export function SurgeryConfirmedCard({
  patient,
  isSelected = false,
  onSelect,
  onOpenCoordination,
  onChecklistChange,
  onNoShow,
}: SurgeryConfirmedCardProps) {
  const [showNoShowDialog, setShowNoShowDialog] = useState(false);

  const { data: workflow } = usePreAdmissionWorkflow(patient.scheduleId);
  const currentStep = getCurrentStep(workflow);
  const totalSteps = workflow?.totalSteps ?? 6;
  const blockingItems = getBlockers(workflow);
  const allReady = isWorkflowComplete(workflow);
  const overallProgress = workflow?.overallProgress ?? 0;

  const countdown = surgeryCountdown(patient.surgeryDate);

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
          'border-l-4 bg-white border-b border-gray-100 px-4 py-3 cursor-pointer transition-all',
          isSelected ? 'border-l-blue-600 bg-blue-50' : countdown.bg,
          'hover:bg-gray-50'
        )}
      >
        {/* Row 1: Countdown + Status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', countdown.chip)}>
              <Clock className="inline w-3 h-3 mr-0.5 -mt-0.5" />
              {countdown.label}
            </span>
            <span className={cn('text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded')}>
              {patient.otStatus}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(patient.surgeryDate).toLocaleDateString('en-IN', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>

        {/* Row 2: Patient info */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{patient.patientName}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-gray-500">
              {patient.age && patient.gender && <span>{patient.gender} • {patient.age}y</span>}
              {patient.mrn && <span className="font-mono bg-gray-100 px-1 rounded text-[10px]">{patient.mrn}</span>}
            </div>
          </div>
        </div>

        {/* Row 3: Surgery details */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 mb-2">
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
            {patient.surgeryType && (
              <span className="flex items-center gap-1 text-emerald-800 col-span-2 font-medium">
                <Scissors className="w-3 h-3" /> {patient.surgeryType}
                {patient.eye && <span className="text-emerald-600">({patient.eye})</span>}
              </span>
            )}
            {patient.surgeonName && (
              <span className="flex items-center gap-1 text-gray-600">
                <User className="w-3 h-3" /> {patient.surgeonName}
              </span>
            )}
            {patient.theatreName && (
              <span className="flex items-center gap-1 text-gray-600">
                <Calendar className="w-3 h-3" /> OT {patient.theatreName}
              </span>
            )}
          </div>
        </div>

        {/* Row 4: Workflow progress (Step N/6 + blocking badge + 6-dot breadcrumb) */}
        <div className="mb-2" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              {allReady ? (
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Steps Complete ✔
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-600">
                  Step {currentStep}/{totalSteps}
                </span>
              )}
              {blockingItems.length > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {blockingItems.length} blocking
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">{overallProgress}%</span>
          </div>

          {/* Mini 6-dot step breadcrumb */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNum = i + 1;
              const stepInfo = workflow?.steps.find(s => s.step === stepNum);
              const isDone = stepInfo?.isComplete ?? false;
              const isBlocked = stepInfo?.isBlocked ?? false;
              const isCurrent = !isDone && stepNum === currentStep;
              return (
                <React.Fragment key={stepNum}>
                  {i > 0 && (
                    <div className={cn('flex-1 h-0.5', isDone ? 'bg-emerald-400' : 'bg-gray-200')} />
                  )}
                  <div
                    className={cn(
                      'flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold',
                      isDone ? 'bg-emerald-500 text-white'
                        : isBlocked ? 'bg-red-400 text-white'
                        : isCurrent ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {isDone ? <CheckCircle2 className="w-2.5 h-2.5" /> : stepNum}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Row 5: Quick Actions */}
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {onOpenCoordination && (
            <button
              onClick={() => onOpenCoordination(patient)}
              className="flex-1 text-xs py-1.5 px-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
            >
              <ChevronRight className="w-3 h-3" /> Dept Coordination
            </button>
          )}
          <button
            onClick={() => setShowNoShowDialog(true)}
            className="flex items-center gap-1 text-xs py-1.5 px-2 border border-amber-300 text-amber-700 rounded-md hover:bg-amber-50 transition-colors"
          >
            <AlertTriangle className="w-3 h-3" /> No-Show
          </button>
        </div>
      </div>

      {/* No-show dialog */}
      {showNoShowDialog && onNoShow && (
        <NoShowDialog
          patientName={patient.patientName}
          surgeryDate={patient.surgeryDate}
          onReschedule={(notes) => { onNoShow(patient, 'reschedule', notes); setShowNoShowDialog(false); }}
          onHold={(notes) => { onNoShow(patient, 'hold', notes); setShowNoShowDialog(false); }}
          onCancel={(notes) => { onNoShow(patient, 'cancel', notes); setShowNoShowDialog(false); }}
          onDismiss={() => setShowNoShowDialog(false)}
        />
      )}
    </>
  );
}
