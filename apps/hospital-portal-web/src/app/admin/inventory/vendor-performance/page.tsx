'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, TrendingUp, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  inventoryDashboardApi,
  VendorPerformanceSummaryDto,
} from '@/lib/api/inventory-service.api';
import { toast } from 'react-hot-toast';

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function pct(v: number) {
  return `${v.toFixed(1)}%`;
}

function StarRating({ rating }: { rating?: number | null }) {
  if (rating == null) return <span className="text-gray-400 text-xs">â€”</span>;
  const full = Math.floor(rating);
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < full ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
    </span>
  );
}

function RateBadge({ value, good = 80 }: { value: number; good?: number }) {
  const color =
    value >= good ? 'bg-green-100 text-green-700' :
    value >= good * 0.7 ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {pct(value)}
    </span>
  );
}

// â”€â”€â”€ Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PerformanceRow({ vendor, rank }: { vendor: VendorPerformanceSummaryDto; rank: number }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{rank}</td>
      <td className="px-4 py-3">
        <div className="font-semibold text-sm text-gray-900">{vendor.vendorName}</div>
        <div className="text-xs text-gray-400 font-mono">{vendor.vendorId}</div>
      </td>
      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
        {vendor.totalOrders}
      </td>
      <td className="px-4 py-3 text-center">
        <RateBadge value={vendor.onTimeDeliveryRate} good={85} />
      </td>
      <td className="px-4 py-3 text-center">
        <RateBadge value={vendor.avgFulfillmentRate} good={90} />
      </td>
      <td className="px-4 py-3 text-center">
        <StarRating rating={vendor.avgRating} />
      </td>
      <td className="px-4 py-3 text-center">
        {overallScore(vendor)}
      </td>
    </tr>
  );
}

function overallScore(v: VendorPerformanceSummaryDto) {
  // Composite: 50% on-time + 30% fulfillment + 20% rating(normalized)
  const ratingNorm = v.avgRating != null ? (v.avgRating / 5) * 100 : v.onTimeDeliveryRate;
  const score = v.onTimeDeliveryRate * 0.5 + v.avgFulfillmentRate * 0.3 + ratingNorm * 0.2;
  const color =
    score >= 85 ? 'bg-green-100 text-green-700 border border-green-200' :
    score >= 65 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
    'bg-red-100 text-red-700 border border-red-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {score.toFixed(0)}
    </span>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PAGE_SIZE = 20;

export default function VendorPerformancePage() {
  const [rows, setRows] = useState<VendorPerformanceSummaryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryDashboardApi.getVendorPerformance({ page: p, pageSize: PAGE_SIZE });
      setRows(res.items ?? []);
      setTotal(res.totalCount ?? 0);
    } catch (err: unknown) {
      const e = err as { response?: { data?: string }; message?: string };
      setError(e?.response?.data ?? e?.message ?? 'Failed to load vendor performance.');
      toast.error('Failed to load vendor performance.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(page); }, [load, page]);

  const filtered = rows.filter(v =>
    !search.trim() || v.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Summary KPIs
  const avgOnTime = rows.length
    ? rows.reduce((s, v) => s + v.onTimeDeliveryRate, 0) / rows.length
    : 0;
  const avgFulfill = rows.length
    ? rows.reduce((s, v) => s + v.avgFulfillmentRate, 0) / rows.length
    : 0;

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            Vendor Performance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            On-time delivery, fulfillment rates and ratings for all vendors.
          </p>
        </div>
        <button
          onClick={() => load(page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Summary */}
      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total Vendors</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Avg On-Time Delivery</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{pct(avgOnTime)}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Avg Fulfillment Rate</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{pct(avgFulfill)}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search vendorâ€¦"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>
        <span className="text-sm text-gray-500">{total} vendor{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loadingâ€¦</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <TrendingUp className="w-8 h-8 opacity-30" />
            <p className="text-sm">
              {rows.length === 0
                ? 'No performance data available yet. Record PO receipts to start tracking.'
                : 'No vendors match your search.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['#', 'Vendor', 'Total POs', 'On-Time Delivery', 'Fulfillment Rate', 'Avg Rating', 'Score'].map(h => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                          ['#'].includes(h) ? 'text-left' :
                          h === 'Vendor' ? 'text-left' : 'text-center'
                        }`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((v, i) => (
                    <PerformanceRow
                      key={v.vendorId}
                      vendor={v}
                      rank={(page - 1) * PAGE_SIZE + i + 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-white disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-white disabled:opacity-40">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-xl border p-4 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 mb-2">Score Legend</p>
        <div className="flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> â‰¥ 85 â€” Excellent
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> 65â€“84 â€” Good
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> &lt; 65 â€” Needs Improvement
          </span>
        </div>
        <p className="mt-2">Score = 50% on-time + 30% fulfillment + 20% rating (normalized)</p>
      </div>
    </div>
  );
}

