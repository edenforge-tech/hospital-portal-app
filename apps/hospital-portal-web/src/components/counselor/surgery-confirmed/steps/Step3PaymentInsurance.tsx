'use client';

/**
 * Step3PaymentInsurance
 * Routes to the appropriate payment UI based on patientType:
 *   - Insurance / ESH: InsurancePreAuthWidget (schedule-specific pre-auth via GET /insurance-preauth/schedule/{id})
 *   - CGHS / SGHS / Arograshree / Railway: Govt scheme path (scheme no + referral letter)
 *   - CoPay: Insurance portion + patient co-pay amount collection
 *   - Cash / Corporate / Default: Cash amount collection toggle
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2, Circle, CreditCard, Shield, AlertTriangle, Building2, Split, IndianRupee,
  RefreshCw, Bell, Loader2, FileUp, Package, Send, Clock, CalendarClock, Zap, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';
import type { WorkflowStepItem } from '@/hooks/use-pre-admission-workflow';
import { InsurancePreAuthWidget } from '../InsurancePreAuthWidget';
import { useInsurancePreauthBySchedule } from '@/hooks/use-insurance-preauth';
import { useGetDeptSummary } from '@/hooks/use-dept-coordination';

// Eye laterality label map
const EYE_LABELS: Record<string, string> = {
  OD: 'Right Eye', od: 'Right Eye',
  OS: 'Left Eye',  os: 'Left Eye',
  OU: 'Both Eyes', ou: 'Both Eyes',
  Both: 'Both Eyes', BOTH: 'Both Eyes',
  RE: 'Right Eye', LE: 'Left Eye', BE: 'Both Eyes',
};
const formatEye = (eye?: string) => (eye ? (EYE_LABELS[eye] ?? eye) : '—');

// Payment override modes
const INSURANCE_TYPES = ['Insurance', 'ESH'];
const COPAY_TYPES = ['CoPay'];
const GOVT_SCHEME_TYPES = ['CGHS', 'SGHS', 'Arograshree', 'Railway'];

interface Props {
  scheduleId: string;
  sessionId?: string;
  patientType?: string;
  packageAmount?: number;
  recommendedProcedures?: any[];
  items: WorkflowStepItem[];
  onMarkItem: (itemId: string, isComplete: boolean, notes?: string) => void;
  isMutating?: boolean;
}

export function Step3PaymentInsurance({
  scheduleId,
  sessionId,
  patientType,
  packageAmount,
  recommendedProcedures,
  items,
  onMarkItem,
  isMutating,
}: Props) {
  const isInsurance = patientType ? INSURANCE_TYPES.includes(patientType) : false;
  const isCoPay = patientType ? COPAY_TYPES.includes(patientType) : false;
  const isGovtScheme = patientType ? GOVT_SCHEME_TYPES.includes(patientType) : false;
  const isCash = !isInsurance && !isCoPay && !isGovtScheme;

  const blockers = items.filter((i) => i.isBlocking && !i.isComplete);
  const completedCount = items.filter((i) => i.isComplete).length;

  // Cash / Corporate state
  const [cashAmount, setCashAmount] = useState('');
  const [cashNotes, setCashNotes] = useState('');

  // Govt scheme state
  const [schemeNo, setSchemeNo] = useState('');
  const [referralUploaded, setReferralUploaded] = useState(false);
  const [referralFile, setReferralFile] = useState<File | null>(null);
  const [referralDocumentUrl, setReferralDocumentUrl] = useState<string | null>(null);

  // CoPay state
  const [coPayAmount, setCoPayAmount] = useState('');

  // S3-1: Switch to Cash override
  const [cashOverride, setCashOverride] = useState(false);

  // Payment override accordion
  const [showOverridePanel, setShowOverridePanel] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState<string | null>(null);
  // Override form fields
  const [overrideDeferredReason, setOverrideDeferredReason] = useState('');
  const [overrideDayAmount, setOverrideDayAmount] = useState('');
  const [overrideDayConfirmed, setOverrideDayConfirmed] = useState(false);
  const [overrideUrgentReason, setOverrideUrgentReason] = useState('');
  const [overrideUrgentApprover, setOverrideUrgentApprover] = useState('');
  const [overrideInstalPaid, setOverrideInstalPaid] = useState('');
  const [overrideInstalBalance, setOverrideInstalBalance] = useState('');

  // Find payment item for toggling
  const paymentItem = items.find((i) => i.itemKey === 'payment_confirmed' || i.itemKey?.includes('payment'));

  // S3-1/S3-2/S3-3: Read current pre-auth status for Insurance/CoPay paths
  const needsPreAuth = isInsurance || isCoPay;
  const { data: preauthRecords = [] } = useInsurancePreauthBySchedule(needsPreAuth ? scheduleId : undefined);
  const latestPreauth = preauthRecords[0] ?? null;
  const preauthStatus = latestPreauth?.preauthStatus;

  const qc = useQueryClient();

  // S3-3: Send to Billing dept when InitialApproved
  const billingDeptMutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.post('/dept-coordination', {
        scheduleId,
        department: 'Billing',
        requestMessage: 'Insurance pre-auth InitialApproved — billing team please review and process final claim.',
      });
    },
    onSuccess: () => toast.success('Billing dept notified'),
    onError: () => toast.error('Failed to notify billing'),
  });

  // Auto-fire billing dept notification on InitialApproved (once per session)
  const billingNotifiedRef = useRef(false);
  useEffect(() => {
    if (preauthStatus === 'InitialApproved' && !billingNotifiedRef.current) {
      billingNotifiedRef.current = true;
      billingDeptMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preauthStatus]);

  // Billing dept status — used by Cash + CoPay paths
  const { data: deptSummary } = useGetDeptSummary(scheduleId);
  const billingStatus = deptSummary?.departments?.Billing?.status ?? 'None';

  // Cash / CoPay: mutation to send payment request to Billing dept
  const cashBillingMutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      const procList = recommendedProcedures
        ?.map((p: any) => (typeof p === 'string' ? p : (p.name ?? p.procedureName ?? '')))
        .filter(Boolean)
        .join(', ');
      await api.post('/dept-coordination', {
        scheduleId,
        department: 'Billing',
        requestType: 'payment_request',
        requestMessage: `Payment request — Patient type: ${patientType ?? 'Cash'}. Package: ₹${packageAmount ? packageAmount.toLocaleString('en-IN') : 'TBD'}${procList ? `. Procedures: ${procList}` : ''}.`,
      });
    },
    onSuccess: () => {
      toast.success('Payment request sent to Billing');
      qc.invalidateQueries({ queryKey: ['deptCoordination', 'summary', scheduleId] });
    },
    onError: () => toast.error('Failed to send billing request'),
  });

  // Auto-mark payment item when billing confirms (Cash) or pre-auth + billing both done (CoPay)
  const autoMarkRef = useRef(false);
  useEffect(() => {
    if (!paymentItem || paymentItem.isComplete || autoMarkRef.current) return;
    const cashReady = isCash && billingStatus === 'Completed';
    const coPayReady = isCoPay && preauthStatus === 'FinalApproved' && billingStatus === 'Completed';
    if (cashReady || coPayReady) {
      autoMarkRef.current = true;
      onMarkItem(paymentItem.id, true, 'Payment confirmed by Billing dept');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingStatus, preauthStatus, isCash, isCoPay]);

  // Override billing notification (fire-and-forget — silent fail)
  const overrideBillingMutation = useMutation({
    mutationFn: async ({ note, priority }: { note: string; priority: string }) => {
      const api = getApi();
      await api.post('/dept-coordination', {
        scheduleId,
        department: 'Billing',
        requestType: 'payment_override',
        requestMessage: `Payment override applied: ${note}`,
        priority,
      });
    },
    onError: () => {},
  });

  // C4: Upload govt scheme referral document to server
  const uploadReferralMutation = useMutation({
    mutationFn: async (file: File) => {
      const api = getApi();
      const formData = new FormData();
      formData.append('sessionId', sessionId ?? 'temp-referral');
      formData.append('file', file);
      formData.append('documentType', 'Referral Letter');
      formData.append('documentName', file.name);
      const res = await api.post('/Counseling/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (data) => {
      const url: string = data?.document?.filePath ?? data?.fileInfo?.originalName ?? '';
      setReferralDocumentUrl(url);
      setReferralUploaded(true);
      toast.success('Referral document uploaded');
    },
    onError: () => {
      setReferralFile(null);
      setReferralUploaded(false);
      setReferralDocumentUrl(null);
      toast.error('Failed to upload referral document');
    },
  });

  // Save an override: marks the checklist item + optionally notifies Billing
  const saveOverride = (type: 'deferred' | 'day_of_surgery' | 'urgent' | 'instalment') => {
    if (!paymentItem || paymentItem.isComplete) return;
    let note = '';
    let notifyBilling = false;
    let billingPriority = 'Normal';

    switch (type) {
      case 'deferred':
        note = `OVERRIDE:deferred — reason: ${overrideDeferredReason}`;
        notifyBilling = true;
        billingPriority = 'Low';
        break;
      case 'day_of_surgery':
        note = `OVERRIDE:day_of_surgery — ₹${overrideDayAmount || '?'}`;
        notifyBilling = true;
        break;
      case 'urgent':
        note = `OVERRIDE:urgent — reason: ${overrideUrgentReason}, by: ${overrideUrgentApprover}`;
        notifyBilling = false;
        break;
      case 'instalment':
        note = `OVERRIDE:instalment — paid: ₹${overrideInstalPaid}, balance: ₹${overrideInstalBalance}`;
        notifyBilling = true;
        break;
    }

    onMarkItem(paymentItem.id, true, note);
    if (notifyBilling) overrideBillingMutation.mutate({ note, priority: billingPriority });
    setShowOverridePanel(false);
    setOverrideOpen(null);
  };

  return (
    <div className="space-y-4">
      {blockers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Action required</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {blockers.map((b) => b.itemLabel).join(', ')} must be completed before proceeding.
            </p>
          </div>
        </div>
      )}

      {/* ── IOL Package Summary (all patient types) ─────────────────────── */}
      {(recommendedProcedures && recommendedProcedures.length > 0) || packageAmount ? (
        <div className="border border-indigo-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-indigo-50 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-800">Package Summary</span>
          </div>
          <div className="px-4 py-3 bg-white">
            {recommendedProcedures && recommendedProcedures.length > 0 && (
              <table className="w-full text-xs mb-3">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-1.5 font-medium">Procedure</th>
                    <th className="text-left pb-1.5 font-medium">Eye</th>
                    <th className="text-right pb-1.5 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedProcedures.map((p: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 text-gray-800">{p.name ?? p.procedureName ?? String(p)}</td>
                      <td className="py-1.5 text-gray-500">{formatEye(p.eye ?? p.laterality ?? p.eyeSide)}</td>
                      <td className="py-1.5 text-right text-gray-700">
                        {p.amount != null ? `₹${Number(p.amount).toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {packageAmount != null && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <span className="text-sm font-semibold text-gray-700">Package Total</span>
                <span className="text-sm font-bold text-emerald-700">₹{packageAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 hover:underline"
              onClick={() => setShowOverridePanel((v) => !v)}
            >
              <AlertTriangle className="w-3 h-3" />
              {showOverridePanel ? 'Hide special arrangement ↑' : '⚠ Special Arrangement ↓'}
            </button>

            {/* Override accordion */}
            {showOverridePanel && (
              <div className="mt-3 border border-amber-200 rounded-xl overflow-hidden divide-y divide-amber-100">

                {/* ── 1. Payment Later ─── */}
                <div>
                  <button
                    type="button"
                    onClick={() => setOverrideOpen(overrideOpen === 'deferred' ? null : 'deferred')}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">Payment Can Be Done Later</span>
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-blue-500 transition-transform', overrideOpen === 'deferred' && 'rotate-180')} />
                  </button>
                  {overrideOpen === 'deferred' && (
                    <div className="px-3 pb-3 pt-2 bg-blue-50/40 space-y-2">
                      <p className="text-[11px] text-gray-500">Collect payment on day of admission or discharge.</p>
                      <textarea
                        placeholder="Reason for deferral (required)"
                        value={overrideDeferredReason}
                        onChange={(e) => setOverrideDeferredReason(e.target.value)}
                        rows={2}
                        className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      />
                      <button
                        type="button"
                        disabled={!overrideDeferredReason.trim() || paymentItem?.isComplete}
                        onClick={() => saveOverride('deferred')}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Apply — Payment Deferred
                      </button>
                    </div>
                  )}
                </div>

                {/* ── 2. Day of Surgery ─── */}
                <div>
                  <button
                    type="button"
                    onClick={() => setOverrideOpen(overrideOpen === 'day_of_surgery' ? null : 'day_of_surgery')}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700">Day-of-Surgery Payment</span>
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-amber-500 transition-transform', overrideOpen === 'day_of_surgery' && 'rotate-180')} />
                  </button>
                  {overrideOpen === 'day_of_surgery' && (
                    <div className="px-3 pb-3 pt-2 bg-amber-50/40 space-y-2">
                      <p className="text-[11px] text-gray-500">Patient will pay on the day of the surgery.</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 whitespace-nowrap">Expected amount (₹)</span>
                        <input
                          type="number"
                          min={0}
                          placeholder="Amount"
                          value={overrideDayAmount}
                          onChange={(e) => setOverrideDayAmount(e.target.value)}
                          className="w-28 text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                      </div>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={overrideDayConfirmed}
                          onChange={(e) => setOverrideDayConfirmed(e.target.checked)}
                          className="mt-0.5 accent-amber-600"
                        />
                        <span className="text-xs text-gray-700">Patient confirmed — will pay on day of surgery</span>
                      </label>
                      <button
                        type="button"
                        disabled={!overrideDayConfirmed || paymentItem?.isComplete}
                        onClick={() => saveOverride('day_of_surgery')}
                        className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                      >
                        Apply — Day-of-Surgery Payment
                      </button>
                    </div>
                  )}
                </div>

                {/* ── 3. Urgent Override ─── */}
                <div>
                  <button
                    type="button"
                    onClick={() => setOverrideOpen(overrideOpen === 'urgent' ? null : 'urgent')}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-red-50 hover:bg-red-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-xs font-semibold text-red-700">Urgent Override</span>
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-red-500 transition-transform', overrideOpen === 'urgent' && 'rotate-180')} />
                  </button>
                  {overrideOpen === 'urgent' && (
                    <div className="px-3 pb-3 pt-2 bg-red-50/40 space-y-2">
                      <p className="text-[11px] text-gray-500">Emergency / urgent case — proceed without payment.</p>
                      <textarea
                        placeholder="Reason for urgent override (required)"
                        value={overrideUrgentReason}
                        onChange={(e) => setOverrideUrgentReason(e.target.value)}
                        rows={2}
                        className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                      />
                      <input
                        type="text"
                        placeholder="Approver name (required)"
                        value={overrideUrgentApprover}
                        onChange={(e) => setOverrideUrgentApprover(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-300"
                      />
                      <button
                        type="button"
                        disabled={!overrideUrgentReason.trim() || !overrideUrgentApprover.trim() || paymentItem?.isComplete}
                        onClick={() => saveOverride('urgent')}
                        className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Apply — Urgent Override
                      </button>
                    </div>
                  )}
                </div>

                {/* ── 4. Instalment Plan ─── */}
                <div>
                  <button
                    type="button"
                    onClick={() => setOverrideOpen(overrideOpen === 'instalment' ? null : 'instalment')}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-purple-50 hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700">Instalment / Part-Payment Plan</span>
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-purple-500 transition-transform', overrideOpen === 'instalment' && 'rotate-180')} />
                  </button>
                  {overrideOpen === 'instalment' && (
                    <div className="px-3 pb-3 pt-2 bg-purple-50/40 space-y-2">
                      <p className="text-[11px] text-gray-500">Patient approved for part-payment / instalment arrangement.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Amount Paid Now (₹)</label>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 5000"
                            value={overrideInstalPaid}
                            onChange={(e) => setOverrideInstalPaid(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Balance Remaining (₹)</label>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 15000"
                            value={overrideInstalBalance}
                            onChange={(e) => setOverrideInstalBalance(e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!overrideInstalPaid.trim() || paymentItem?.isComplete}
                        onClick={() => saveOverride('instalment')}
                        className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        Apply — Instalment Plan
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ── Insurance path ──────────────────────────────────────────────────── */}
      {(isInsurance && !cashOverride) && (
        <div className="border border-blue-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Insurance Pre-Authorization</span>
            <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{patientType}</span>
          </div>
          <div className="p-4">
            <InsurancePreAuthWidget scheduleId={scheduleId} sessionId={sessionId} patientType={patientType} />
          </div>

          {/* S3-1: Rejected actions */}
          {preauthStatus === 'Rejected' && (
            <div className="px-4 pb-4 space-y-2 border-t border-red-100 bg-red-50/50">
              <p className="text-xs font-semibold text-red-700 pt-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Pre-auth rejected — choose an action:
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => qc.invalidateQueries({ queryKey: ['insurance-preauth-schedule', scheduleId] })}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="w-3 h-3" /> Raise New Pre-Auth
                </button>
                <button
                  type="button"
                  onClick={() => setCashOverride(true)}
                  className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-200"
                >
                  <IndianRupee className="w-3 h-3" /> Switch to Cash
                </button>
              </div>
            </div>
          )}

          {/* S3-2: Expired actions */}
          {preauthStatus === 'Expired' && (
            <div className="px-4 pb-4 space-y-2 border-t border-amber-100 bg-amber-50/50">
              <p className="text-xs font-semibold text-amber-700 pt-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Pre-auth expired — please renew:
              </p>
              <button
                type="button"
                onClick={() => qc.invalidateQueries({ queryKey: ['insurance-preauth-schedule', scheduleId] })}
                className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-3 h-3" /> Raise New Pre-Auth
              </button>
            </div>
          )}

          {/* S3-3: InitialApproved / FinalApproved actions */}
          {(preauthStatus === 'InitialApproved' || preauthStatus === 'FinalApproved') && (
            <div className="px-4 pb-4 space-y-2 border-t border-teal-100 bg-teal-50/50">
              <p className="text-xs font-semibold text-teal-700 pt-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {preauthStatus === 'InitialApproved' ? 'Initial approval received' : 'Final approval received'}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={billingDeptMutation.isPending}
                  onClick={() => billingDeptMutation.mutate()}
                  className="flex items-center gap-1.5 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {billingDeptMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                  Notify Billing Dept
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* S3-1 Cash override path */}
      {isInsurance && cashOverride && (
        <div className="border border-green-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-green-50 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-green-700" />
            <span className="text-sm font-medium text-green-800">Cash Payment (Insurance Rejected)</span>
            <button type="button" onClick={() => setCashOverride(false)} className="ml-auto text-xs text-blue-600 hover:underline">
              Back to Insurance
            </button>
          </div>
          <div className="px-4 py-4 bg-white space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Amount Collected (₹)</span>
              <input type="number" min={0} value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} placeholder="0" className="w-32 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-300" />
            </div>
            {paymentItem && !paymentItem.isComplete && (
              <button type="button" disabled={isMutating} onClick={() => onMarkItem(paymentItem.id, true, `Cash override (insurance rejected) ₹${cashAmount || 0}`)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
                Mark Payment Received
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── CoPay path ───────────────────────────────────────────────────────── */}
      {isCoPay && (
        <>
          {/* Dual-condition info */}
          {!paymentItem?.isComplete && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              Both insurance pre-auth final approval <strong className="mx-0.5">and</strong> billing co-pay confirmation are required to complete this step.
            </div>
          )}

          <div className="border border-blue-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 flex items-center gap-2">
              <Split className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Insurance Portion (Pre-Auth)</span>
              <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">CoPay</span>
            </div>
            <div className="p-4">
              <InsurancePreAuthWidget scheduleId={scheduleId} sessionId={sessionId} patientType="CoPay" />
            </div>
          </div>

          <div className="border border-green-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-green-50 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-green-700" />
              <span className="text-sm font-medium text-green-800">Patient Co-Pay Collection</span>
            </div>
            <div className="px-4 py-4 bg-white space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Co-Pay Amount (₹)</span>
                <input
                  type="number"
                  min={0}
                  value={coPayAmount}
                  onChange={(e) => setCoPayAmount(e.target.value)}
                  placeholder="0"
                  className="w-32 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
              {paymentItem?.isComplete && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Payment confirmed · {paymentItem.notes}
                </p>
              )}
            </div>
          </div>

          {/* CoPay: Billing confirmation section — visible once pre-auth is FinalApproved */}
          {preauthStatus === 'FinalApproved' && (
            <div className="border border-teal-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-teal-50 flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-800">Billing Co-Pay Confirmation</span>
                <span className="ml-auto text-[11px] text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">Pre-Auth ✓</span>
              </div>
              <div className="px-4 py-4 bg-white space-y-3">
                <p className="text-xs text-gray-600">Pre-authorisation approved. Notify Billing to collect co-pay of ₹{coPayAmount || '?'} and process the claim.</p>
                {billingStatus === 'None' && (
                  <button
                    type="button"
                    disabled={cashBillingMutation.isPending}
                    onClick={() => cashBillingMutation.mutate()}
                    className="flex items-center gap-2 text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {cashBillingMutation.isPending
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Send className="w-3.5 h-3.5" />}
                    Notify Billing for Co-Pay Collection
                  </button>
                )}
                {(billingStatus === 'Pending' || billingStatus === 'Sent' || billingStatus === 'InProgress') && (
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                    <Bell className="w-4 h-4 flex-shrink-0" />
                    <span>Billing dept notified — awaiting co-pay confirmation</span>
                  </div>
                )}
                {billingStatus === 'Completed' && (
                  <p className="text-xs text-teal-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Billing confirmed co-pay collected
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Govt Scheme path ────────────────────────────────────────────────── */}
      {isGovtScheme && (
        <div className="border border-indigo-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-indigo-50 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">Govt Scheme Details</span>
            <span className="ml-auto text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{patientType}</span>
          </div>
          <div className="px-4 py-4 bg-white space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Scheme Number</label>
              <input
                type="text"
                value={schemeNo}
                onChange={(e) => setSchemeNo(e.target.value)}
                placeholder="Enter scheme / beneficiary number"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setReferralUploaded((v) => !v)}
                className="flex-shrink-0"
              >
                {referralUploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-400 transition-colors" />
                )}
              </button>
              <span className={cn('text-sm', referralUploaded ? 'text-gray-400 line-through' : 'text-gray-700')}>
                Referral letter uploaded / verified
              </span>
            </div>
            {/* File upload for referral letter */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-700">Upload Referral Letter / Prescription</p>
              <label className={cn(
                'flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-xs transition-colors w-full',
                referralDocumentUrl
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : uploadReferralMutation.isPending
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                    : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600'
              )}>
                <FileUp className="w-4 h-4 flex-shrink-0" />
                {uploadReferralMutation.isPending ? (
                  <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</span>
                ) : referralDocumentUrl ? (
                  <span className="truncate">✓ Uploaded: {referralFile?.name}</span>
                ) : referralFile ? (
                  <span className="truncate">{referralFile.name}</span>
                ) : (
                  <span>Click to select file (PDF, JPG, PNG)</span>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setReferralFile(f);
                    setReferralUploaded(false);
                    setReferralDocumentUrl(null);
                    if (f) uploadReferralMutation.mutate(f);
                  }}
                />
              </label>
              {referralFile && (
                <button
                  type="button"
                  onClick={() => { setReferralFile(null); setReferralUploaded(false); setReferralDocumentUrl(null); uploadReferralMutation.reset(); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove file
                </button>
              )}
            </div>
            {paymentItem && !paymentItem.isComplete && (
              <button
                type="button"
                disabled={isMutating || !schemeNo || !referralDocumentUrl}
                onClick={() =>
                  onMarkItem(
                    paymentItem.id,
                    true,
                    `${patientType} scheme no: ${schemeNo}`
                  )
                }
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Mark Scheme Verified
              </button>
            )}
            {paymentItem?.isComplete && (
              <p className="text-xs text-indigo-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Scheme verified · {paymentItem.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Cash / Corporate path ────────────────────────────────────────────── */}
      {isCash && (
        <div className="border border-green-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-green-50 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-green-700" />
            <span className="text-sm font-medium text-green-800">Cash / Corporate Payment</span>
            {patientType && (
              <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{patientType}</span>
            )}
          </div>
          <div className="px-4 py-4 bg-white space-y-4">
            {/* Package + procedures summary for billing reference */}
            {(packageAmount || (recommendedProcedures && recommendedProcedures.length > 0)) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                {packageAmount != null && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-700">
                      Package Amount: <span className="text-green-700">₹{packageAmount.toLocaleString('en-IN')}</span>
                    </span>
                  </div>
                )}
                {recommendedProcedures && recommendedProcedures.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600">Included Procedures:</p>
                    <ul className="space-y-0.5">
                      {recommendedProcedures.map((p: any, i: number) => (
                        <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                          {typeof p === 'string' ? p : (p.name ?? p.procedureName ?? JSON.stringify(p))}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 3-state billing handoff */}
            {paymentItem && !paymentItem.isComplete && billingStatus === 'None' && (
              <button
                type="button"
                disabled={cashBillingMutation.isPending}
                onClick={() => cashBillingMutation.mutate()}
                className="flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {cashBillingMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
                Send Payment Request to Billing
              </button>
            )}
            {paymentItem && !paymentItem.isComplete &&
              (billingStatus === 'Pending' || billingStatus === 'Sent' || billingStatus === 'InProgress') && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span>Billing dept notified — awaiting confirmation</span>
              </div>
            )}
            {paymentItem?.isComplete && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Payment confirmed · {paymentItem.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Generic checklist items ──────────────────────────────────────────── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Payment Checklist</span>
          </div>
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              completedCount === items.length ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            )}
          >
            {completedCount}/{items.length}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => onMarkItem(item.id, !item.isComplete)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {item.isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 hover:text-green-400 transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        item.isComplete ? 'text-gray-400 line-through' : 'text-gray-800'
                      )}
                    >
                      {item.itemLabel}
                      {item.isMandatory && !item.isComplete && (
                        <span className="ml-1 text-xs text-red-500">*</span>
                      )}
                      {item.isBlocking && !item.isComplete && (
                        <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                          blocking
                        </span>
                      )}
                    </p>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-green-600 mt-0.5 italic">Note: {item.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
