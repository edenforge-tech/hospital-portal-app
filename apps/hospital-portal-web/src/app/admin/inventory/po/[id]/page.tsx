'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  purchaseOrderApi,
  inventoryStoreApi,
  PurchaseOrderDto,
  PurchaseOrderItemDto,
  RecordPoReceiptRequest,
  RecordPoReceiptItemLine,
  StoreDto,
} from '@/lib/api/inventory-service.api';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Submitted: 'bg-blue-100 text-blue-700',
  L1Approved: 'bg-indigo-100 text-indigo-700',
  L2Approved: 'bg-violet-100 text-violet-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-600',
  SentToVendor: 'bg-cyan-100 text-cyan-700',
  PartiallyReceived: 'bg-yellow-100 text-yellow-700',
  FullyReceived: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-gray-100 text-gray-500',
  Cancelled: 'bg-red-100 text-red-600',
};

function PoStatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

function Stat({ label, value, subtle }: { label: string; value: React.ReactNode; subtle?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className={`mt-0.5 text-sm ${subtle ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>{value}</dd>
    </div>
  );
}

function fmt(v?: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function fmtDate(v?: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

function fmtCurrency(v?: number | null) {
  if (v == null) return '—';
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

// ─── Record Receipt Panel ──────────────────────────────────────────────────────
function RecordReceiptPanel({ po, onRefresh }: { po: PurchaseOrderDto; onRefresh: () => void }) {
  const poItems = po.items ?? [];
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [storeId, setStoreId] = useState('');
  const [actualDeliveryDate, setActualDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<RecordPoReceiptItemLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    inventoryStoreApi.list().then(setStores).catch(() => {});
  }, []);

  // Initialise receipt lines from PO items when opening
  const handleOpen = () => {
    setLines(
      poItems.map(item => ({
        itemId: item.itemId,
        receivedQty: item.orderedQty - item.receivedQty,
        batchNumber: '',
        expiryDate: undefined,
        mrp: undefined,
        barcode: undefined,
      }))
    );
    setError('');
    setSuccess('');
    setOpen(true);
  };

  const updateLine = (idx: number, patch: Partial<RecordPoReceiptItemLine>) =>
    setLines(prev => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const handleSubmit = async () => {
    if (!storeId) { setError('Please select a store.'); return; }
    const totalQty = lines.reduce((s, l) => s + l.receivedQty, 0);
    if (totalQty <= 0) { setError('Enter a received qty > 0 for at least one item.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const req: RecordPoReceiptRequest = {
        storeId,
        items: lines.filter(l => l.receivedQty > 0),
        actualDeliveryDate: actualDeliveryDate || undefined,
        notes: notes || undefined,
      };
      await purchaseOrderApi.receive(po.id, req);
      setSuccess('Receipt recorded successfully.');
      setOpen(false);
      onRefresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message ?? 'Failed to record receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  const itemName = (item: PurchaseOrderItemDto) =>
    item.item?.itemName ?? item.itemId;

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Record Receipt</h3>
        {!open && (
          <button
            onClick={handleOpen}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
            Record Receipt
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-xs">{success}</div>
      )}

      {open && (
        <div className="space-y-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">{error}</div>
          )}

          {/* Store + date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Receiving Store *</label>
              <select
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400">
                <option value="">— select store —</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Actual Delivery Date</label>
              <input
                type="date"
                value={actualDeliveryDate}
                onChange={e => setActualDeliveryDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>

          {/* Item lines */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-white border-b">
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Item</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Ordered</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Already Rcvd</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600 w-24">Rcv Qty *</th>
                  <th className="px-3 py-2 font-medium text-gray-600 w-28">Batch No</th>
                  <th className="px-3 py-2 font-medium text-gray-600 w-28">Expiry Date</th>
                  <th className="px-3 py-2 font-medium text-gray-600 w-24">MRP (₹)</th>
                </tr>
              </thead>
              <tbody>
                {poItems.map((item, idx) => (
                  <tr key={item.id} className="border-b last:border-0 bg-white hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{itemName(item)}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{item.orderedQty} {item.unit}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{item.receivedQty}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={item.orderedQty}
                        step={1}
                        value={lines[idx]?.receivedQty ?? 0}
                        onChange={e => updateLine(idx, { receivedQty: parseFloat(e.target.value) || 0 })}
                        className="w-full border rounded px-2 py-1 text-right text-sm focus:ring-1 focus:ring-emerald-400" />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="Batch"
                        value={lines[idx]?.batchNumber ?? ''}
                        onChange={e => updateLine(idx, { batchNumber: e.target.value || undefined })}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-emerald-400" />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={lines[idx]?.expiryDate?.slice(0, 10) ?? ''}
                        onChange={e => updateLine(idx, { expiryDate: e.target.value || undefined })}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-emerald-400" />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="MRP"
                        value={lines[idx]?.mrp ?? ''}
                        onChange={e => updateLine(idx, { mrp: parseFloat(e.target.value) || undefined })}
                        className="w-full border rounded px-2 py-1 text-right text-sm focus:ring-1 focus:ring-emerald-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-emerald-400" />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 border text-gray-600 text-sm rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
              {submitting ? 'Saving…' : 'Submit Receipt'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionsPanel({ po, onRefresh }: { po: PurchaseOrderDto; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const run = async (fn: () => Promise<unknown>, successMsg: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await fn();
      setSuccess(successMsg);
      setRemarks('');
      setReason('');
      onRefresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message ?? 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const s = po.poStatus;
  const terminalStatuses = ['Closed', 'Cancelled', 'Rejected', 'FullyReceived'];
  const isTerminal = terminalStatuses.includes(s);

  if (isTerminal && s !== 'FullyReceived') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Actions</h2>
        <p className="text-sm text-gray-400">No actions available — PO is {s}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">Actions</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-xs">{success}</div>
      )}

      {/* Draft → Submit */}
      {s === 'Draft' && (
        <button
          onClick={() => run(() => purchaseOrderApi.submit(po.id), 'PO submitted for approval.')}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
          Submit for Approval
        </button>
      )}

      {/* Submitted → Approve L1 */}
      {s === 'Submitted' && (
        <div className="space-y-2">
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Remarks (optional)"
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={() => run(() => purchaseOrderApi.approveL1(po.id, { remarks }), 'L1 approval granted.')}
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            Approve (L1)
          </button>
        </div>
      )}

      {/* L1Approved → Approve L2 or Reject */}
      {s === 'L1Approved' && (
        <div className="space-y-2">
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Remarks (optional)"
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => run(() => purchaseOrderApi.approveL2(po.id, { remarks }), 'L2 approval granted.')}
              disabled={loading}
              className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50">
              Approve (L2)
            </button>
            <button
              onClick={() => {
                if (!remarks.trim()) { setError('Rejection reason is required'); return; }
                run(() => purchaseOrderApi.reject(po.id, { remarks }), 'PO rejected.');
              }}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Approved → Send to Vendor */}
      {(s === 'Approved' || s === 'L2Approved') && (
        <button
          onClick={() => run(() => purchaseOrderApi.sendToVendor(po.id), 'PO sent to vendor.')}
          disabled={loading}
          className="w-full px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 disabled:opacity-50">
          Send to Vendor
        </button>
      )}

      {/* FullyReceived → Close */}
      {s === 'FullyReceived' && (
        <button
          onClick={() => run(() => purchaseOrderApi.close(po.id), 'PO closed.')}
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50">
          Close PO
        </button>
      )}

      {/* SentToVendor / PartiallyReceived → Record Receipt */}
      {(s === 'SentToVendor' || s === 'PartiallyReceived') && (
        <RecordReceiptPanel po={po} onRefresh={onRefresh} />
      )}

      {/* Cancel — any non-terminal status */}
      {!isTerminal && s !== 'FullyReceived' && (
        <div className="space-y-2 border-t pt-4">
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Cancellation reason *"
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button
            onClick={() => {
              if (!reason.trim()) { setError('Please provide a cancellation reason'); return; }
              run(() => purchaseOrderApi.cancel(po.id, { reason }), 'PO cancelled.');
            }}
            disabled={loading}
            className="w-full px-4 py-2 border border-red-300 bg-white text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50">
            Cancel PO
          </button>
        </div>
      )}
    </div>
  );
}

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [po, setPo] = useState<PurchaseOrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await purchaseOrderApi.get(id);
      setPo(data);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-48">
        <div className="text-sm text-gray-400">Loading purchase order…</div>
      </div>
    );
  }

  if (notFound || !po) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 text-sm">Purchase order not found.</p>
        <Link href="/admin/inventory/po" className="text-blue-600 text-sm hover:underline mt-2 inline-block">← Back to Purchase Orders</Link>
      </div>
    );
  }

  const transitions = po.transitionLogs ?? [];

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/inventory/po" className="text-sm text-blue-600 hover:underline">← Purchase Orders</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 font-mono">{po.poNumber}</h1>
        </div>
        <PoStatusBadge status={po.poStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Summary Card */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Summary</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              <Stat label="PO Date" value={fmtDate(po.poDate)} />
              <Stat label="Vendor" value={po.vendorName || po.vendorId} />
              <Stat label="Source Type" value={
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  po.sourceType === 'Emergency' ? 'bg-red-50 text-red-600' :
                  po.sourceType === 'RFQ' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                }`}>{po.sourceType}</span>
              } />
              <Stat label="Expected Delivery" value={fmtDate(po.expectedDeliveryDate)} />
              <Stat label="Branch" value={po.branchId ?? '—'} subtle />
              <Stat label="Emergency" value={
                po.isEmergency ? (
                  <span className="text-red-600 font-medium">
                    Yes {po.emergencyBypassExpiry ? `(expires ${fmtDate(po.emergencyBypassExpiry)})` : ''}
                  </span>
                ) : 'No'
              } />
            </dl>

            <div className="border-t mt-4 pt-4 grid grid-cols-3 gap-4">
              <Stat label="Total Amount" value={fmtCurrency(po.totalAmount)} />
              <Stat label="GST Amount" value={fmtCurrency(po.gstAmount)} />
              <Stat label="Net Amount" value={
                <span className="text-lg font-bold text-gray-900">{fmtCurrency(po.netAmount)}</span>
              } />
            </div>

            {po.notes && (
              <div className="border-t mt-4 pt-4">
                <dt className="text-xs font-medium text-gray-500">Notes</dt>
                <dd className="text-sm text-gray-700 mt-0.5">{po.notes}</dd>
              </div>
            )}
            {po.terms && (
              <div className="border-t mt-3 pt-3">
                <dt className="text-xs font-medium text-gray-500">Terms</dt>
                <dd className="text-sm text-gray-700 mt-0.5">{po.terms}</dd>
              </div>
            )}
          </section>

          {/* Line Items */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="text-sm font-semibold text-gray-700">Line Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Ordered</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Received</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">GST%</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Req. By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(po.items ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">No line items.</td>
                    </tr>
                  ) : (
                    (po.items ?? []).map((item, idx) => {
                      const received = item.receivedQty ?? 0;
                      const ordered = item.orderedQty ?? 1;
                      const pct = Math.min(100, Math.round((received / ordered) * 100));
                      return (
                        <tr key={item.id ?? idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-2.5 text-gray-700 font-medium">
                            {item.itemName || item.itemId}
                          </td>
                          <td className="px-4 py-2.5 text-center text-gray-700">
                            {item.orderedQty} <span className="text-gray-400 text-xs">{item.unit}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`text-xs font-medium ${pct === 100 ? 'text-emerald-600' : pct > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                {received} / {ordered}
                              </span>
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-yellow-400' : 'bg-gray-200'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-700">{fmtCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-2.5 text-right text-gray-500">{item.gstPercent ?? 0}%</td>
                          <td className="px-4 py-2.5 text-right font-medium text-gray-900">{fmtCurrency(item.totalAmount)}</td>
                          <td className="px-4 py-2.5 text-gray-500 text-xs">{fmtDate(item.requiredBy)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Approval Timeline */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Approval Timeline</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">L1 Approval</h3>
                {po.l1ApprovedAt ? (
                  <>
                    <Stat label="Approved By" value={po.l1ApprovedByUserId ?? '—'} subtle />
                    <Stat label="Date" value={fmt(po.l1ApprovedAt)} />
                    {po.l1Remarks && <Stat label="Remarks" value={po.l1Remarks} subtle />}
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Not yet approved</p>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">L2 Approval</h3>
                {po.l2ApprovedAt ? (
                  <>
                    <Stat label="Approved By" value={po.l2ApprovedByUserId ?? '—'} subtle />
                    <Stat label="Date" value={fmt(po.l2ApprovedAt)} />
                    {po.l2Remarks && <Stat label="Remarks" value={po.l2Remarks} subtle />}
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Not yet approved</p>
                )}
              </div>
            </div>
            {po.rejectedAt && (
              <div className="border-t mt-4 pt-4">
                <h3 className="text-xs font-semibold text-red-600 uppercase mb-2">Rejection</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <Stat label="Rejected At" value={fmt(po.rejectedAt)} />
                  {po.rejectionReason && <Stat label="Reason" value={po.rejectionReason} />}
                </dl>
              </div>
            )}
          </section>

          {/* Transition Log */}
          {transitions.length > 0 && (
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="text-sm font-semibold text-gray-700">Audit Trail</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {transitions.map((t, idx) => (
                  <div key={idx} className="px-5 py-3 flex items-start gap-3">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{t.fromStatus}</span>
                        <span className="mx-1.5 text-gray-400">→</span>
                        <span className="font-medium">{t.toStatus}</span>
                      </p>
                      {t.reason && <p className="text-xs text-gray-500 mt-0.5">{t.reason}</p>}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{fmt(t.transitionedAt)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <ActionsPanel po={po} onRefresh={load} />

          {/* Meta */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">PO Metadata</h2>
            <Stat label="Created" value={fmt(po.createdAt)} subtle />
            <Stat label="Updated" value={fmt(po.updatedAt)} subtle />
            {po.rfqId && <Stat label="RFQ Reference" value={<span className="font-mono text-xs">{po.rfqId}</span>} subtle />}
            {po.requisitionId && <Stat label="Requisition" value={<span className="font-mono text-xs">{po.requisitionId}</span>} subtle />}
          </div>
        </div>
      </div>
    </div>
  );
}
