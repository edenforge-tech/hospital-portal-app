'use client';

/**
 * SurgeryOverviewPanel
 * Compact at-a-glance panel for a confirmed surgery:
 *  • Readiness ring (circular progress)
 *  • Blockers list from workflow data
 *  • 4 readiness badges (Consent, Payment, OT Slot, Bed)
 *  • Surgery detail grid
 *  • Quick-nav links to Workflow and Coordination tabs
 */

import React from 'react';
import { Clock, Scissors, User, Calendar, CheckCircle2, Eye, AlertTriangle, BadgeAlert, Baby, Syringe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { usePreAdmissionWorkflow, getBlockers, isWorkflowComplete } from '@/hooks/use-pre-admission-workflow';
import { ConsentStatusWidget } from './ConsentStatusWidget';
import type { SurgeryConfirmedPatient } from '@/hooks/use-surgery-confirmed';

interface Props {
  patient: SurgeryConfirmedPatient;
  onNavigateToWorkflow: (stepNumber?: number) => void;
  onNavigateToCoordination: () => void;
}

interface BiometryData {
  k1?: number;
  k2?: number;
  axialLength?: number;
  iolPower?: number;
  iolModel?: string;
  surgeonNotes?: string;
}

/** Circular SVG progress ring */
function ReadinessRing({ pct }: { pct: number }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const color =
    pct === 100 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{pct}%</span>
        <span className="text-[9px] text-gray-400 uppercase font-semibold tracking-wide">Ready</span>
      </div>
    </div>
  );
}

