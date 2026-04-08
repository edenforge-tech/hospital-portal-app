'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, IndianRupee, TrendingUp, ArrowDown,
  CreditCard, DollarSign, RefreshCw, ChevronRight,
  AlertCircle, CheckCircle2, Clock, Users,
} from 'lucide-react';
import {
  ipManagementApi,
  PatientJourneyRowDto,
} from '@/lib/api/ip-management.api';
import { useAuthStore } from '@/lib/auth-store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(v: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(v);
}

function fmtDate(dt: string | null): string {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Finance State badge ──────────────────────────────────────────────────────

const FS_STYLE: Record<string, { label: string; cls: string }> = {
  NotCreated:    { label: 'No Bill',   cls: 'bg-gray-100 text-gray-500' },
  Draft:         { label: 'Draft',     cls: 'bg-slate-100 text-slate-600' },
  Estimated:     { label: 'Estimated', cls: 'bg-blue-50 text-blue-600' },
  Confirmed:     { label: 'Confirmed', cls: 'bg-indigo-50 text-indigo-700 font-semibold' },
  PartiallyPaid: { label: 'Partial',   cls: 'bg-amber-50 text-amber-700' },
  Paid:          { label: 'Paid',      cls: 'bg-green-50 text-green-700 font-semibold' },
  Settled:       { label: 'Settled',   cls: 'bg-teal-50 text-teal-700' },
};

function FsBadge({ state }: { state: string }) {
  const s = FS_STYLE[state] ?? { label: state, cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${s.cls}`}>{s.label}</span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, accent, trend }: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; accent: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
          {icon}
        </div>
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
        {trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
      </div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Pipeline Step ────────────────────────────────────────────────────────────

function PipelineStep({ label, count, amount, color }: {
  label: string; count: number; amount: number; color: string;
}) {
  const total = amount;
  return (
    <div className={`flex-1 rounded-xl p-4 border ${color}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{count}</p>
      <p className="text-xs mt-0.5 opacity-70">{fmtINR(total)}</p>
    </div>
  );
}

// ─── Distribution Bar ─────────────────────────────────────────────────────────

function DistributionBar({ segments }: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div className="h-3 bg-gray-100 rounded-full" />;
  return (
    <div className="space-y-2">
      <div className="flex rounded-full overflow-hidden h-3">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={seg.color}
            style={{ width: `${(seg.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`h-2 w-2 rounded-full ${seg.color}`} />
            {seg.label}
            <span className="text-gray-400">({Math.round((seg.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const branchId = user?.branchId;

  const [journeys, setJourneys] = useState<PatientJourneyRowDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'balanceDue' | 'packageAmount' | 'admittedAt'>('balanceDue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [stateFilter, setStateFilter] = useState<string>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ipManagementApi.listJourneys({ branchId });
      setJourneys(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  useEffect(() => {
    if (branchId) loadData();
  }, [branchId, loadData]);

  // ── Aggregates ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = journeys.filter(j => j.clinicalState !== 'Discharged');
    const totalPackage = journeys.reduce((s, j) => s + j.packageAmount, 0);
    const totalPaid = journeys.reduce((s, j) => s + j.totalPaid, 0);
    const totalOutstanding = journeys.reduce((s, j) => s + (j.balanceDue > 0 ? j.balanceDue : 0), 0);

    const byFinancialState = Object.fromEntries(
      ['NotCreated', 'Draft', 'Estimated', 'Confirmed', 'PartiallyPaid', 'Paid', 'Settled'].map(fs => [
        fs,
        { count: journeys.filter(j => j.financialState === fs).length,
          amount: journeys.filter(j => j.financialState === fs).reduce((s, j) => s + j.packageAmount, 0) },
      ]),
    );

    const cashCount   = journeys.filter(j => j.paymentMode?.toLowerCase() === 'cash').length;
    const cardCount   = journeys.filter(j => j.paymentMode?.toLowerCase() === 'card').length;
    const upiCount    = journeys.filter(j => j.paymentMode?.toLowerCase() === 'upi').length;
    const otherCount  = journeys.filter(j => !['cash', 'card', 'upi'].includes(j.paymentMode?.toLowerCase() ?? '')).length;

    return {
      totalPatients: journeys.length,
      activePatients: active.length,
      totalPackage,
      totalPaid,
      totalOutstanding,
      collectionRate: totalPackage > 0 ? Math.round((totalPaid / totalPackage) * 100) : 0,
      byFinancialState,
      paymentModes: { cashCount, cardCount, upiCount, otherCount },
    };
  }, [journeys]);

  // ── Sorted / filtered table data ────────────────────────────────────────────
  const tableData = useMemo(() => {
    let rows = stateFilter ? journeys.filter(j => j.financialState === stateFilter) : journeys;
    rows = [...rows].sort((a, b) => {
      const av = a[sortBy] as number | string;
      const bv = b[sortBy] as number | string;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'desc' ? bv - av : av - bv;
      }
      return sortDir === 'desc'
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
    return rows;
  }, [journeys, sortBy, sortDir, stateFilter]);

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortBy(col); setSortDir('desc'); }
  }

  function SortIcon({ col }: { col: typeof sortBy }) {
    if (sortBy !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>;
  }

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/ip-management')}
            className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <span className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center">
                <IndianRupee className="text-white" style={{ height: '18px', width: '18px' }} />
              </span>
              Billing Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Financial overview across all inpatients</p>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Patients" value={String(stats.totalPatients)} sub={`${stats.activePatients} currently active`}
          icon={<Users className="h-5 w-5 text-blue-600" />} accent="bg-blue-50"
        />
        <KpiCard
          label="Total Package Value" value={fmtINR(stats.totalPackage)} sub="Across all admissions"
          icon={<CreditCard className="h-5 w-5 text-violet-600" />} accent="bg-violet-50"
        />
        <KpiCard
          label="Total Collected" value={fmtINR(stats.totalPaid)}
          sub={`${stats.collectionRate}% collection rate`}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />} accent="bg-emerald-50" trend="up"
        />
        <KpiCard
          label="Outstanding Dues" value={fmtINR(stats.totalOutstanding)} sub="Pending recovery"
          icon={<AlertCircle className="h-5 w-5 text-red-500" />} accent="bg-red-50" trend="down"
        />
      </div>

      {/* Financial Pipeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Financial Pipeline</h2>
        <div className="flex flex-wrap gap-3">
          <PipelineStep
            label="No Bill" count={stats.byFinancialState.NotCreated?.count ?? 0}
            amount={stats.byFinancialState.NotCreated?.amount ?? 0}
            color="border-gray-200 bg-gray-50 text-gray-700"
          />
          <div className="flex items-center text-gray-300">
            <ChevronRight className="h-5 w-5" />
          </div>
          <PipelineStep
            label="Draft" count={stats.byFinancialState.Draft?.count ?? 0}
            amount={stats.byFinancialState.Draft?.amount ?? 0}
            color="border-slate-200 bg-slate-50 text-slate-700"
          />
          <div className="flex items-center text-gray-300">
            <ChevronRight className="h-5 w-5" />
          </div>
          <PipelineStep
            label="Estimated" count={stats.byFinancialState.Estimated?.count ?? 0}
            amount={stats.byFinancialState.Estimated?.amount ?? 0}
            color="border-blue-200 bg-blue-50 text-blue-700"
          />
          <div className="flex items-center text-gray-300">
            <ChevronRight className="h-5 w-5" />
          </div>
          <PipelineStep
            label="Confirmed" count={stats.byFinancialState.Confirmed?.count ?? 0}
            amount={stats.byFinancialState.Confirmed?.amount ?? 0}
            color="border-indigo-200 bg-indigo-50 text-indigo-700"
          />
          <div className="flex items-center text-gray-300">
            <ChevronRight className="h-5 w-5" />
          </div>
          <PipelineStep
            label="Partial" count={stats.byFinancialState.PartiallyPaid?.count ?? 0}
            amount={stats.byFinancialState.PartiallyPaid?.amount ?? 0}
            color="border-amber-200 bg-amber-50 text-amber-700"
          />
          <div className="flex items-center text-gray-300">
            <ChevronRight className="h-5 w-5" />
          </div>
          <PipelineStep
            label="Paid" count={stats.byFinancialState.Paid?.count ?? 0}
            amount={stats.byFinancialState.Paid?.amount ?? 0}
            color="border-green-200 bg-green-50 text-green-700"
          />
          <div className="flex items-center text-gray-300">
            <ChevronRight className="h-5 w-5" />
          </div>
          <PipelineStep
            label="Settled" count={stats.byFinancialState.Settled?.count ?? 0}
            amount={stats.byFinancialState.Settled?.amount ?? 0}
            color="border-teal-200 bg-teal-50 text-teal-700"
          />
        </div>
      </div>

      {/* Payment Mode Distribution */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Payment Mode Distribution</h2>
        <DistributionBar segments={[
          { label: 'Cash',  value: stats.paymentModes.cashCount,  color: 'bg-emerald-400' },
          { label: 'Card',  value: stats.paymentModes.cardCount,  color: 'bg-blue-400' },
          { label: 'UPI',   value: stats.paymentModes.upiCount,   color: 'bg-violet-400' },
          { label: 'Other', value: stats.paymentModes.otherCount, color: 'bg-gray-300' },
        ]} />
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All Patients — Billing Detail</h2>
          <div className="flex items-center gap-2">
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All states</option>
              {Object.keys(FS_STYLE).map(k => (
                <option key={k} value={k}>{FS_STYLE[k].label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">UHID</th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort('admittedAt')}
                >
                  Admitted <SortIcon col="admittedAt" />
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort('packageAmount')}
                >
                  Package <SortIcon col="packageAmount" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid</th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort('balanceDue')}
                >
                  Balance <SortIcon col="balanceDue" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
                : tableData.length === 0
                ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                      No patients found
                    </td>
                  </tr>
                )
                : tableData.map((j, idx) => (
                  <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{j.patientName ?? '—'}</p>
                      <p className="text-xs text-gray-400">{j.procedureName ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-blue-700 font-semibold">{j.uhid ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(j.admittedAt)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                      {fmtINR(j.packageAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-emerald-600 text-right">
                      {fmtINR(j.totalPaid)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {j.balanceDue > 0
                        ? <span className="text-sm font-bold text-red-600">{fmtINR(j.balanceDue)}</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium">
                            <CheckCircle2 className="h-3 w-3" /> Nil
                          </span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <FsBadge state={j.financialState} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/dashboard/ip-management/journey/${j.id}?tab=billing`)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {!isLoading && tableData.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{tableData.length}</span> patients
              {stateFilter ? ` with status "${FS_STYLE[stateFilter]?.label}"` : ''}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>
                Total collected:{' '}
                <span className="font-semibold text-emerald-600">
                  {fmtINR(tableData.reduce((s, j) => s + j.totalPaid, 0))}
                </span>
              </span>
              <span>
                Outstanding:{' '}
                <span className="font-semibold text-red-600">
                  {fmtINR(tableData.reduce((s, j) => s + (j.balanceDue > 0 ? j.balanceDue : 0), 0))}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Outstanding Dues Highlight */}
      {!isLoading && journeys.filter(j => j.balanceDue > 0).length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-800">
              Outstanding Dues — Needs Attention
            </h3>
          </div>
          <div className="space-y-2">
            {journeys
              .filter(j => j.balanceDue > 0)
              .sort((a, b) => b.balanceDue - a.balanceDue)
              .slice(0, 5)
              .map(j => (
                <div
                  key={j.id}
                  className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-red-100"
                >
                  <div>
                    <span className="font-semibold text-sm text-gray-900">{j.patientName ?? '—'}</span>
                    <span className="text-xs text-gray-400 ml-2">{j.uhid ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-red-600">{fmtINR(j.balanceDue)}</span>
                    <button
                      onClick={() => router.push(`/dashboard/ip-management/journey/${j.id}?tab=billing`)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
                    >
                      Collect <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
          {journeys.filter(j => j.balanceDue > 0).length > 5 && (
            <p className="text-xs text-red-500 mt-2 text-center">
              +{journeys.filter(j => j.balanceDue > 0).length - 5} more with outstanding dues
            </p>
          )}
        </div>
      )}

      {/* All patients settled indicator */}
      {!isLoading && journeys.length > 0 && journeys.filter(j => j.balanceDue > 0).length === 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">All dues settled</p>
            <p className="text-xs text-emerald-600">No outstanding balances for current patients</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Clock className="h-5 w-5 text-gray-300 animate-spin mr-2" />
          <span className="text-sm text-gray-400">Loading billing data…</span>
        </div>
      )}
    </div>
  );
}
