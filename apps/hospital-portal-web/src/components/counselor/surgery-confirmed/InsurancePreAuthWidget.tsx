'use client';

/**
 * InsurancePreAuthWidget
 * Replaces InsuranceClearanceStatus for the new insurance_preauth_requests table.
 * Shows step-timeline: Draft → Applied → Under Review → Pending Docs → Approved/Rejected.
 * Allows counselor to create a new pre-auth request and advance status inline.
 */

import React, { useState } from 'react';
import { Shield, CheckCircle2, Clock, AlertCircle, XCircle, ChevronDown, ChevronUp, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useInsurancePreauth,
  useInsurancePreauthBySchedule,
  useCreateInsurancePreauth,
  useUpdatePreauthStatus,
  PREAUTH_REQUIRED_TYPES,
  type InsurancePreauthRecord,
  type PreauthStatus,
} from '@/hooks/use-insurance-preauth';

// ── Step configuration ────────────────────────────────────────────────────────

interface StepDef {
  status: PreauthStatus;
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepDef[] = [
  { status: 'Draft',       label: 'Not Submitted',  icon: <Clock className="w-3.5 h-3.5" /> },
  { status: 'Applied',     label: 'Applied',         icon: <Clock className="w-3.5 h-3.5" /> },
  { status: 'UnderReview', label: 'Under Review',    icon: <Clock className="w-3.5 h-3.5 animate-spin" /> },
  { status: 'PendingDocs', label: 'Pending Docs',    icon: <AlertCircle className="w-3.5 h-3.5" /> },
];

const TERMINAL_STEPS: StepDef[] = [
  { status: 'Approved', label: 'Approved', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { status: 'Rejected', label: 'Rejected', icon: <XCircle className="w-3.5 h-3.5" /> },
];

function stepIndex(status: PreauthStatus): number {
  const idx = STEPS.findIndex(s => s.status === status);
  return idx >= 0 ? idx : 0;
}

const STATUS_COLOR: Record<PreauthStatus, string> = {
  Draft:          'text-gray-500 bg-gray-100',
  Applied:        'text-blue-700 bg-blue-100',
  UnderReview:    'text-amber-700 bg-amber-100',
  PendingDocs:    'text-orange-700 bg-orange-100',
  InitialApproved:'text-teal-700 bg-teal-100',
  FinalApproved:  'text-emerald-700 bg-emerald-100',
  Approved:       'text-green-700 bg-green-100',
  Rejected:       'text-red-700 bg-red-100',
  Expired:        'text-red-700 bg-red-100',
  Cancelled:      'text-gray-500 bg-gray-100',
};

// ── Create form ───────────────────────────────────────────────────────────────

function CreatePreauthForm({
  sessionId,
  onDone,
}: {
  sessionId: string;
  onDone: () => void;
}) {
  const [provider, setProvider] = useState('');
  const [policy, setPolicy]     = useState('');
  const create = useCreateInsurancePreauth(sessionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider.trim() || !policy.trim()) return;
    create.mutate(
      { sessionId, insuranceProvider: provider.trim(), policyNumber: policy.trim() },
      { onSuccess: onDone },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3 border-t border-gray-100 bg-gray-50">
      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">New Pre-Auth Request</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Insurance Provider"
          value={provider}
          onChange={e => setProvider(e.target.value)}
          required
        />
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Policy Number"
          value={policy}
          onChange={e => setPolicy(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={create.isPending}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
        >
          {create.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Create Request
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 border border-gray-200 text-xs text-gray-600 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Record detail row ─────────────────────────────────────────────────────────

function PreauthRecordRow({
  record,
  sessionId,
}: {
  record: InsurancePreauthRecord;
  sessionId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdatePreauthStatus(sessionId);

  const isTerminal = record.preauthStatus === 'Approved' || record.preauthStatus === 'Rejected'
    || record.preauthStatus === 'Expired' || record.preauthStatus === 'Cancelled';

  const currentIdx = stepIndex(record.preauthStatus);
  const colorCls = STATUS_COLOR[record.preauthStatus] ?? 'text-gray-500 bg-gray-100';

  // Next possible status transitions (counselor can advance or mark docs pending)
  const transitions: { next: PreauthStatus; label: string; cls: string }[] = isTerminal ? [] : [
    ...(record.preauthStatus === 'Draft'       ? [{ next: 'Applied'     as PreauthStatus, label: 'Mark Applied',     cls: 'text-blue-700 border-blue-300 hover:bg-blue-50' }] : []),
    ...(record.preauthStatus === 'Applied'     ? [{ next: 'UnderReview' as PreauthStatus, label: 'Under Review',     cls: 'text-amber-700 border-amber-300 hover:bg-amber-50' }] : []),
    ...(record.preauthStatus === 'UnderReview' ? [
      { next: 'PendingDocs' as PreauthStatus, label: 'Docs Needed',  cls: 'text-orange-700 border-orange-300 hover:bg-orange-50' },
      { next: 'Approved'    as PreauthStatus, label: 'Approved ✓',   cls: 'text-green-700 border-green-300 hover:bg-green-50' },
      { next: 'Rejected'    as PreauthStatus, label: 'Rejected ✗',   cls: 'text-red-700 border-red-300 hover:bg-red-50' },
    ] : []),
    ...(record.preauthStatus === 'PendingDocs' ? [
      { next: 'UnderReview' as PreauthStatus, label: 'Docs Submitted', cls: 'text-amber-700 border-amber-300 hover:bg-amber-50' },
      { next: 'Approved'    as PreauthStatus, label: 'Approved ✓',     cls: 'text-green-700 border-green-300 hover:bg-green-50' },
    ] : []),
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{record.insuranceProvider}</p>
          <p className="text-xs text-gray-500 truncate">{record.policyNumber}{record.preauthRequestNumber ? ` · Ref: ${record.preauthRequestNumber}` : ''}</p>
        </div>
        <span className={cn('flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full', colorCls)}>
          {record.preauthStatus}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 bg-gray-50/50">
          {/* Step timeline (for non-terminal) */}
          {!isTerminal && (
            <div className="flex items-center gap-1 pt-3">
              {STEPS.map((step, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <React.Fragment key={step.status}>
                    <div className={cn(
                      'flex flex-col items-center gap-1 flex-1',
                      done ? 'opacity-100' : active ? 'opacity-100' : 'opacity-40'
                    )}>
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-white',
                        done    ? 'bg-green-500' :
                        active  ? 'bg-blue-500' :
                                  'bg-gray-300'
                      )}>
                        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.icon}
                      </div>
                      <span className="text-[9px] text-center text-gray-600 leading-tight">{step.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn('flex-none w-4 h-0.5 mb-4', done ? 'bg-green-400' : 'bg-gray-200')} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Terminal status badge */}
          {isTerminal && (
            <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold mt-2', colorCls)}>
              {record.preauthStatus === 'Approved'
                ? <CheckCircle2 className="w-4 h-4" />
                : <XCircle className="w-4 h-4" />}
              {record.preauthStatus}
              {record.approvedAmount != null && record.preauthStatus === 'Approved' && (
                <span className="ml-auto text-xs font-normal">₹{record.approvedAmount.toLocaleString('en-IN')}</span>
              )}
              {record.rejectionReason && record.preauthStatus === 'Rejected' && (
                <span className="ml-auto text-xs font-normal truncate max-w-[120px]" title={record.rejectionReason}>{record.rejectionReason}</span>
              )}
            </div>
          )}

          {/* Transition buttons */}
          {transitions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {transitions.map(t => (
                <button
                  key={t.next}
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: record.id, payload: { status: t.next } })}
                  className={cn('px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors', t.cls)}
                >
                  {updateStatus.isPending ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

interface InsurancePreAuthWidgetProps {
  sessionId?: string;
  scheduleId?: string;
  patientType?: string;
  compact?: boolean;
}

export function InsurancePreAuthWidget({
  sessionId,
  scheduleId,
  patientType,
  compact = false,
}: InsurancePreAuthWidgetProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const requiresPreAuth = patientType && PREAUTH_REQUIRED_TYPES.includes(patientType);

  const { data: dataBySession, isLoading: loadingBySession } = useInsurancePreauth(scheduleId ? undefined : sessionId);
  const { data: dataBySchedule, isLoading: loadingBySchedule } = useInsurancePreauthBySchedule(scheduleId);
  const data = scheduleId ? dataBySchedule : dataBySession;
  const isLoading = scheduleId ? loadingBySchedule : loadingBySession;

  // Patient types that don't require pre-auth
  if (!requiresPreAuth) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        <Shield className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">Pre-auth not required ({patientType ?? 'Cash'})</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
        <Shield className="w-4 h-4 text-gray-300" />
        <span className="text-xs text-gray-400">Checking insurance…</span>
      </div>
    );
  }

  const records = data ?? [];
  const latest = records[0] ?? null;

  // Compact mode: just a badge
  if (compact && latest) {
    const colorCls = STATUS_COLOR[latest.preauthStatus] ?? 'text-gray-500 bg-gray-100';
    return (
      <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium', colorCls)}>
        <Shield className="w-3 h-3" />
        Pre-Auth: {latest.preauthStatus}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-50">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">Insurance Pre-Authorization</span>
          {records.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded-full font-bold">{records.length}</span>
          )}
        </div>
        {!showCreateForm && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </button>
        )}
      </div>

      {/* Records list */}
      {records.length > 0 ? (
        <div className="divide-y divide-gray-100 bg-white">
          {records.map(record => (
            <PreauthRecordRow key={record.id} record={record} sessionId={sessionId} />
          ))}
        </div>
      ) : !showCreateForm ? (
        <div className="px-4 py-6 text-center bg-white">
          <Shield className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No pre-auth request yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Required for {patientType} patients</p>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> Create Pre-Auth Request
          </button>
        </div>
      ) : null}

      {/* Create form */}
      {showCreateForm && sessionId && (
        <CreatePreauthForm sessionId={sessionId} onDone={() => setShowCreateForm(false)} />
      )}
      {showCreateForm && !sessionId && (
        <div className="px-4 py-3 text-xs text-amber-700 bg-amber-50">
          Creating a pre-auth request requires an active counseling session.
        </div>
      )}
    </div>
  );
}
