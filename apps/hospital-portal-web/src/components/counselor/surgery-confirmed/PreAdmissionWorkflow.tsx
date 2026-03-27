'use client';

/**
 * PreAdmissionWorkflow
 * Orchestrates the 6-step pre-admission workflow for a confirmed OT schedule.
 *
 * Steps:
 *  1. Pre-Op Instructions
 *  2. Imaging & Scans
 *  3. Payment & Insurance
 *  4. Anaesthesia Type
 *  5. OT / Bed / Stock
 *  6. Surgeon Confirmation
 *
 * Each step renders its own widget; navigation is via breadcrumb dots + Back/Next.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import {
  usePreAdmissionWorkflow,
  useUpdateWorkflowStep,
  getCurrentStep,
  isWorkflowComplete,
} from '@/hooks/use-pre-admission-workflow';
import type { SurgeryConfirmedPatient } from '@/hooks/use-surgery-confirmed';
import type { WorkflowStepItem } from '@/hooks/use-pre-admission-workflow';
import { useDeptWorkflowStatus } from '@/hooks/use-dept-coordination';
import { Step1PreOpInstructions } from './steps/Step1PreOpInstructions';
import { Step2ImagingScans } from './steps/Step2ImagingScans';
import { Step3PaymentInsurance } from './steps/Step3PaymentInsurance';
import { Step4AnaesthesiaType } from './steps/Step4AnaesthesiaType';
import { Step5OTBedStock } from './steps/Step5OTBedStock';
import { Step6SurgeonConfirmation } from './steps/Step6SurgeonConfirmation';

const STEP_LABELS = [
  'Pre-Op Instructions',
  'Imaging & Scans',
  'Payment & Insurance',
  'Anaesthesia',
  'OT / Bed / Stock',
  'Surgeon Confirmation',
];

interface Props {
  patient: SurgeryConfirmedPatient;
  initialStep?: number;
}

export function PreAdmissionWorkflow({ patient, initialStep }: Props) {
  const { data: workflow, isLoading, isError } = usePreAdmissionWorkflow(patient.scheduleId);
  const { mutate: updateStep, isPending: isMutating } = useUpdateWorkflowStep(patient.scheduleId);
  const { data: deptStatus } = useDeptWorkflowStatus(patient.scheduleId);

  const firstIncompleteStep = getCurrentStep(workflow);
  const [activeStep, setActiveStep] = useState<number>(initialStep ?? firstIncompleteStep);

  const stepData = workflow?.steps ?? [];

  // Derive anaesthesia choice: look at Step 4 items for last note containing a type keyword
  const step4Items = stepData.find((s) => s.step === 4)?.items ?? [];
  const anaesthesiaTypeChoice = (() => {
    for (const item of step4Items) {
      if (!item.notes) continue;
      const n = item.notes.toUpperCase();
      if (n.includes('GA') || n.includes('GENERAL')) return 'GA' as const;
      if (n.includes('TOPICAL')) return 'Topical' as const;
      if (n.includes('LOCAL')) return 'Local' as const;
    }
    return undefined;
  })();

  // Derive surgeon status from dept coordination
  const deptSurgeonStatus = deptStatus?.departments?.Surgeon?.status;
  const surgeonStatus = (
    deptSurgeonStatus === 'Completed' ? 'confirmed'
    : deptSurgeonStatus === 'Rejected' || deptSurgeonStatus === 'Cancelled' ? 'rejected'
    : deptSurgeonStatus === 'Pending' || deptSurgeonStatus === 'Sent' || deptSurgeonStatus === 'InProgress' ? 'pending'
    : 'pending'
  ) as 'pending' | 'confirmed' | 'rejected' | 'no_response';

  const handleMarkItem = useCallback(
    (itemId: string, isComplete: boolean, notes?: string, documentUrl?: string) => {
      updateStep(
        {
          stepNumber: activeStep,
          payload: {
            itemUpdates: [{ itemId, isComplete, documentUrl, notes }],
          },
        },
        {
          onSuccess: () => toast.success(isComplete ? 'Item marked complete' : 'Item marked incomplete'),
          onError: () => toast.error('Failed to update item'),
        }
      );
    },
    [activeStep, updateStep]
  );

  const handleSendDeptRequest = useCallback(
    (_dept: string, _message: string) => {
      // Dept requests are sent via useSendDeptRequest in each step widget — this is a fallback
      toast.info(`Request sent to ${_dept}`);
    },
    []
  );

  // P6-5: "Mark Patient Ready" mutation
  const { mutate: markPatientReady, isPending: isMarkingReady } = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.patch(`/otbooking/schedules/${patient.scheduleId}`, { workflowReady: true });
    },
    onSuccess: () => toast.success('Patient marked as ready for surgery!'),
    onError: () => toast.error('Failed to mark patient ready'),
  });

  // P6-5: Auto-advance to next incomplete step when current step completes
  useEffect(() => {
    if (!workflow) return;
    const current = stepData.find((s) => s.step === activeStep);
    if (current?.isComplete && activeStep < workflow.totalSteps) {
      const nextIncomplete = stepData.find((s) => s.step > activeStep && !s.isComplete);
      if (nextIncomplete) {
        setActiveStep(nextIncomplete.step);
      }
    }
  }, [workflow, stepData, activeStep]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading workflow…</span>
      </div>
    );
  }

  if (isError || !workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
        <p className="text-sm">Could not load workflow data.</p>
        <p className="text-xs">This patient may not have a pre-admission checklist yet.</p>
      </div>
    );
  }

  const complete = isWorkflowComplete(workflow);
  const currentStepData = stepData.find((s) => s.step === activeStep);
  const items: WorkflowStepItem[] = currentStepData?.items ?? [];

  return (
    <div className="flex flex-col h-full max-w-2xl">
      {/* ── Progress header ────────────────────────────────────────────────── */}
      <div className="px-6 pt-4 pb-3 border-b border-gray-100">
        {/* Overall bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                workflow.overallProgress === 100 ? 'bg-green-500' : 'bg-emerald-500'
              )}
              style={{ width: `${workflow.overallProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
            {workflow.completedSteps}/{workflow.totalSteps} steps
          </span>
        </div>

        {/* Step breadcrumb dots */}
        <div className="flex items-center gap-1">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const stepInfo = stepData.find((s) => s.step === stepNum);
            const isActive = activeStep === stepNum;
            const isDone = stepInfo?.isComplete ?? false;
            const isBlocked = stepInfo?.isBlocked ?? false;

            return (
              <React.Fragment key={stepNum}>
                {idx > 0 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5',
                      isDone ? 'bg-emerald-400' : 'bg-gray-200'
                    )}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setActiveStep(stepNum)}
                  title={label}
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center rounded-full transition-all',
                    isActive
                      ? 'w-8 h-8 ring-2 ring-emerald-500 ring-offset-2'
                      : 'w-7 h-7 hover:scale-110',
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isBlocked
                      ? 'bg-red-100 border-2 border-red-300 text-red-600'
                      : isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{stepNum}</span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Active step title */}
        <p className="text-sm font-semibold text-gray-700 mt-2">
          Step {activeStep} — {STEP_LABELS[activeStep - 1]}
        </p>
        {currentStepData && (
          <p className="text-xs text-gray-500 mt-0.5">
            {currentStepData.items.filter((i) => i.isComplete).length}/{currentStepData.items.length} items complete
            {currentStepData.isBlocked && (
              <span className="ml-2 text-red-500 font-medium">· Has blocking items</span>
            )}
          </p>
        )}
      </div>

      {/* ── All complete banner ────────────────────────────────────────────── */}
      {complete && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <PartyPopper className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">All Steps Complete — Ready for Surgery!</p>
            <p className="text-xs text-green-600 mt-0.5">
              All pre-admission items have been confirmed. Patient is cleared for OT.
            </p>
          </div>
        </div>
      )}

      {/* ── Step widget ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeStep === 1 && (
          <Step1PreOpInstructions
            scheduleId={patient.scheduleId}
            patientId={patient.patientId}
            patientType={patient.patientType}
            patientAge={patient.age}
            items={items}
            onMarkItem={handleMarkItem}
            isMutating={isMutating}
          />
        )}
        {activeStep === 2 && (
          <Step2ImagingScans
            scheduleId={patient.scheduleId}
            sessionId={patient.sessionId}
            patientId={patient.patientId}
            patientPhone={patient.patientPhone}
            patientAge={patient.age}
            items={items}
            allWorkflowItems={stepData.flatMap((s) => s.items)}
            onMarkItem={handleMarkItem}
            isMutating={isMutating}
          />
        )}
        {activeStep === 3 && (
          <Step3PaymentInsurance
            scheduleId={patient.scheduleId}
            sessionId={patient.sessionId}
            patientType={patient.patientType}
            packageAmount={patient.packageAmount}
            recommendedProcedures={patient.recommendedProcedures}
            items={items}
            onMarkItem={handleMarkItem}
            isMutating={isMutating}
          />
        )}
        {activeStep === 4 && (
          <Step4AnaesthesiaType
            scheduleId={patient.scheduleId}
            patientId={patient.patientId}
            patientAge={patient.age}
            branchId={patient.branchId}
            surgeryDate={patient.surgeryDate}
            anaesthesiaTypeChoice={anaesthesiaTypeChoice}
            items={items}
            onMarkItem={handleMarkItem}
            onSendDeptRequest={handleSendDeptRequest}
            isMutating={isMutating}
          />
        )}
        {activeStep === 5 && (
          <Step5OTBedStock
            scheduleId={patient.scheduleId}
            patientId={patient.patientId}
            patientTypeCategory={patient.patientType as 'DayCare' | 'IPD' | 'Emergency' | undefined}
            surgeryDate={patient.surgeryDate}
            iolCatalogId={patient.iolCatalogId}
            iolModel={patient.iolModel}
            surgeryType={patient.surgeryType}
            items={items}
            onMarkItem={handleMarkItem}
            onSendDeptRequest={handleSendDeptRequest}
            isMutating={isMutating}
          />
        )}
        {activeStep === 6 && (
          <Step6SurgeonConfirmation
            scheduleId={patient.scheduleId}
            surgeonId={patient.surgeonId}
            surgeonName={patient.surgeonName}
            surgeryDate={patient.surgeryDate}
            patientName={patient.patientName}
            surgeonStatus={surgeonStatus}
            items={items}
            onMarkItem={handleMarkItem}
            isMutating={isMutating}
          />
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between bg-white">
        <button
          type="button"
          disabled={activeStep === 1}
          onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <span className="text-xs text-gray-400">
          {activeStep} / {workflow.totalSteps}
        </span>

        <div className="flex items-center gap-2">
          {/* P6-5: Mark Patient Ready — shown on last step when workflow is complete */}
          {activeStep === workflow.totalSteps && complete && (
            <button
              type="button"
              disabled={isMarkingReady}
              onClick={() => markPatientReady()}
              className="flex items-center gap-1.5 text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isMarkingReady ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Mark Patient Ready
            </button>
          )}
          <button
            type="button"
            disabled={activeStep === workflow.totalSteps}
            onClick={() => setActiveStep((s) => Math.min(workflow.totalSteps, s + 1))}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
