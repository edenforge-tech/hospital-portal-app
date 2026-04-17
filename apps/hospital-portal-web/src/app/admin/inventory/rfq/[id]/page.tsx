'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Send, X, CheckCircle, Award } from 'lucide-react';
import { rfqApi, RfqHeader, VendorQuoteDto, SubmitQuoteRequest } from '@/lib/api/inventory-service.api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// ─── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Published: 'bg-blue-100 text-blue-700',
  ResponseWindowClosed: 'bg-orange-100 text-orange-700',
  EvaluationInProgress: 'bg-purple-100 text-purple-700',
  Awarded: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-100 text-gray-500',
  Cancelled: 'bg-red-100 text-red-600',
};

function RfqStatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

// ─── Quote Status Badge ────────────────────────────────────────────────────────
const QUOTE_COLORS: Record<string, string> = {
  Submitted: 'bg-blue-50 text-blue-700',
  UnderReview: 'bg-yellow-50 text-yellow-700',
  Shortlisted: 'bg-purple-50 text-purple-700',
  Awarded: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-600',
};

// ─── Actions Panel ─────────────────────────────────────────────────────────────
function ActionsPanel({ rfq, onRefresh }: { rfq: RfqHeader; onRefresh: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [awardVendorId, setAwardVendorId] = useState('');

  async function doAction(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try { await action(); onRefresh(); }
    catch (e: unknown) { setError((e as Error).message || 'Action failed.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Actions</h3>
      {error && <p className="text-xs text-red-600 bg-red-50 rounded p-2">{error}</p>}

      {rfq.rfqStatus === 'Draft' && (
        <button onClick={() => doAction(() => rfqApi.publish(rfq.id))} disabled={busy}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          <Send className="w-4 h-4" /> Publish RFQ
        </button>
      )}
      {rfq.rfqStatus === 'Published' && (
        <button onClick={() => doAction(() => rfqApi.closeResponseWindow(rfq.id))} disabled={busy}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50">
          Close Response Window
        </button>
      )}
      {rfq.rfqStatus === 'EvaluationInProgress' && (
        <div className="space-y-2">
          <input value={awardVendorId} onChange={e => setAwardVendorId(e.target.value)}
            placeholder="Vendor ID to award" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
          <button onClick={() => doAction(() => rfqApi.award(rfq.id, awardVendorId))} disabled={busy || !awardVendorId}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
            <Award className="w-4 h-4" /> Award RFQ
          </button>
        </div>
      )}
      {!['Cancelled', 'Closed', 'Awarded'].includes(rfq.rfqStatus) && (
        <button onClick={() => { const r = prompt('Cancellation reason?'); if (r) doAction(() => rfqApi.cancel(rfq.id, r)); }} disabled={busy}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50">
          <X className="w-4 h-4" /> Cancel RFQ
        </button>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RfqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [rfq, setRfq] = useState<RfqHeader | null>(null);
  const [quotes, setQuotes] = useState<VendorQuoteDto[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [r, q] = await Promise.all([rfqApi.get(id), rfqApi.getQuotes(id)]);
      setRfq(r);
      setQuotes(q);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (!rfq) {
    return <div className="min-h-screen bg-gray-50 p-6"><p className="text-gray-500">RFQ not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/inventory/rfq" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> RFQs
        </Link>
        <ChevronSeparator />
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-gray-900">{rfq.rfqNumber}</span>
          <RfqStatusBadge status={rfq.rfqStatus} />
        </div>
        <button onClick={load} className="ml-auto flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-3">{rfq.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Stat label="Status" value={<RfqStatusBadge status={rfq.rfqStatus} />} />
              <Stat label="Published" value={rfq.publishedAt ? new Date(rfq.publishedAt).toLocaleDateString() : '—'} />
              <Stat label="Response deadline" value={rfq.responseDeadline ? new Date(rfq.responseDeadline).toLocaleDateString() : '—'} />
              {rfq.awardedAt && <Stat label="Awarded" value={new Date(rfq.awardedAt).toLocaleDateString()} />}
              {rfq.cancellationReason && <Stat label="Cancellation reason" value={rfq.cancellationReason} className="col-span-2" />}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Requested Items ({rfq.items?.length ?? 0})</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Item</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Specs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(rfq.items ?? []).map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-gray-900">{item.item?.itemName ?? item.itemId}</td>
                    <td className="px-4 py-2 text-right text-gray-700">{item.requestedQty}</td>
                    <td className="px-4 py-2 text-gray-600">{item.unit}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{item.specifications ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vendor Invites */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Vendor Invites ({rfq.vendorInvites?.length ?? 0})</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Vendor</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Invited</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Responded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(rfq.vendorInvites ?? []).map(inv => (
                  <tr key={inv.id}>
                    <td className="px-4 py-2 text-gray-900">{inv.vendor?.vendorName ?? inv.vendorId}</td>
                    <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{inv.inviteStatus}</span></td>
                    <td className="px-4 py-2 text-gray-500">{new Date(inv.invitedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-gray-500">{inv.respondedAt ? new Date(inv.respondedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quotes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Vendor Quotes ({quotes.length})</h3>
            </div>
            {quotes.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No quotes received yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Quote #</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Vendor</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Total (₹)</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quotes.map(q => (
                    <tr key={q.id} className={q.quoteStatus === 'Awarded' ? 'bg-green-50' : ''}>
                      <td className="px-4 py-2 font-mono text-xs text-gray-700">{q.quoteNumber}</td>
                      <td className="px-4 py-2 text-gray-900">{q.vendor?.vendorName ?? q.vendorId}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">₹{q.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${QUOTE_COLORS[q.quoteStatus] ?? 'bg-gray-100 text-gray-600'}`}>{q.quoteStatus}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div>
          <ActionsPanel rfq={rfq} onRefresh={load} />
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Stat({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function ChevronSeparator() {
  return <span className="text-gray-300 text-sm">›</span>;
}
