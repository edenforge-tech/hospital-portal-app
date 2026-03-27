'use client';

/**
 * @deprecated This component has been superseded by PreAdmissionWorkflow.tsx (6-step wizard).
 * Kept for reference only. Do not use in new code — import PreAdmissionWorkflow instead.
 */

/**
 * PreAdmissionChecklist (API-driven)
 * Fetches patientTypeInstructions + template items from GET /pre-admission-checklist/template.
 * Falls back to hardcoded defaults when API is unavailable or loading.
 * Supports per-item completion tracking via scheduleId prop.
 */

import React, { useState, useMemo } from 'react';
import { CheckCircle2, Circle, Building2, ChevronDown, ChevronUp, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  usePreAdmissionChecklistTemplate,
  usePreAdmissionCompletion,
  useUpdatePreAdmissionCompletion,
  type ChecklistTemplateItem,
  type ItemUpdateRequest,
} from '@/hooks/use-pre-admission-checklist';

// ── Legacy 8-key ChecklistState (kept for backward compat) ───────────────────

export interface ChecklistState {
  biometryDone: boolean;
  labsDone: boolean;
  ecgDone: boolean;
  anesthesiaClearance: boolean;
  consentSigned: boolean;
  paymentConfirmed: boolean;
  bedAssigned: boolean;
  otSlotConfirmed: boolean;
}

const DEFAULT_ITEMS: ChecklistTemplateItem[] = [
  { itemKey: 'biometryDone',        itemLabel: 'Biometry / A-Scan',            departmentOwner: 'Optometry',   departmentColor: 'bg-teal-100 text-teal-700',     isMandatory: true,  isBlocking: false, requiresDocument: false, displayOrder: 0 },
  { itemKey: 'labsDone',            itemLabel: 'Pre-op lab reports',            departmentOwner: 'Lab',          departmentColor: 'bg-yellow-100 text-yellow-700', isMandatory: true,  isBlocking: false, requiresDocument: false, displayOrder: 1 },
  { itemKey: 'ecgDone',             itemLabel: 'ECG / Anaesthesia fitness',     departmentOwner: 'Cardiology',   departmentColor: 'bg-red-100 text-red-700',       isMandatory: true,  isBlocking: false, requiresDocument: false, displayOrder: 2 },
  { itemKey: 'anesthesiaClearance', itemLabel: 'Anaesthesia clearance',         departmentOwner: 'Anaesthesia',  departmentColor: 'bg-orange-100 text-orange-700', isMandatory: true,  isBlocking: true,  requiresDocument: false, displayOrder: 3 },
  { itemKey: 'consentSigned',       itemLabel: 'Surgical consent signed',       departmentOwner: 'Counselor',    departmentColor: 'bg-blue-100 text-blue-700',     isMandatory: true,  isBlocking: true,  requiresDocument: false, displayOrder: 4 },
  { itemKey: 'paymentConfirmed',    itemLabel: 'Payment / Insurance cleared',   departmentOwner: 'Billing',      departmentColor: 'bg-green-100 text-green-700',   isMandatory: true,  isBlocking: false, requiresDocument: false, displayOrder: 5 },
  { itemKey: 'bedAssigned',         itemLabel: 'Bed / ward assigned',           departmentOwner: 'Admissions',   departmentColor: 'bg-purple-100 text-purple-700', isMandatory: false, isBlocking: false, requiresDocument: false, displayOrder: 6 },
  { itemKey: 'otSlotConfirmed',     itemLabel: 'OT slot confirmed',             departmentOwner: 'OT',           departmentColor: 'bg-indigo-100 text-indigo-700', isMandatory: true,  isBlocking: true,  requiresDocument: false, displayOrder: 7 },
];

interface PreAdmissionChecklistProps {
  checklist: ChecklistState;
  onChange?: (updated: ChecklistState) => void;
  readOnly?: boolean;
  compact?: boolean;
  patientType?: string;
  surgeryType?: string;
  patientAge?: number;
  /** When provided, enables per-item API completion tracking */
  scheduleId?: string;
}

export function progressPercent(checklist: ChecklistState): number {
  const done = Object.values(checklist).filter(Boolean).length;
  return Math.round((done / DEFAULT_ITEMS.length) * 100);
}

// ── Patient type instructions panel (data from API) ──────────────────────────

interface PatientTypeInfo {
  docs: string[];
  financial: string;
  specialNote?: string | null;
}

