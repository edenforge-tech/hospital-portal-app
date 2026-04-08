'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, User, IndianRupee, CreditCard, AlertTriangle, FileText,
  Printer, ArrowRight, Clock, ChevronRight, Plus, CheckCircle2,
  Activity, AlertCircle, Stethoscope, TrendingUp,
} from 'lucide-react';
import {
  ipManagementApi,
  PatientJourneyRowDto,
  BillingTransactionDto,
  AddBillingTransactionRequest,
  JourneyAuditLogDto,
} from '@/lib/api/ip-management.api';
import { useAuthStore } from '@/lib/auth-store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function fmtDateTime(dt: string | null): string {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function calcAge(dob: string | null, ageOverride: number | null): string {
  if (ageOverride !== null && ageOverride !== undefined) return `${ageOverride}y`;
  if (!dob) return '—';
  const ageMilli = Date.now() - new Date(dob).getTime();
  return `${Math.floor(ageMilli / (1000 * 60 * 60 * 24 * 365))}y`;
}

// ─── Clinical State Config ─────────────────────────────────────────────────────

const CLINICAL_STATE_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  Expected:            { label: 'Expected',          color: 'text-blue-600',   bg: 'bg-blue-50',    icon: <Clock className="h-3 w-3" /> },
  Admitted:            { label: 'Admitted',           color: 'text-teal-600',   bg: 'bg-teal-50',    icon: <CheckCircle2 className="h-3 w-3" /> },
  ReadyForSurgery:     { label: 'Ready for Surgery',  color: 'text-indigo-600', bg: 'bg-indigo-50',  icon: <Stethoscope className="h-3 w-3" /> },
  SentToOT:            { label: 'Sent to OT',         color: 'text-violet-600', bg: 'bg-violet-50',  icon: <ArrowRight className="h-3 w-3" /> },
  InOT:                { label: 'In OT',              color: 'text-amber-600',  bg: 'bg-amber-50',   icon: <Activity className="h-3 w-3" /> },
  SurgeryCompleted:    { label: 'Surgery Done',       color: 'text-green-600',  bg: 'bg-green-50',   icon: <CheckCircle2 className="h-3 w-3" /> },
  PostOpInProgress:    { label: 'Post-Op',            color: 'text-cyan-600',   bg: 'bg-cyan-50',    icon: <Activity className="h-3 w-3" /> },
  ReadyForDischarge:   { label: 'Ready for D/C',      color: 'text-purple-600', bg: 'bg-purple-50',  icon: <ArrowRight className="h-3 w-3" /> },
  Discharged:          { label: 'Discharged',         color: 'text-gray-500',   bg: 'bg-gray-100',   icon: <CheckCircle2 className="h-3 w-3" /> },
};

// ─── Mini Clinical Stepper ─────────────────────────────────────────────────────

const STEPS = [
  { key: 'Expected',          label: 'Expected' },
  { key: 'Admitted',          label: 'Admitted' },
  { key: 'InOT',              label: 'OT' },
  { key: 'SurgeryCompleted',  label: 'Surgery Done' },
  { key: 'Discharged',        label: 'Discharged' },
];

const STATE_ORDER = [
  'Expected', 'PreOpInProgress', 'Admitted', 'ReadyForSurgery',
  'SentToOT', 'InOT', 'SurgeryCompleted', 'PostOpInProgress',
  'ReadyForDischarge', 'Discharged',
];

function getStateIndex(state: string): number {
  return STATE_ORDER.indexOf(state);
}

