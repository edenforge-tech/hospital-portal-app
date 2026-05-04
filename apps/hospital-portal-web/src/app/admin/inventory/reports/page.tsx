'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, X } from 'lucide-react';
import {
  inventoryReportsApi,
  inventoryVendorApi,
  inventoryStoreApi,
  type GstSummaryByRateDto,
  type VendorDto,
  type StoreDto,
  type VendorReconciliationReport,
} from '@/lib/api/inventory-service.api';
import { toast } from 'react-hot-toast';

// ─── GST Summary Tab ──────────────────────────────────────────────────────────
function GstSummaryTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [rows, setRows] = useState<GstSummaryByRateDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGstr3b, setShowGstr3b] = useState(false);
  const [gstr3bData, setGstr3bData] = useState<GstSummaryByRateDto[]>([]);
  const [gstr3bLoading, setGstr3bLoading] = useState(false);

  useEffect(() => {
    inventoryStoreApi.list().then(setStores).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryReportsApi.gstSummary(year, month, storeId || undefined);
      setRows(data);
    } catch (err: any) {
      setError(err?.response?.data ?? err?.message ?? 'Failed to load GST summary.');
      toast.error(err?.response?.data ?? err?.message ?? 'Failed to load GST summary.');
    } finally {
      setLoading(false);
    }
  }, [year, month, storeId]);

  useEffect(() => { load(); }, [load]);

  const openGstr3b = async () => {
    setGstr3bLoading(true);
    setShowGstr3b(true);
    try {
      const res = await inventoryReportsApi.gstr3b(year, month);
      setGstr3bData(res.summary ?? []);
    } catch {
      toast.error('Failed to load GSTR-3B data.');
      setShowGstr3b(false);
    } finally {
      setGstr3bLoading(false);
    }
  };

  const totals = rows.reduce(
    (acc, r) => ({
      taxable: acc.taxable + r.taxableAmount,
      cgst: acc.cgst + r.cgstAmount,
      sgst: acc.sgst + r.sgstAmount,
      igst: acc.igst + r.igstAmount,
      total: acc.total + r.totalGstAmount,
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
  );

  const gstr3bTotals = gstr3bData.reduce(
    (acc, r) => ({
      taxable: acc.taxable + r.taxableAmount,
      cgst: acc.cgst + r.cgstAmount,
      sgst: acc.sgst + r.sgstAmount,
      igst: acc.igst + r.igstAmount,
      total: acc.total + r.totalGstAmount,
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
  );

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (n: number) => `\u20b9${n.toFixed(2)}`;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Year</label>
            <input type="number" className="border rounded px-3 py-2 text-sm w-28"
              value={year} onChange={e => setYear(parseInt(e.target.value) || now.getFullYear())} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Month</label>
            <select className="border rounded px-3 py-2 text-sm w-32"
              value={month} onChange={e => setMonth(parseInt(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Store</label>
            <select className="border rounded px-3 py-2 text-sm w-44"
              value={storeId} onChange={e => setStoreId(e.target.value)}>
              <option value="">All Stores</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
            </select>
          </div>
          <button onClick={load} disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Loading\u2026' : 'Load'}
          </button>
        </div>
        <button onClick={openGstr3b} disabled={gstr3bLoading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <Download size={14} />
          {gstr3bLoading ? 'Loading\u2026' : 'Export GSTR-3B'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* GST Summary Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['GST Rate', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total GST'].map(h => (
                <th key={h} className="text-right px-4 py-3 font-medium text-gray-600 first:text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading\u2026</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No data for selected period.</td></tr>
            ) : rows.map(r => (
              <tr key={r.gstRate} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{r.gstRate}%</td>
                <td className="px-4 py-3 text-right font-mono">{fmt(r.taxableAmount)}</td>
                <td className="px-4 py-3 text-right font-mono">{fmt(r.cgstAmount)}</td>
                <td className="px-4 py-3 text-right font-mono">{fmt(r.sgstAmount)}</td>
                <td className="px-4 py-3 text-right font-mono">{fmt(r.igstAmount)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{fmt(r.totalGstAmount)}</td>
              </tr>
            ))}
            {rows.length > 0 && (
              <tr className="bg-blue-50 font-semibold">
                <td className="px-4 py-3 text-blue-800">Total</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(totals.taxable)}</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(totals.cgst)}</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(totals.sgst)}</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(totals.igst)}</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(totals.total)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* GSTR-3B Modal */}
      {showGstr3b && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                GSTR-3B Report \u2014 {MONTHS[month - 1]} {year}
              </h2>
              <button onClick={() => setShowGstr3b(false)}
                className="p-1 rounded hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-auto flex-1 p-4">
              {gstr3bLoading ? (
                <div className="text-center py-10 text-gray-400">Loading\u2026</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      {['GST Rate', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total GST'].map(h => (
                        <th key={h} className="text-right px-4 py-3 font-medium text-gray-600 first:text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {gstr3bData.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-gray-400">No data for selected period.</td></tr>
                    ) : gstr3bData.map(r => (
                      <tr key={r.gstRate} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.gstRate}%</td>
                        <td className="px-4 py-3 text-right font-mono">{fmt(r.taxableAmount)}</td>
                        <td className="px-4 py-3 text-right font-mono">{fmt(r.cgstAmount)}</td>
                        <td className="px-4 py-3 text-right font-mono">{fmt(r.sgstAmount)}</td>
                        <td className="px-4 py-3 text-right font-mono">{fmt(r.igstAmount)}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">{fmt(r.totalGstAmount)}</td>
                      </tr>
                    ))}
                    {gstr3bData.length > 0 && (
                      <tr className="bg-blue-50 font-semibold">
                        <td className="px-4 py-3 text-blue-800">Total</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(gstr3bTotals.taxable)}</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(gstr3bTotals.cgst)}</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(gstr3bTotals.sgst)}</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(gstr3bTotals.igst)}</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-800">{fmt(gstr3bTotals.total)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={() => setShowGstr3b(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vendor Reconciliation Tab ────────────────────────────────────────────────
function ReconciliationTab() {
  const [vendors, setVendors] = useState<VendorDto[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [report, setReport] = useState<VendorReconciliationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inventoryVendorApi.list(1, 200).then(r => setVendors(r.items)).catch(() => {});
  }, []);

  const load = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryReportsApi.vendorReconciliation(vendorId);
      setReport(data);
    } catch (err: any) {
      setError(err?.response?.data ?? err?.message ?? 'Failed to load reconciliation.');
      toast.error(err?.response?.data ?? err?.message ?? 'Failed to load reconciliation.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => `\u20b9${n.toFixed(2)}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Vendor</label>
          <select className="border rounded px-3 py-2 text-sm w-64"
            value={vendorId} onChange={e => setVendorId(e.target.value)}>
            <option value="">Select vendor\u2026</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <button onClick={load} disabled={!vendorId || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Loading\u2026' : 'Load Report'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {report && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600 font-medium">Total Invoiced</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">{fmt(report.totalInvoiced)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-600 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-green-800 mt-1">{fmt(report.totalPaid)}</p>
            </div>
            <div className={`rounded-xl p-4 ${report.outstandingBalance > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className={`text-sm font-medium ${report.outstandingBalance > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                Outstanding
              </p>
              <p className={`text-2xl font-bold mt-1 ${report.outstandingBalance > 0 ? 'text-red-800' : 'text-gray-700'}`}>
                {fmt(report.outstandingBalance)}
              </p>
            </div>
          </div>

          {/* Ledger */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Type', 'Reference', 'Date', 'Debit (\u20b9)', 'Credit (\u20b9)', 'Balance (\u20b9)', 'Remarks'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.lines.map((l, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium
                        ${l.entryType === 'Invoice' ? 'bg-blue-100 text-blue-700' :
                          l.entryType === 'Payment' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'}`}>
                        {l.entryType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{l.referenceNumber}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(l.entryDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{l.debit > 0 ? fmt(l.debit) : '\u2014'}</td>
                    <td className="px-4 py-3 text-right font-mono text-green-700">{l.credit > 0 ? fmt(l.credit) : '\u2014'}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">{fmt(l.runningBalance)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{l.remarks ?? '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [tab, setTab] = useState<'gst' | 'reconciliation'>('gst');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
        <p className="text-sm text-gray-500 mt-1">GST summary and vendor reconciliation reports</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {([['gst', 'GST Summary'], ['reconciliation', 'Vendor Reconciliation']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'gst' ? <GstSummaryTab /> : <ReconciliationTab />}
    </div>
  );
}
