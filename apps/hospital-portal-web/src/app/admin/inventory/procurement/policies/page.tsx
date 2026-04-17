'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, RefreshCw, CheckCircle, Clock, History, Play, Upload, RotateCcw } from 'lucide-react';
import {
  procurementPolicyApi,
  BranchProcurementPolicy,
  BranchProcurementPolicyVersion,
  SavePolicyDraftRequest,
  SimulatePolicyResult,
} from '@/lib/api/inventory-service.api';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth-store';

// â”€â”€â”€ Status Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PolicyStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: 'bg-yellow-100 text-yellow-800',
    Published: 'bg-green-100 text-green-800',
    Superseded: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status === 'Published' && <CheckCircle className="w-3 h-3" />}
      {status === 'Draft' && <Clock className="w-3 h-3" />}
      {status}
    </span>
  );
}

// â”€â”€â”€ Currency Input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CurrencyField({
  label, value, onChange, min = 0, hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-2 text-gray-400 text-sm">â‚¹</span>
        <input
          type="number"
          min={min}
          step={1000}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// â”€â”€â”€ Simulate Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SimulatePanel({ branchId }: { branchId: string }) {
  const [amount, setAmount] = useState(0);
  const [result, setResult] = useState<SimulatePolicyResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!amount || amount <= 0) return;
    setBusy(true);
    try {
      const r = await procurementPolicyApi.simulate({ branchId, amount });
      setResult(r);
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <Play className="w-4 h-4" /> Live Simulator
      </h3>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">Requisition amount (â‚¹)</label>
          <input
            type="number"
            value={amount || ''}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder="e.g. 125000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={run}
          disabled={busy || !amount}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'â€¦' : 'Simulate'}
        </button>
      </div>

      {result && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white rounded-lg p-2 border border-blue-100">
            <span className="text-gray-500">Path</span>
            <p className="font-semibold text-blue-700">{result.recommendedPath}</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-blue-100">
            <span className="text-gray-500">Approval</span>
            <p className="font-semibold text-purple-700">{result.needsDualApproval ? 'Dual (L1 + L2)' : 'Single (L1)'}</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-blue-100">
            <span className="text-gray-500">RFQ required</span>
            <p className="font-semibold">{result.needsRfq ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-blue-100">
            <span className="text-gray-500">Min quotes</span>
            <p className="font-semibold">{result.minVendorQuotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Version History Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function VersionHistoryPanel({
  policyId,
  onRollback,
}: {
  policyId: string;
  onRollback: (versionId: string) => void;
}) {
  const [versions, setVersions] = useState<BranchProcurementPolicyVersion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    procurementPolicyApi.getVersions(policyId).then(setVersions).finally(() => setLoading(false));
  }, [policyId]);

  if (loading) return <p className="text-xs text-gray-400 py-2">Loading historyâ€¦</p>;
  if (versions.length === 0) return <p className="text-xs text-gray-400 py-2">No version history yet.</p>;

  return (
    <div className="divide-y divide-gray-100">
      {versions.map(v => (
        <div key={v.id} className="py-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800">v{v.versionNumber}</p>
            <p className="text-xs text-gray-500 truncate">{v.changeNotes ?? 'No notes'}</p>
            <p className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-xs text-gray-600 shrink-0">
            <div>Direct PO: â‚¹{v.directPoLimit.toLocaleString()}</div>
            <div>RFQ from: â‚¹{v.rfqMandatoryFrom.toLocaleString()}</div>
          </div>
          <button
            onClick={() => onRollback(v.id)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-orange-700 bg-orange-50 rounded hover:bg-orange-100 shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Rollback
          </button>
        </div>
      ))}
    </div>
  );
}

// â”€â”€â”€ Policy Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface PolicyFormState {
  policyName: string;
  directPoLimit: number;
  rfqMandatoryFrom: number;
  dualApprovalFrom: number;
  minVendorQuotes: number;
  emergencyBypassAllowed: boolean;
  emergencyBypassExpiryHours: number;
  notes: string;
}

function policyToForm(p: BranchProcurementPolicy): PolicyFormState {
  return {
    policyName: p.policyName,
    directPoLimit: p.directPoLimit,
    rfqMandatoryFrom: p.rfqMandatoryFrom,
    dualApprovalFrom: p.dualApprovalFrom,
    minVendorQuotes: p.minVendorQuotes,
    emergencyBypassAllowed: p.emergencyBypassAllowed,
    emergencyBypassExpiryHours: p.emergencyBypassExpiryHours,
    notes: p.notes ?? '',
  };
}

const DEFAULT_FORM: PolicyFormState = {
  policyName: '',
  directPoLimit: 50000,
  rfqMandatoryFrom: 40000,
  dualApprovalFrom: 150000,
  minVendorQuotes: 3,
  emergencyBypassAllowed: true,
  emergencyBypassExpiryHours: 24,
  notes: '',
};

// â”€â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function validate(f: PolicyFormState): string[] {
  const errors: string[] = [];
  if (!f.policyName.trim()) errors.push('Policy name is required.');
  if (f.rfqMandatoryFrom > f.directPoLimit)
    errors.push('RFQ threshold must be â‰¤ Direct PO limit.');
  if (f.dualApprovalFrom <= 0) errors.push('Dual approval threshold must be > 0.');
  if (f.minVendorQuotes < 1) errors.push('Minimum quotes must be at least 1.');
  return errors;
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ProcurementPoliciesPage() {
  const [policies, setPolicies] = useState<BranchProcurementPolicy[]>([]);
  const [selected, setSelected] = useState<BranchProcurementPolicy | null>(null);
  const [form, setForm] = useState<PolicyFormState>(DEFAULT_FORM);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [publishNotes, setPublishNotes] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Use the first branch from auth store (real impl would use a branch selector)
  const branchId = useAuthStore(s => s.user?.branchId ?? '');

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const list = await procurementPolicyApi.list(branchId);
      setPolicies(list);
      // Auto-select the draft or the active published policy
      const draft = list.find(p => p.policyStatus === 'Draft');
      const active = list.find(p => p.policyStatus === 'Published');
      const pick = draft ?? active ?? null;
      setSelected(pick);
      setForm(pick ? policyToForm(pick) : { ...DEFAULT_FORM });
      setDirty(false);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => { load(); }, [load]);

  function updateField<K extends keyof PolicyFormState>(key: K, value: PolicyFormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setDirty(true);
    setErrors([]);
  }

  async function saveDraft() {
    const errs = validate(form);
    if (errs.length) { setErrors(errs); return; }
    setBusy(true);
    try {
      const req: SavePolicyDraftRequest = {
        branchId,
        policyName: form.policyName,
        directPoLimit: form.directPoLimit,
        rfqMandatoryFrom: form.rfqMandatoryFrom,
        dualApprovalFrom: form.dualApprovalFrom,
        minVendorQuotes: form.minVendorQuotes,
        emergencyBypassAllowed: form.emergencyBypassAllowed,
        emergencyBypassExpiryHours: form.emergencyBypassExpiryHours,
        notes: form.notes || undefined,
        policyId: selected?.policyStatus === 'Draft' ? selected.id : undefined,
      };
      await procurementPolicyApi.saveDraft(req);
      setDirty(false);
      setSuccessMsg('Draft saved.');
      toast.success('Draft saved.');
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch (e: unknown) {
      setErrors([(e as Error).message || 'Save failed.']);
      toast.error((e as Error).message || 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!selected?.id) return;
    setBusy(true);
    try {
      await procurementPolicyApi.publish(selected.id, { changeNotes: publishNotes || undefined });
      setShowPublishDialog(false);
      setPublishNotes('');
      setSuccessMsg('Policy published successfully.');
      toast.success('Policy published successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      load();
    } catch (e: unknown) {
      setErrors([(e as Error).message || 'Publish failed.']);
      toast.error((e as Error).message || 'Publish failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRollback(versionId: string) {
    if (!selected?.id) return;
    if (!confirm('Rollback will create a new Draft from this version. Continue?')) return;
    setBusy(true);
    try {
      await procurementPolicyApi.rollback(selected.id, versionId);
      setSuccessMsg('Rollback draft created.');
      toast.success('Rollback draft created.');
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch (e: unknown) {
      setErrors([(e as Error).message || 'Rollback failed.']);
      toast.error((e as Error).message || 'Rollback failed.');
    } finally {
      setBusy(false);
    }
  }

  const activePolicyId = policies.find(p => p.policyStatus === 'Draft')?.id
    ?? policies.find(p => p.policyStatus === 'Published')?.id;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Procurement Policy Console</h1>
            <p className="text-sm text-gray-500">Configure branch-wise procurement thresholds and approval rules</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Policy status bar */}
      {policies.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {policies.slice(0, 5).map(p => (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setForm(policyToForm(p)); setDirty(false); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-colors ${
                selected?.id === p.id ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <PolicyStatusBadge status={p.policyStatus} />
              <span className="font-medium">{p.policyName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Alerts */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((e, i) => <p key={i} className="text-sm text-red-700">{e}</p>)}
        </div>
      )}
      {dirty && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
          You have unsaved changes.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Name & status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Policy Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>
                <input
                  value={form.policyName}
                  onChange={e => updateField('policyName', e.target.value)}
                  placeholder="e.g. Main Hospital â€“ Q2 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selected && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <PolicyStatusBadge status={selected.policyStatus} />
                </div>
              )}
              {selected?.publishedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Published</label>
                  <p className="text-sm text-gray-600">{new Date(selected.publishedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Thresholds */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Procurement Thresholds</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CurrencyField
                label="Direct PO Limit"
                value={form.directPoLimit}
                onChange={v => updateField('directPoLimit', v)}
                hint="Orders below this can bypass RFQ"
              />
              <CurrencyField
                label="RFQ Mandatory From"
                value={form.rfqMandatoryFrom}
                onChange={v => updateField('rfqMandatoryFrom', v)}
                hint="Orders above this must go through RFQ"
              />
              <CurrencyField
                label="Dual Approval From"
                value={form.dualApprovalFrom}
                onChange={v => updateField('dualApprovalFrom', v)}
                hint="POs above this require L1 + L2 approval"
              />
            </div>
          </div>

          {/* Quote & Emergency settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Quote & Emergency Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Vendor Quotes</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.minVendorQuotes}
                  onChange={e => updateField('minVendorQuotes', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum quotes required per RFQ</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Bypass</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="emergencyBypass"
                    checked={form.emergencyBypassAllowed}
                    onChange={e => updateField('emergencyBypassAllowed', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <label htmlFor="emergencyBypass" className="text-sm text-gray-700">Allow emergency bypass</label>
                </div>
              </div>
              {form.emergencyBypassAllowed && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bypass Expiry (hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={72}
                    value={form.emergencyBypassExpiryHours}
                    onChange={e => updateField('emergencyBypassExpiryHours', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Emergency POs expire after this many hours</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
            <textarea
              value={form.notes}
              onChange={e => updateField('notes', e.target.value)}
              rows={2}
              placeholder="Optional notes for this policyâ€¦"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveDraft}
              disabled={busy || !dirty}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              Save Draft
            </button>
            {selected?.policyStatus === 'Draft' && (
              <button
                onClick={() => setShowPublishDialog(true)}
                disabled={busy || dirty}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Publish Policy
              </button>
            )}
            {dirty && (
              <p className="self-center text-xs text-gray-500">Save the draft before publishing.</p>
            )}
          </div>
        </div>

        {/* Right: Simulator + History */}
        <div className="space-y-5">
          {branchId && <SimulatePanel branchId={branchId} />}

          {/* Version History */}
          {activePolicyId && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <button
                onClick={() => setShowHistory(h => !h)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-700"
              >
                <span className="flex items-center gap-2"><History className="w-4 h-4" /> Version History</span>
                <span className="text-gray-400 text-xs">{showHistory ? 'â–²' : 'â–¼'}</span>
              </button>
              {showHistory && (
                <div className="mt-3">
                  <VersionHistoryPanel policyId={activePolicyId} onRollback={handleRollback} />
                </div>
              )}
            </div>
          )}

          {/* Current active limits summary */}
          {selected && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Current Limits</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Direct PO</dt>
                  <dd className="font-medium">â‚¹{form.directPoLimit.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">RFQ from</dt>
                  <dd className="font-medium">â‚¹{form.rfqMandatoryFrom.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Dual approval</dt>
                  <dd className="font-medium">â‚¹{form.dualApprovalFrom.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Min quotes</dt>
                  <dd className="font-medium">{form.minVendorQuotes}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Emergency bypass</dt>
                  <dd className="font-medium">{form.emergencyBypassAllowed ? `Yes (${form.emergencyBypassExpiryHours}h)` : 'No'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Publish Dialog */}
      {showPublishDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Publish Policy</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will supersede any currently active policy for this branch. This action cannot be undone
              (but you can rollback to a prior version).
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Change Notes (optional)</label>
            <textarea
              value={publishNotes}
              onChange={e => setPublishNotes(e.target.value)}
              rows={2}
              placeholder="What changed in this version?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPublishDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={publish}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {busy && <RefreshCw className="w-4 h-4 animate-spin" />}
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