export function SurgeryOverviewPanel({ patient, onNavigateToWorkflow, onNavigateToCoordination }: Props) {
  const { data: workflow } = usePreAdmissionWorkflow(patient.scheduleId);
  const blockers = getBlockers(workflow);
  const complete = isWorkflowComplete(workflow);
  const pct = workflow?.overallProgress ?? 0;

  // P5-1: Biometry data
  const { data: biometry } = useQuery<BiometryData | null>({
    queryKey: ['biometry', patient.patientId],
    enabled: !!patient.patientId,
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/biometry', { params: { patientId: patient.patientId } });
      return res.data ?? null;
    },
  });

  // P5-2: Map each blocker to the step it belongs to
  const stepData = workflow?.steps ?? [];
  function getBlockerStep(blockerId: string): number | undefined {
    const step = stepData.find((s) => s.items.some((i) => i.id === blockerId));
    return step?.step;
  }

  // Non-blocking incomplete items → warnings
  const allItems = workflow?.steps.flatMap((s) => s.items) ?? [];
  const warnings = allItems.filter((i) => !i.isComplete && !i.isBlocking && i.isMandatory);

  // Patient flags derived from available data
  const isMinor = typeof patient.age === 'number' && patient.age < 18;
  const isSuspectedMinor = typeof patient.age === 'number' && patient.age >= 18 && patient.age < 20;

  // Payment-mode-aware label override for checklist items
  const PAYMENT_ITEM_KEYS = ['financial_cleared', 'payment_received', 'payment_cleared', 'billing_cleared', 'insurance_cleared', 'pre_auth_approved'];
  function getPaymentLabel(id: string, defaultLabel: string): string {
    const isPaymentItem = PAYMENT_ITEM_KEYS.some((k) => id.toLowerCase().includes(k.replace('_', ''))) ||
      /payment|billing|insurance|pre.?auth|pre.?authoriz|copay|co.?pay|cghs|govt|scheme/i.test(defaultLabel);
    if (!isPaymentItem) return defaultLabel;
    const pt = patient.patientType;
    if (pt === 'Insurance') return 'Insurance pre-authorisation approval pending';
    if (pt === 'CoPay') return 'Insurance pre-auth + co-pay to Billing pending';
    if (pt === 'CGHS' || pt === 'ESH') return `${pt} referral letter + billing clearance pending`;
    if (pt === 'Arograshree' || pt === 'SGHS') return `${pt} scheme document + billing pending`;
    if (pt === 'Cash') return 'Advance payment to Billing department pending';
    return defaultLabel;
  }

  // Payment badge label
  const paymentBadgeLabel =
    patient.patientType === 'Insurance' ? 'Pre-Auth' :
    patient.patientType === 'CoPay' ? 'Pre-Auth + CoPay' :
    patient.patientType === 'CGHS' || patient.patientType === 'ESH' ? 'Govt Scheme' :
    'Payment';

  const iolUnspecified =
    !patient.iolModel && !patient.iolCatalogId &&
    !!patient.surgeryType && /cataract|phaco|iol/i.test(patient.surgeryType);
  // Check step-1 notes for DM / HTN / anticoagulant keywords
  const step1Notes = (workflow?.steps.find((s) => s.step === 1)?.items ?? [])
    .map((i) => (i.notes ?? '') + ' ' + (i.itemLabel ?? ''))
    .join(' ')
    .toLowerCase();
  const hasDM = /\bdm\b|diabet/.test(step1Notes);
  const hasHTN = /\bhtn\b|hypertens/.test(step1Notes);
  const hasAnticoag = /anticoag|warfarin|heparin|aspirin|clopidogrel/.test(step1Notes);

  const daysLabel =
    patient.daysToSurgery > 0
      ? `${patient.daysToSurgery} day${patient.daysToSurgery !== 1 ? 's' : ''} to surgery`
      : patient.daysToSurgery === 0
      ? 'Surgery is Today!'
      : 'Surgery date passed';

  const urgencyColor =
    patient.daysToSurgery < 0  ? 'bg-gray-100 text-gray-600' :
    patient.daysToSurgery === 0 ? 'bg-red-100 text-red-700' :
    patient.daysToSurgery <= 2  ? 'bg-amber-100 text-amber-700' :
    'bg-emerald-100 text-emerald-700';

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* Top: ring + summary */}
      <div className="flex items-start gap-5">
        <ReadinessRing pct={pct} />
        <div className="flex-1 min-w-0 space-y-3">
          <div className={cn('inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full', urgencyColor)}>
            <Clock className="w-3.5 h-3.5" />
            {daysLabel}
          </div>
          {/* Surgery date */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-0.5">Surgery Date</p>
            <p className="text-base font-bold text-emerald-900">
              {new Date(patient.surgeryDate).toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
            {patient.surgeryTimeSlot && (
              <p className="text-sm text-emerald-700 mt-0.5">{String(patient.surgeryTimeSlot)}</p>
            )}
          </div>

          {complete && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm font-semibold text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              All steps complete — Patient cleared for OT
            </div>
          )}
        </div>
      </div>

      {/* Blockers — P5-2: per-blocker step routing */}
      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-red-700 mb-1.5">Blocking Items</p>
          <ul className="space-y-1.5">
            {blockers.map((b) => {
              const stepNum = getBlockerStep(b.id);
              return (
                <li key={b.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs text-red-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {getPaymentLabel(b.id, b.itemLabel)}
                  </span>
                  {stepNum !== undefined && (
                    <button
                      type="button"
                      onClick={() => onNavigateToWorkflow(stepNum)}
                      className="text-[11px] text-red-600 hover:underline font-medium flex-shrink-0"
                    >
                      Go to Step {stepNum} →
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => onNavigateToWorkflow()}
            className="mt-2 text-xs text-red-600 hover:underline font-medium"
          >
            Open Workflow →
          </button>
        </div>
      )}

      {/* Warnings (non-blocking incomplete items) */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-amber-700 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Incomplete Items
          </p>
          <ul className="space-y-0.5">
            {warnings.slice(0, 5).map((w) => (
              <li key={w.id} className="flex items-center gap-2 text-xs text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {getPaymentLabel(w.id, w.itemLabel)}
              </li>
            ))}
            {warnings.length > 5 && (
              <li className="text-xs text-amber-600">+{warnings.length - 5} more…</li>
            )}
          </ul>
        </div>
      )}

      {/* Patient flags */}
      {(isMinor || isSuspectedMinor || iolUnspecified || hasDM || hasHTN || hasAnticoag) && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Patient Flags</p>
          <div className="flex flex-wrap gap-2">
            {isMinor && (
              <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-semibold">
                <Baby className="w-3 h-3" />
                Minor — GA mandatory
              </span>
            )}
            {isSuspectedMinor && !isMinor && (
              <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                <Baby className="w-3 h-3" />
                Young patient (age {patient.age})
              </span>
            )}
            {hasDM && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
                <BadgeAlert className="w-3 h-3" />
                DM — Blood sugar monitoring required
              </span>
            )}
            {hasHTN && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
                <BadgeAlert className="w-3 h-3" />
                HTN — BP check pre-op
              </span>
            )}
            {hasAnticoag && (
              <span className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded-full font-semibold">
                <Syringe className="w-3 h-3" />
                On anticoagulants — hold protocol required
              </span>
            )}
            {iolUnspecified && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
                <AlertTriangle className="w-3 h-3" />
                IOL not specified in booking
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4 readiness badges */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Readiness Status</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Consent',  done: patient.preAdmissionChecklist?.consentSigned },
            { label: paymentBadgeLabel, done: patient.preAdmissionChecklist?.financialCleared },
            { label: 'OT Slot',  done: patient.preAdmissionChecklist?.otSlotConfirmed },
            { label: 'Bed/Ward', done: patient.preAdmissionChecklist?.bedReserved },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl border py-3 px-2',
                item.done === true   ? 'bg-green-50 border-green-200' :
                item.done === null   ? 'bg-gray-50 border-gray-100'   :
                                       'bg-amber-50 border-amber-200'
              )}
            >
              {item.done === true ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <span
                  className={cn(
                    'w-5 h-5 rounded-full border-2 inline-block',
                    item.done === null ? 'border-gray-300' : 'border-amber-400'
                  )}
                />
              )}
              <span className={cn(
                'text-[11px] font-semibold',
                item.done === true ? 'text-green-700' : item.done === null ? 'text-gray-400' : 'text-amber-700'
              )}>
                {item.label}
              </span>
              <span className={cn(
                'text-[9px]',
                item.done === true ? 'text-green-600' : item.done === null ? 'text-gray-400' : 'text-amber-600'
              )}>
                {item.done === true ? 'Done' : item.done === null ? 'N/A' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* P5-1: Biometry section */}
      {biometry && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Biometry</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'K1',          value: biometry.k1 != null ? `${biometry.k1} D` : undefined },
              { label: 'K2',          value: biometry.k2 != null ? `${biometry.k2} D` : undefined },
              { label: 'Axial Length',value: biometry.axialLength != null ? `${biometry.axialLength} mm` : undefined },
              { label: 'IOL Power',   value: biometry.iolPower != null ? `${biometry.iolPower} D` : undefined },
            ]
              .filter((x) => x.value)
              .map((item) => (
                <div key={item.label} className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-center">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-bold text-indigo-800 mt-0.5">{item.value}</p>
                </div>
              ))}
          </div>
          {biometry.iolModel && (
            <p className="text-xs text-gray-500 mt-1.5">IOL Model: <span className="font-semibold text-gray-700">{biometry.iolModel}</span></p>
          )}
          {biometry.surgeonNotes && (
            <p className="text-xs text-gray-500 mt-0.5">Notes: {biometry.surgeonNotes}</p>
          )}
        </div>
      )}

      {/* Consent status */}
      <ConsentStatusWidget patientId={patient.patientId} />

      {/* Surgery details grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: 'Procedure',    value: patient.surgeryType },
          { label: 'Eye',          value: patient.eye },
          { label: 'Surgeon',      value: patient.surgeonName },
          { label: 'OT Theatre',   value: patient.theatreName },
          { label: 'Patient Type', value: patient.patientType },
          patient.packageAmount
            ? { label: 'Package', value: `₹${patient.packageAmount.toLocaleString('en-IN')}` }
            : null,
        ]
          .filter((x): x is { label: string; value: string | undefined } => x != null)
          .map(
            (item) =>
              item.value && (
                <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                </div>
              )
          )}
      </div>

      {/* Quick links */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => onNavigateToWorkflow()}
          className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Pre-Admission Workflow →
        </button>
        <button
          type="button"
          onClick={onNavigateToCoordination}
          className="flex-1 py-2.5 rounded-lg border border-emerald-200 text-sm text-emerald-700 font-medium hover:bg-emerald-50 transition-colors"
        >
          Dept Coordination →
        </button>
      </div>
    </div>
  );
}
