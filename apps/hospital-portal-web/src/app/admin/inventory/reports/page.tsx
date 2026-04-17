'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import {
  inventoryReportsApi,
  inventoryVendorApi,
  GstSummaryByRateDto,
  VendorDto,
  VendorReconciliationReport,
} from '@/lib/api/inventory-service.api';
import { toast } from 'react-hot-toast';

// â”€â”€â”€ GST Summary Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GstSummaryTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState<GstSummaryByRateDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryReportsApi.gstSummary(year, month);
      setRows(data);
    } catch (err: any) {
      setError(err?.response?.data ?? err?.message ?? 'Failed to load GST summary.');
      toast.error(err?.response?.data ?? err?.message ?? 'Failed to load GST summary.');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

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

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-5">
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
        <button onClick={load} disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Loadingâ€¦' : 'Load'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

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
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loadingâ€¦</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No data for selected period.</td></tr>
            ) : rows.map(r => (
              <tr key={r.gstRate} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{r.gstRate}%</td>
                <td className="px-4 py-3 text-right font-mono">â‚¹{r.taxableAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono">â‚¹{r.cgstAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono">â‚¹{r.sgstAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono">â‚¹{r.igstAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">â‚¹{r.totalGstAmount.toFixed(2)}</td>
              </tr>
            ))}
            {rows.length > 0 && (
              <tr className="bg-blue-50 font-semibold">
                <td className="px-4 py-3 text-blue-800">Total</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">â‚¹{totals.taxable.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">â‚¹{totals.cgst.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">â‚¹{totals.sgst.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">â‚¹{totals.igst.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-blue-800">â‚¹{totals.total.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ Vendor Reconciliation Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Vendor</label>
          <select className="border rounded px-3 py-2 text-sm w-64"
            value={vendorId} onChange={e => setVendorId(e.target.value)}>
            <option value="">Select vendorâ€¦</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <button onClick={load} disabled={!vendorId || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Loadingâ€¦' : 'Load Report'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {report && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600 font-medium">Total Invoiced</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">â‚¹{report.totalInvoiced.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-600 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-green-800 mt-1">â‚¹{report.totalPaid.toFixed(2)}</p>
            </div>
            <div className={`rounded-xl p-4 ${report.outstandingBalance > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className={`text-sm font-medium ${report.outstandingBalance > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                Outstanding
              </p>
              <p className={`text-2xl font-bold mt-1 ${report.outstandingBalance > 0 ? 'text-red-800' : 'text-gray-700'}`}>
                â‚¹{report.outstandingBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Ledger */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Type', 'Reference', 'Date', 'Debit (â‚¹)', 'Credit (â‚¹)', 'Balance (â‚¹)', 'Remarks'].map(h => (
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
                    <td className="px-4 py-3 text-right font-mono">{l.debit > 0 ? `â‚¹${l.debit.toFixed(2)}` : '-'}</td>
                    <td className="px-4 py-3 text-right font-mono text-green-700">{l.credit > 0 ? `â‚¹${l.credit.toFixed(2)}` : '-'}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">â‚¹{l.runningBalance.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{l.remarks ?? '-'}</td>
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

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

