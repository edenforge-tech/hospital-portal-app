'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  inventoryRequisitionApi,
  EvaluatePolicyPathResult,
  ConvertToRfqRequest,
  ConvertToPORequest,
  ConvertToPOItemOverride,
} from '@/lib/api/inventory-service.api';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RequisitionDetail {
  id: string;
  requisitionNumber: string;
  storeId: string;
  requisitionType: string;
  status: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    itemId: string;
    itemName: string;
    requiredQuantity: number;
    currentStock: number;
    preferredVendor?: string;
    remarks?: string;
  }[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    Pending:   'bg-yellow-100 text-yellow-700',
    Approved:  'bg-green-100 text-green-700',
    POCreated: 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
      {s}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function fmt(v?: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

function fmtCurrency(v?: number | null) {
  if (v == null) return '—';
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

// ─── Policy Path Panel ─────────────────────────────────────────────────────────

function PolicyPathPanel({ requisitionId }: { requisitionId: string }) {
  const [result, setResult] = useState<EvaluatePolicyPathResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const evaluate = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inventoryRequisitionApi.evaluatePath(requisitionId);
      setResult(data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? err?.message ?? 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Procurement Policy Path</h2>
        {!result && (
          <button
            onClick={evaluate}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Evaluating…' : 'Evaluate Path'}
          </button>
        )}
        {result && (
          <button onClick={() => { setResult(null); setError(''); }}
            className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
            Re-evaluate
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">{error}</div>
      )}

      {!result && !loading && !error && (
        <p className="text-xs text-gray-400">Click &ldquo;Evaluate Path&rdquo; to check how this requisition should be processed based on the active branch procurement policy.</p>
      )}

      {result && (
        <div className="space-y-4">
          {/* Recommendation */}
          <div className={`rounded-lg p-4 ${result.recommendedPath === 'RFQ' ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`text-2xl ${result.recommendedPath === 'RFQ' ? 'text-amber-500' : 'text-green-500'}`}>
                {result.recommendedPath === 'RFQ' ? '📋' : '📦'}
              </div>
              <div>
                <p className={`text-sm font-bold ${result.recommendedPath === 'RFQ' ? 'text-amber-800' : 'text-green-800'}`}>
                  Recommended: <span className="uppercase tracking-wide">{result.recommendedPath === 'RFQ' ? 'Request for Quotation' : 'Direct Purchase Order'}</span>
                </p>
                <p className={`text-xs mt-1 ${result.recommendedPath === 'RFQ' ? 'text-amber-700' : 'text-green-700'}`}>{result.reason}</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Stat label="Estimated Value" value={fmtCurrency(result.estimatedValue)} />
            <Stat label="Direct PO Limit" value={result.directPoLimit != null ? fmtCurrency(result.directPoLimit) : '—'} />
            <Stat label="RFQ Mandatory From" value={result.rfqMandatoryFrom != null ? fmtCurrency(result.rfqMandatoryFrom) : '—'} />
            <Stat label="Min. Vendor Quotes" value={result.minVendorQuotes ?? '—'} />
            <Stat label="Dual Approval" value={
              result.requiresDualApproval
                ? <span className="text-violet-600 font-semibold">Required</span>
                : <span className="text-gray-400">Not required</span>
            } />
            {result.policyName && <Stat label="Active Policy" value={result.policyName} />}
          </dl>
        </div>
      )}
    </div>
  );
}

// ─── Convert to RFQ Modal ──────────────────────────────────────────────────────

function ConvertToRfqModal({
  requisitionId,
  onClose,
  onSuccess,
}: { requisitionId: string; onClose: () => void; onSuccess: (rfqId: string) => void }) {
  const [form, setForm] = useState<ConvertToRfqRequest>({
    title: '',
    branchId: '',
    vendorIds: [],
    responseDeadline: '',
  });
  const [vendorIdInput, setVendorIdInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addVendor = () => {
    const v = vendorIdInput.trim();
    if (!v) return;
    setForm(f => ({ ...f, vendorIds: [...(f.vendorIds ?? []), v] }));
    setVendorIdInput('');
  };

  const removeVendor = (i: number) =>
    setForm(f => ({ ...f, vendorIds: (f.vendorIds ?? []).filter((_, idx) => idx !== i) }));

  const submit = async () => {
    if (!form.branchId.trim()) { setError('Branch ID is required'); return; }
    setSaving(true);
    setError('');
    try {
      const result = await inventoryRequisitionApi.convertToRfq(requisitionId, {
        ...form,
        title: form.title || undefined,
        responseDeadline: form.responseDeadline || undefined,
      });
      onSuccess(result.id);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message ?? 'Conversion failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">Convert to RFQ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">RFQ Title (optional)</label>
            <input value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Auto-generated if blank" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Branch ID *</label>
              <input value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="UUID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Response Deadline</label>
              <input type="date" value={form.responseDeadline ?? ''} onChange={e => setForm(f => ({ ...f, responseDeadline: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vendor IDs to invite</label>
            <div className="flex gap-2">
              <input value={vendorIdInput} onChange={e => setVendorIdInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addVendor()}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Paste vendor UUID and press Enter" />
              <button onClick={addVendor}
                className="px-3 py-2 text-xs bg-gray-100 border rounded-lg hover:bg-gray-200">Add</button>
            </div>
            {(form.vendorIds ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.vendorIds ?? []).map((v, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs rounded-full font-mono">
                    {v.slice(0, 8)}…
                    <button onClick={() => removeVendor(i)} className="text-indigo-400 hover:text-indigo-600">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="px-5 py-2 text-sm bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50">
            {saving ? 'Converting…' : 'Create RFQ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Convert to PO Modal ───────────────────────────────────────────────────────

function ConvertToPOModal({
  requisition,
  onClose,
  onSuccess,
}: { requisition: RequisitionDetail; onClose: () => void; onSuccess: (poId: string) => void }) {
  const [branchId, setBranchId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ConvertToPOItemOverride[]>(
    requisition.items.map(i => ({ itemId: i.itemId, orderedQty: i.requiredQuantity, unitPrice: 0, gstPercent: 0, unit: 'Nos' }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setItem = (idx: number, field: keyof ConvertToPOItemOverride, value: string | number) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const submit = async () => {
    if (!branchId.trim()) { setError('Branch ID is required'); return; }
    if (!vendorId.trim()) { setError('Vendor ID is required'); return; }
    setSaving(true);
    setError('');
    try {
      const req: ConvertToPORequest = {
        branchId,
        vendorId,
        vendorName: vendorName || undefined,
        items,
        expectedDeliveryDate: expectedDelivery || undefined,
        isEmergency,
        notes: notes || undefined,
      };
      const result = await inventoryRequisitionApi.convertToPO(requisition.id, req);
      onSuccess(result.id);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message ?? 'Conversion failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">Convert to Direct Purchase Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Branch ID *</label>
              <input value={branchId} onChange={e => setBranchId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="UUID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendor ID *</label>
              <input value={vendorId} onChange={e => setVendorId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="UUID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendor Name</label>
              <input value={vendorName} onChange={e => setVendorName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expected Delivery</label>
              <input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="emergencyPo" checked={isEmergency} onChange={e => setIsEmergency(e.target.checked)}
              className="rounded border-gray-300" />
            <label htmlFor="emergencyPo" className="text-sm text-gray-700">Emergency PO</label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Line items with price override */}
          <div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Line Items &amp; Pricing</h3>
            <div className="space-y-2">
              {items.map((item, idx) => {
                const reqItem = requisition.items[idx];
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-2.5">
                    <div className="col-span-4 text-xs font-medium text-gray-700 truncate">
                      {reqItem?.itemName ?? item.itemId.slice(0, 8)}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-0.5">Qty</label>
                      <input type="number" min={1} value={item.orderedQty}
                        onChange={e => setItem(idx, 'orderedQty', Number(e.target.value))}
                        className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-400 mb-0.5">Unit Price (₹)</label>
                      <input type="number" min={0} step="0.01" value={item.unitPrice}
                        onChange={e => setItem(idx, 'unitPrice', Number(e.target.value))}
                        className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-0.5">GST %</label>
                      <input type="number" min={0} max={100} value={item.gstPercent}
                        onChange={e => setItem(idx, 'gstPercent', Number(e.target.value))}
                        className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-1 text-right text-xs text-gray-500">
                      {item.unitPrice > 0 ? fmtCurrency(item.orderedQty * item.unitPrice * (1 + item.gstPercent / 100)) : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="px-5 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Creating PO…' : 'Create Purchase Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Actions Panel ─────────────────────────────────────────────────────────────

function ActionsPanel({
  requisition,
  onApprove,
  onReject,
  onConvertRfq,
  onConvertPO,
}: {
  requisition: RequisitionDetail;
  onApprove: () => void;
  onReject: () => void;
  onConvertRfq: () => void;
  onConvertPO: () => void;
}) {
  const s = requisition.status;

  if (s === 'POCreated' || s === 'Cancelled') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Actions</h2>
        <p className="text-sm text-gray-400">No actions available — requisition is {s}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Actions</h2>

      {s === 'Pending' && (
        <>
          <button onClick={onApprove}
            className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
            Approve Requisition
          </button>
          <button onClick={onReject}
            className="w-full px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50">
            Reject / Cancel
          </button>
        </>
      )}

      {s === 'Approved' && (
        <>
          <p className="text-xs text-gray-500 pb-1">This requisition is approved and ready to be converted:</p>
          <button onClick={onConvertRfq}
            className="w-full px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600">
            Convert → RFQ
          </button>
          <button onClick={onConvertPO}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            Convert → Direct PO
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function RequisitionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [requisition, setRequisition] = useState<RequisitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryRequisitionApi.get(id);
      setRequisition(data);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await inventoryRequisitionApi.approve(id);
      setActionSuccess('Requisition approved.');
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setActionError(err?.response?.data?.message ?? 'Approval failed');
    } finally {
      setActionLoading(false); }
  };

  const handleReject = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await inventoryRequisitionApi.reject(id);
      setActionSuccess('Requisition rejected.');
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setActionError(err?.response?.data?.message ?? 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-48">
        <p className="text-sm text-gray-400">Loading requisition…</p>
      </div>
    );
  }

  if (notFound || !requisition) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 text-sm">Requisition not found.</p>
        <Link href="/admin/inventory/requisitions" className="text-blue-600 text-sm hover:underline mt-2 inline-block">← Back to Requisitions</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/inventory/requisitions" className="text-sm text-blue-600 hover:underline">← Requisitions</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 font-mono">{requisition.requisitionNumber}</h1>
        </div>
        <StatusBadge s={requisition.status} />
      </div>

      {/* Action feedback */}
      {(actionError || actionSuccess) && (
        <div className={`rounded-lg px-4 py-2 text-sm ${actionError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {actionError || actionSuccess}
          <button onClick={() => { setActionError(''); setActionSuccess(''); }} className="ml-3 font-medium underline text-xs">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">

          {/* Summary */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Summary</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Stat label="Type" value={requisition.requisitionType} />
              <Stat label="Store ID" value={<span className="font-mono text-xs">{requisition.storeId}</span>} />
              <Stat label="Created" value={fmt(requisition.createdAt)} />
              <Stat label="Updated" value={fmt(requisition.updatedAt)} />
              {requisition.remarks && (
                <div className="col-span-2">
                  <Stat label="Remarks" value={requisition.remarks} />
                </div>
              )}
            </dl>
          </section>

          {/* Line Items */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Line Items ({requisition.items.length})</h2>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Required Qty</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Current Stock</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Preferred Vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requisition.items.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No items.</td></tr>
                ) : (
                  requisition.items.map((item, idx) => (
                    <tr key={item.id ?? idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{item.itemName}</td>
                      <td className="px-4 py-2.5 text-center font-mono text-gray-700">{item.requiredQuantity}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`font-mono text-xs font-medium ${item.currentStock < item.requiredQuantity ? 'text-red-600' : 'text-green-600'}`}>
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{item.preferredVendor ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {/* Policy Path Evaluation — only show for Approved requisitions */}
          {(requisition.status === 'Approved' || requisition.status === 'Pending') && (
            <PolicyPathPanel requisitionId={id} />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <ActionsPanel
            requisition={requisition}
            onApprove={handleApprove}
            onReject={handleReject}
            onConvertRfq={() => setShowRfqModal(true)}
            onConvertPO={() => setShowPoModal(true)}
          />

          {actionLoading && (
            <div className="text-xs text-gray-400 text-center">Processing…</div>
          )}

          {/* Quick links */}
          {requisition.status === 'POCreated' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-blue-700">This requisition has been converted.</p>
              <Link href="/admin/inventory/rfq" className="block text-xs text-blue-600 hover:underline">→ View RFQs</Link>
              <Link href="/admin/inventory/po" className="block text-xs text-blue-600 hover:underline">→ View Purchase Orders</Link>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRfqModal && (
        <ConvertToRfqModal
          requisitionId={id}
          onClose={() => setShowRfqModal(false)}
          onSuccess={rfqId => {
            setShowRfqModal(false);
            router.push(`/admin/inventory/rfq/${rfqId}`);
          }}
        />
      )}
      {showPoModal && (
        <ConvertToPOModal
          requisition={requisition}
          onClose={() => setShowPoModal(false)}
          onSuccess={poId => {
            setShowPoModal(false);
            router.push(`/admin/inventory/po/${poId}`);
          }}
        />
      )}
    </div>
  );
}