function PatientTypeInstructionsPanel({ info, patientType }: { info: PatientTypeInfo; patientType: string }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-blue-800">
          <Info className="w-4 h-4 text-blue-500" />
          {patientType} Patient Instructions
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
      </button>
      {expanded && (
        <div className="px-4 py-3 space-y-2.5 bg-white">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Documents Required</p>
            <ul className="space-y-0.5">
              {info.docs.map(doc => (
                <li key={doc} className="text-xs text-gray-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Financial / Payment</p>
            <p className="text-xs text-gray-700">{info.financial}</p>
          </div>
          {info.specialNote && (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 font-medium">⚠️ {info.specialNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PreAdmissionChecklist({
  checklist,
  onChange,
  readOnly = false,
  compact = false,
  patientType,
  surgeryType,
  patientAge,
  scheduleId,
}: PreAdmissionChecklistProps) {
  // Fetch patient-type instructions + template items from API
  const { data: template, isLoading: templateLoading } = usePreAdmissionChecklistTemplate({
    patientType,
    surgeryType,
    patientAge,
  });

  // Per-item completion tracking (only when scheduleId provided)
  const { data: completionData } = usePreAdmissionCompletion(scheduleId);
  const updateCompletion = useUpdatePreAdmissionCompletion(scheduleId ?? '');

  const items = template?.items ?? DEFAULT_ITEMS;
  const pct = progressPercent(checklist);
  const allDone = pct === 100;
  const isMinorPatient = typeof patientAge === 'number' && patientAge < 20;

  const completionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (completionData?.completions) {
      completionData.completions.forEach(c => { map[c.itemKey] = c.isComplete; });
    }
    return map;
  }, [completionData]);

  const isItemDone = (item: ChecklistTemplateItem): boolean => {
    if (scheduleId && completionData) return completionMap[item.itemKey] ?? false;
    if (item.itemKey in checklist) return !!checklist[item.itemKey as keyof ChecklistState];
    return false;
  };

  const toggle = (item: ChecklistTemplateItem) => {
    if (readOnly) return;
    if (scheduleId && item.id) {
      updateCompletion.mutate([{ itemId: item.id, isComplete: !completionMap[item.itemKey] }]);
      return;
    }
    if (onChange && item.itemKey in checklist) {
      onChange({ ...checklist, [item.itemKey as keyof ChecklistState]: !checklist[item.itemKey as keyof ChecklistState] });
    }
  };

  const instructions = template?.patientTypeInstructions;

  return (
    <div className="space-y-2">
      {/* Patient type instructions – API-driven */}
      {patientType && !compact && (
        templateLoading
          ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading patient instructions…
            </div>
          )
          : instructions
            ? <PatientTypeInstructionsPanel info={instructions} patientType={patientType} />
            : null
      )}

      {/* Age-based anesthesia alert */}
      {isMinorPatient && !compact && (
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800">Minor Patient ({patientAge} years)</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Mandatory: GA anaesthesia clearance <strong>or</strong> documented topical consent obtained from parent/guardian before OT booking.
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              allDone ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={cn('text-xs font-bold whitespace-nowrap', allDone ? 'text-green-700' : 'text-gray-600')}>
          {pct}%
        </span>
      </div>

      {/* Items */}
      {!compact ? (
        <ul className="space-y-1">
          {items.map(item => {
            const done = isItemDone(item);
            return (
              <li
                key={item.itemKey}
                onClick={() => toggle(item)}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors',
                  !readOnly && 'cursor-pointer hover:bg-gray-50',
                  done ? 'opacity-60' : ''
                )}
              >
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  : <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                <span className={cn('flex-1 text-sm', done && 'line-through text-gray-400')}>{item.itemLabel}</span>
                <span className={cn('flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium', item.departmentColor)}>
                  <Building2 className="w-2.5 h-2.5" /> {item.departmentOwner}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        // Compact: dots row
        <div className="flex items-center gap-1 flex-wrap">
          {items.map(item => (
            <button
              key={item.itemKey}
              type="button"
              onClick={() => toggle(item)}
              disabled={readOnly}
              title={item.itemLabel}
              className={cn(
                'w-4 h-4 rounded-full border transition-colors',
                isItemDone(item)
                  ? 'bg-green-500 border-green-600'
                  : 'bg-white border-gray-300 hover:border-gray-500'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