function MiniStepper({ clinicalState }: { clinicalState: string }) {
  const current = getStateIndex(clinicalState);
  return (
    <div className="flex items-center gap-1 w-full">
      {STEPS.map((step, idx) => {
        const stepIdx = getStateIndex(step.key);
        const done = current >= stepIdx;
        const active = step.key === clinicalState ||
          (idx < STEPS.length - 1 && current > stepIdx && current < getStateIndex(STEPS[idx + 1]?.key));
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`h-3 w-3 rounded-full border-2 transition-all ${
                done
                  ? active
                    ? 'bg-blue-500 border-blue-500 ring-2 ring-blue-200'
                    : 'bg-teal-500 border-teal-500'
                  : 'bg-white border-gray-300'
              }`} />
              <span className={`text-[9px] font-medium whitespace-nowrap ${
                done ? (active ? 'text-blue-600' : 'text-teal-600') : 'text-gray-400'
              }`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mt-[-8px] transition-colors ${done && !active ? 'bg-teal-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Financial State Badge ─────────────────────────────────────────────────────

function FinancialBadge({ state }: { state: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    NotCreated:    { label: 'No Bill',         cls: 'bg-gray-100 text-gray-600' },
    Draft:         { label: 'Bill Draft',      cls: 'bg-slate-100 text-slate-600' },
    Estimated:     { label: 'Estimated',       cls: 'bg-blue-100 text-blue-700' },
    Confirmed:     { label: 'Bill Confirmed',  cls: 'bg-indigo-100 text-indigo-700' },
    PartiallyPaid: { label: 'Partially Paid',  cls: 'bg-amber-100 text-amber-700' },
    Paid:          { label: 'Paid',            cls: 'bg-green-100 text-green-700' },
    Settled:       { label: 'Settled',         cls: 'bg-teal-100 text-teal-700' },
  };
  const c = cfg[state] ?? { label: state, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>;
}

// ─── Add Transaction Form (inline) ────────────────────────────────────────────

const TX_TYPES = ['Advance', 'Payment', 'Discount', 'Refund'] as const;
const PMT_MODES = ['Cash', 'Card', 'UPI', 'Insurance', 'CGHS'] as const;

function AddTransactionForm({
  journeyId,
  defaultType,
  onSaved,
  onCancel,
}: {
  journeyId: string;
  defaultType?: string;
  onSaved: (updated: { totalPaid: number; balanceDue: number }) => void;
  onCancel: () => void;
}) {
  const { branchId } = useAuthStore.getState();
  const [form, setForm] = useState<AddBillingTransactionRequest>({
    transactionType: defaultType ?? 'Advance',
    amount: 0,
    paymentMode: 'Cash',
    referenceNumber: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) { setError('Amount must be greater than 0.'); return; }
    setSaving(true);
    setError('');
    try {
      const result = await ipManagementApi.addBilling(journeyId, form);
      if (result) {
        // Refresh journey totals
        const detail = await ipManagementApi.getJourneyDetail(journeyId);
        onSaved({ totalPaid: detail?.totalPaid ?? 0, balanceDue: detail?.balanceDue ?? 0 });
      } else {
        setError('Failed to save transaction. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">Add Transaction</span>
        <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select
            value={form.transactionType}
            onChange={e => setForm(f => ({ ...f, transactionType: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {TX_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mode</label>
          <select
            value={form.paymentMode}
            onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {PMT_MODES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
        <input
          type="number"
          min="1"
          value={form.amount || ''}
          onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
          placeholder="0"
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Reference No. (optional)</label>
        <input
          type="text"
          value={form.referenceNumber ?? ''}
          onChange={e => setForm(f => ({ ...f, referenceNumber: e.target.value }))}
          placeholder="Cheque / UPI ref / Receipt"
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
        <textarea
          rows={2}
          value={form.notes ?? ''}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Transaction'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Audit Timeline ────────────────────────────────────────────────────────────

function AuditTimeline({ logs }: { logs: JourneyAuditLogDto[] }) {
  if (!logs.length) return (
    <p className="text-xs text-gray-400 text-center py-2">No recent activity</p>
  );
  return (
    <div className="space-y-2">
      {logs.slice(0, 4).map((log) => (
        <div key={log.id} className="flex gap-2.5">
          <div className="mt-1 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Activity className="h-2.5 w-2.5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 leading-tight">
              {log.fieldChanged}
              {log.oldValue && log.newValue && (
                <span className="font-normal text-gray-500"> · {log.oldValue} → {log.newValue}</span>
              )}
            </p>
            <p className="text-[10px] text-gray-400">{fmtDateTime(log.changedAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export interface PatientQuickPanelProps {
  journey: PatientJourneyRowDto | null;
  onClose: () => void;
  onJourneyUpdated?: (updatedFields: Partial<PatientJourneyRowDto>) => void;
}

export function PatientQuickPanel({ journey, onClose, onJourneyUpdated }: PatientQuickPanelProps) {
  const router = useRouter();
  const [showTxForm, setShowTxForm] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState<string>('Advance');
  const [showEmergencyFc, setShowEmergencyFc] = useState(false);
  const [auditLogs, setAuditLogs] = useState<JourneyAuditLogDto[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [generatingBill, setGeneratingBill] = useState(false);
  const [localFinancials, setLocalFinancials] = useState<{ totalPaid: number; balanceDue: number } | null>(null);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencySaving, setEmergencySaving] = useState(false);

  // Load audit log on panel open
  useEffect(() => {
    if (!journey) return;
    setAuditLoading(true);
    setShowTxForm(false);
    setShowEmergencyFc(false);
    setLocalFinancials(null);
    setAuditLogs([]);
    ipManagementApi.getJourneyAudit(journey.id).then(logs => {
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setAuditLoading(false);
    });
  }, [journey?.id]);

  const handleTxSaved = useCallback((updated: { totalPaid: number; balanceDue: number }) => {
    setLocalFinancials(updated);
    setShowTxForm(false);
    onJourneyUpdated?.({ totalPaid: updated.totalPaid, balanceDue: updated.balanceDue });
  }, [onJourneyUpdated]);

  const handleGenerateBill = async () => {
    if (!journey) return;
    setGeneratingBill(true);
    await ipManagementApi.transitionFinancial(journey.id, { newState: 'Draft' });
    onJourneyUpdated?.({ financialState: 'Draft' });
    setGeneratingBill(false);
  };

  const handleEmergencyFc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journey || !emergencyReason.trim()) return;
    setEmergencySaving(true);
    const result = await ipManagementApi.applyEmergencyFc(journey.id, { reason: emergencyReason.trim() });
    if (result) {
      onJourneyUpdated?.({ isEmergencyFc: true, emergencyFcReason: emergencyReason.trim() });
      setShowEmergencyFc(false);
    }
    setEmergencySaving(false);
  };

  if (!journey) return null;

  const cfg = CLINICAL_STATE_CFG[journey.clinicalState] ?? { label: journey.clinicalState, color: 'text-gray-600', bg: 'bg-gray-100', icon: null };
  const age = calcAge(journey.patientDob, journey.patientAge);
  const totalPaid = localFinancials?.totalPaid ?? journey.totalPaid;
  const balanceDue = localFinancials?.balanceDue ?? journey.balanceDue;
  const showGenerateBill = ['NotCreated'].includes(journey.financialState);
  const showPrint = ['Confirmed', 'PartiallyPaid', 'Paid', 'Settled'].includes(journey.financialState);
  const avatarInitial = (journey.patientName ?? 'P').charAt(0).toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[380px] bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold shrink-0">
            {avatarInitial}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold leading-tight truncate">{journey.patientName ?? '—'}</h2>
            <p className="text-blue-200 text-xs mt-0.5">{journey.uhid} · {age} · {journey.patientGender ?? '—'}</p>
            {journey.procedureName && (
              <p className="text-blue-100 text-xs mt-0.5 truncate">{journey.procedureName}{journey.eyeOperated ? ` · ${journey.eyeOperated}` : ''}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white shrink-0 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 border-b border-blue-100">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
            {cfg.icon}{cfg.label}
          </span>
          <FinancialBadge state={journey.financialState} />
          {journey.isEmergencyFc && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              <AlertTriangle className="h-3 w-3" /> Emergency FC
            </span>
          )}
          {journey.isLocked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              🔒 Locked
            </span>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Mini Stepper */}
          <div className="px-5 py-4 border-b border-gray-100">
            <MiniStepper clinicalState={journey.clinicalState} />
          </div>

          {/* Financial summary */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Package</p>
                <p className="text-sm font-bold text-gray-800">{fmtINR(journey.packageAmount)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Paid</p>
                <p className="text-sm font-bold text-green-700">{fmtINR(totalPaid)}</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${balanceDue > 0 ? 'bg-red-50' : 'bg-teal-50'}`}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Balance</p>
                <p className={`text-sm font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-teal-600'}`}>
                  {fmtINR(balanceDue)}
                </p>
              </div>
            </div>
            {journey.wardName && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                📍 {journey.wardName}{journey.bedNumber ? ` · Bed ${journey.bedNumber}` : ''}
                {journey.admittedAt ? ` · Admitted ${fmtDateTime(journey.admittedAt)}` : ''}
              </p>
            )}
          </div>

          {/* Transaction form (inline, shown conditionally) */}
          {showTxForm && (
            <div className="px-5 py-4 border-b border-gray-100">
              <AddTransactionForm
                journeyId={journey.id}
                defaultType={txDefaultType}
                onSaved={handleTxSaved}
                onCancel={() => setShowTxForm(false)}
              />
            </div>
          )}

          {/* Emergency FC form (inline) */}
          {showEmergencyFc && (
            <div className="px-5 py-4 border-b border-gray-100">
              <form onSubmit={handleEmergencyFc} className="space-y-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-900">Emergency FC Override</span>
                  </div>
                  <button type="button" onClick={() => setShowEmergencyFc(false)} className="p-1 text-orange-400 hover:text-orange-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-orange-700">Requires Admin / Billing Manager approval.</p>
                <textarea
                  rows={2}
                  value={emergencyReason}
                  onChange={e => setEmergencyReason(e.target.value)}
                  placeholder="Reason for emergency financial clearance…"
                  className="w-full text-sm border border-orange-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={emergencySaving || !emergencyReason.trim()}
                    className="flex-1 bg-orange-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors"
                  >
                    {emergencySaving ? 'Applying…' : 'Apply Override'}
                  </button>
                  <button type="button" onClick={() => setShowEmergencyFc(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Actions */}
          {!showTxForm && !showEmergencyFc && (
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</p>
              <div className="space-y-2">
                {/* Add Advance / Payment — always available unless locked */}
                {!journey.isBillingLocked && (
                  <button
                    onClick={() => { setTxDefaultType('Advance'); setShowTxForm(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Add Advance / Payment</p>
                      <p className="text-xs text-blue-500 font-normal">Record payment transaction</p>
                    </div>
                  </button>
                )}

                {/* Generate IP Bill */}
                {showGenerateBill && !journey.isBillingLocked && (
                  <button
                    onClick={handleGenerateBill}
                    disabled={generatingBill}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-colors group disabled:opacity-60"
                  >
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center">
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{generatingBill ? 'Generating…' : 'Generate IP Bill'}</p>
                      <p className="text-xs text-indigo-500 font-normal">Create billing record</p>
                    </div>
                  </button>
                )}

                {/* Emergency FC Clearance */}
                {!journey.isEmergencyFc && (
                  <button
                    onClick={() => setShowEmergencyFc(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-medium transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Emergency FC Clearance</p>
                      <p className="text-xs text-orange-500 font-normal">Override financial hold</p>
                    </div>
                  </button>
                )}

                {/* View Full Journey */}
                <button
                  onClick={() => router.push(`/dashboard/ip-management/journey/${journey.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">View Full Journey</p>
                    <p className="text-xs text-gray-400 font-normal">Pre-Op, OT, Billing, Discharge</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </button>

                {/* Print Bill */}
                {showPrint && (
                  <button
                    onClick={() => router.push(`/dashboard/ip-management/journey/${journey.id}?tab=billing`)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center">
                      <Printer className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Print Bill</p>
                      <p className="text-xs text-gray-400 font-normal">View and print final bill</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Activity</p>
            {auditLoading
              ? <p className="text-xs text-gray-400">Loading…</p>
              : <AuditTimeline logs={auditLogs} />
            }
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => router.push(`/dashboard/ip-management/journey/${journey.id}?tab=billing`)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Open Billing Tab
          </button>
        </div>
      </div>
    </>
  );
}
