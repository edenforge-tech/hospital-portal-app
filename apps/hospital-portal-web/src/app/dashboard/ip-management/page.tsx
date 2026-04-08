'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  IndianRupee, Search, AlertTriangle, Clock, Activity,
  CheckCircle2, ArrowRight, Stethoscope, RefreshCw, X,
  TrendingUp, Users, CreditCard, AlertCircle,
} from 'lucide-react';
import {
  ipManagementApi,
  PatientJourneyRowDto,
} from '@/lib/api/ip-management.api';
import { useAuthStore } from '@/lib/auth-store';
import { PatientQuickPanel } from '@/components/ip-management/PatientQuickPanel';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(dt: string | null): string {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function fmtINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
}

function calcAge(dob: string | null, ageOverride: number | null): string {
  if (ageOverride !== null && ageOverride !== undefined) return `${ageOverride}y`;
  if (!dob) return '—';
  return `${Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365))}y`;
}

// ─── Clinical State Display ────────────────────────────────────────────────────

const CLINICAL_DISPLAY: Record<string, {
  label: string; dotColor: string; textColor: string; bgColor: string; icon: React.ReactNode;
}> = {
  Expected:          { label: 'Expected',       dotColor: 'bg-blue-400',    textColor: 'text-blue-700',    bgColor: 'bg-blue-50',    icon: <Clock className="h-3 w-3" /> },
  PreOpInProgress:   { label: 'Pre-Op',         dotColor: 'bg-indigo-400',  textColor: 'text-indigo-700',  bgColor: 'bg-indigo-50',  icon: <Activity className="h-3 w-3" /> },
  Admitted:          { label: 'Admitted',        dotColor: 'bg-teal-500',    textColor: 'text-teal-700',    bgColor: 'bg-teal-50',    icon: <CheckCircle2 className="h-3 w-3" /> },
  ReadyForSurgery:   { label: 'Ready for OT',   dotColor: 'bg-violet-500',  textColor: 'text-violet-700',  bgColor: 'bg-violet-50',  icon: <Stethoscope className="h-3 w-3" /> },
  SentToOT:          { label: 'Sent to OT',     dotColor: 'bg-purple-500',  textColor: 'text-purple-700',  bgColor: 'bg-purple-50',  icon: <ArrowRight className="h-3 w-3" /> },
  InOT:              { label: 'In OT',           dotColor: 'bg-amber-500',   textColor: 'text-amber-700',   bgColor: 'bg-amber-50',   icon: <Activity className="h-3 w-3" /> },
  SurgeryCompleted:  { label: 'Surgery Done',   dotColor: 'bg-green-500',   textColor: 'text-green-700',   bgColor: 'bg-green-50',   icon: <CheckCircle2 className="h-3 w-3" /> },
  PostOpInProgress:  { label: 'Post-Op',        dotColor: 'bg-cyan-500',    textColor: 'text-cyan-700',    bgColor: 'bg-cyan-50',    icon: <Activity className="h-3 w-3" /> },
  ReadyForDischarge: { label: 'Ready for D/C',  dotColor: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: <ArrowRight className="h-3 w-3" /> },
  Discharged:        { label: 'Discharged',      dotColor: 'bg-gray-400',    textColor: 'text-gray-600',    bgColor: 'bg-gray-100',   icon: <CheckCircle2 className="h-3 w-3" /> },
};

function ClinicalBadge({ state }: { state: string }) {
  const cfg = CLINICAL_DISPLAY[state] ?? {
    label: state, dotColor: 'bg-gray-400', textColor: 'text-gray-600', bgColor: 'bg-gray-50', icon: null,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.textColor}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor} shrink-0`} />
      {cfg.label}
    </span>
  );
}

function FinancialBadge({ state }: { state: string }) {
  const styles: Record<string, string> = {
    NotCreated:    'bg-gray-100 text-gray-500',
    Draft:         'bg-slate-100 text-slate-600',
    Estimated:     'bg-blue-50 text-blue-600',
    Confirmed:     'bg-indigo-50 text-indigo-700 font-semibold',
    PartiallyPaid: 'bg-amber-50 text-amber-700',
    Paid:          'bg-green-50 text-green-700 font-semibold',
    Settled:       'bg-teal-50 text-teal-700',
  };
  const labels: Record<string, string> = {
    NotCreated: 'No Bill', Draft: 'Draft', Estimated: 'Estimated',
    Confirmed: 'Confirmed', PartiallyPaid: 'Partial', Paid: 'Paid', Settled: 'Settled',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${styles[state] ?? 'bg-gray-100 text-gray-500'}`}>
      {labels[state] ?? state}
    </span>
  );
}

// ─── Business Status Tabs ─────────────────────────────────────────────────────

type BizTab = 'All' | 'Pending' | 'SurgeryDone' | 'BillPrepared' | 'EmergencyFC' | 'ReadyForUpgrade';

const BIZ_TABS: { key: BizTab; label: string; activeClass: string; dot: string }[] = [
  { key: 'All',             label: 'All',               activeClass: 'bg-gray-800 text-white',   dot: 'bg-gray-400' },
  { key: 'Pending',         label: 'Pending',           activeClass: 'bg-amber-500 text-white',  dot: 'bg-amber-400' },
  { key: 'SurgeryDone',     label: 'Surgery Done',      activeClass: 'bg-green-600 text-white',  dot: 'bg-green-500' },
  { key: 'BillPrepared',    label: 'Bill Prepared',     activeClass: 'bg-blue-600 text-white',   dot: 'bg-blue-500' },
  { key: 'EmergencyFC',     label: 'Emergency FC',      activeClass: 'bg-orange-500 text-white', dot: 'bg-orange-400' },
  { key: 'ReadyForUpgrade', label: 'Ready for Upgrade', activeClass: 'bg-violet-600 text-white', dot: 'bg-violet-400' },
];

function matchesTab(j: PatientJourneyRowDto, tab: BizTab): boolean {
  switch (tab) {
    case 'All':             return true;
    case 'Pending':         return ['NotCreated', 'Draft'].includes(j.financialState);
    case 'SurgeryDone':     return ['SurgeryCompleted', 'PostOpInProgress', 'ReadyForDischarge'].includes(j.clinicalState);
    case 'BillPrepared':    return ['Estimated', 'Confirmed'].includes(j.financialState);
    case 'EmergencyFC':     return j.isEmergencyFc === true;
    case 'ReadyForUpgrade': return j.financialState === 'PartiallyPaid';
    default:                return true;
  }
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-3.5 bg-gray-100 rounded-full animate-pulse"
            style={{ width: `${40 + (i * 13) % 45}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IpManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const branchId = user?.branchId;

  const [journeys, setJourneys] = useState<PatientJourneyRowDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BizTab>('All');
  const [selectedJourney, setSelectedJourney] = useState<PatientJourneyRowDto | null>(null);
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', uhid: '', search: '' });
  const [appliedFilters, setAppliedFilters] = useState({ fromDate: '', toDate: '', uhid: '', search: '' });

  const loadData = useCallback(async (flt?: typeof appliedFilters) => {
    setIsLoading(true);
    try {
      const applied = flt ?? appliedFilters;
      const data = await ipManagementApi.listJourneys({
        branchId,
        fromDate: applied.fromDate || undefined,
        toDate: applied.toDate || undefined,
        uhid: applied.uhid || undefined,
        patientName: applied.search || undefined,
      });
      setJourneys(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  useEffect(() => {
    if (branchId) loadData({ fromDate: '', toDate: '', uhid: '', search: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  function handleSearch() {
    const applied = { ...filters };
    setAppliedFilters(applied);
    loadData(applied);
  }

  function handleClearFilters() {
    const empty = { fromDate: '', toDate: '', uhid: '', search: '' };
    setFilters(empty);
    setAppliedFilters(empty);
    loadData(empty);
  }

  const hasActiveFilters = Object.values(appliedFilters).some(v => v !== '');

  const displayJourneys = useMemo(
    () => journeys.filter(j => matchesTab(j, activeTab)),
    [journeys, activeTab],
  );

  const tabCounts = useMemo(() => {
    const map: Partial<Record<BizTab, number>> = {};
    BIZ_TABS.forEach(({ key }) => {
      map[key] = journeys.filter(j => matchesTab(j, key)).length;
    });
    return map;
  }, [journeys]);

  const kpiStats = useMemo(() => {
    const inHouse = journeys.filter(j => j.clinicalState !== 'Discharged').length;
    const inOT = journeys.filter(j => ['InOT', 'SentToOT'].includes(j.clinicalState)).length;
    const pendingPayment = journeys.filter(j => j.balanceDue > 0).length;
    const totalOutstanding = journeys.reduce((s, j) => s + (j.balanceDue > 0 ? j.balanceDue : 0), 0);
    return { inHouse, inOT, pendingPayment, totalOutstanding };
  }, [journeys]);

  const handleJourneyUpdated = useCallback((updatedFields: Partial<PatientJourneyRowDto>) => {
    setJourneys(prev =>
      prev.map(j => (j.id === selectedJourney?.id ? { ...j, ...updatedFields } : j)),
    );
    setSelectedJourney(prev => (prev ? { ...prev, ...updatedFields } : null));
  }, [selectedJourney]);

  return (
    <div className="space-y-5 pb-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <IndianRupee className="text-white" style={{ height: '18px', width: '18px' }} />
            </span>
            IP Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Financial &amp; administrative tracking for inpatients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => router.push('/dashboard/ip-management/billing')}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <TrendingUp className="h-4 w-4" />
            Billing Dashboard
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="In-House Patients" value={kpiStats.inHouse} sub="Currently admitted"
          icon={<Users className="h-5 w-5 text-blue-600" />} accent="bg-blue-50"
        />
        <KpiCard
          label="In Operation Theatre" value={kpiStats.inOT} sub="Sent to OT / In OT"
          icon={<Activity className="h-5 w-5 text-amber-600" />} accent="bg-amber-50"
        />
        <KpiCard
          label="Payment Pending" value={kpiStats.pendingPayment} sub="Have outstanding balance"
          icon={<AlertCircle className="h-5 w-5 text-red-500" />} accent="bg-red-50"
        />
        <KpiCard
          label="Outstanding Dues" value={fmtINR(kpiStats.totalOutstanding)} sub="Total balance due"
          icon={<CreditCard className="h-5 w-5 text-violet-600" />} accent="bg-violet-50"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">From Date</label>
            <input
              type="date" value={filters.fromDate}
              onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">To Date</label>
            <input
              type="date" value={filters.toDate}
              onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">UHID / MR No</label>
            <input
              type="text" value={filters.uhid}
              onChange={e => setFilters(f => ({ ...f, uhid: e.target.value }))}
              placeholder="Search by MR No…"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-44"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Patient Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text" value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search patient name…"
                className="pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Search className="h-4 w-4" /> Search
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Tab strip */}
        <div className="flex items-center gap-1.5 px-4 pt-4 pb-3 overflow-x-auto border-b border-gray-100">
          {BIZ_TABS.map(({ key, label, activeClass, dot }) => {
            const count = tabCounts[key] ?? 0;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === key
                    ? `${activeClass} shadow-sm`
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    activeTab === key ? 'bg-white/70' : dot
                  }`}
                />
                {label}
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-lg ${
                    activeTab === key ? 'bg-white/20' : 'bg-white text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {!isLoading && displayJourneys.length > 0 && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
            <p className="text-xs text-blue-600">
              Click any row to view patient details and take quick actions
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {[
                  'Clinical Status', '#', 'UHID / MR', 'Patient', 'Procedure',
                  'Admit Time', 'Package', 'Balance', 'Bill Status',
                ].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : displayJourneys.length === 0
                ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Users className="h-10 w-10 opacity-20" />
                        <p className="text-sm font-medium">No patients found</p>
                        <p className="text-xs">Try adjusting your filters or date range</p>
                      </div>
                    </td>
                  </tr>
                )
                : displayJourneys.map((j, idx) => {
                  const isSelected = selectedJourney?.id === j.id;
                  const age = calcAge(j.patientDob, j.patientAge);
                  return (
                    <tr
                      key={j.id}
                      onClick={() => setSelectedJourney(isSelected ? null : j)}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <ClinicalBadge state={j.clinicalState} />
                          {j.isEmergencyFc && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-orange-600 font-medium">
                              <AlertTriangle className="h-2.5 w-2.5" /> Emergency FC
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-blue-700 font-semibold">
                          {j.uhid ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{j.patientName ?? '—'}</p>
                          <p className="text-xs text-gray-400">
                            {age} · {j.patientGender ?? '—'} · {j.admissionType ?? '—'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm text-gray-700">{j.procedureName ?? '—'}</p>
                          {j.eyeOperated && (
                            <p className="text-xs text-gray-400">{j.eyeOperated}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {fmtDateTime(j.admittedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                        {fmtINR(j.packageAmount)}
                      </td>
                      <td className="px-4 py-3.5">
                        {j.balanceDue > 0
                          ? <span className="text-sm font-bold text-red-600">{fmtINR(j.balanceDue)}</span>
                          : <span className="text-sm font-medium text-teal-600">Nil</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <FinancialBadge state={j.financialState} />
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        {!isLoading && displayJourneys.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-700">{displayJourneys.length}</span>{' '}
              of{' '}
              <span className="font-semibold text-gray-700">{journeys.length}</span>{' '}
              patients
              {hasActiveFilters && <span className="text-blue-600"> (filtered)</span>}
            </p>
            <p className="text-xs text-gray-400">Click a row to view details</p>
          </div>
        )}
      </div>

      {/* Right-side Quick Panel */}
      {selectedJourney && (
        <PatientQuickPanel
          journey={selectedJourney}
          onClose={() => setSelectedJourney(null)}
          onJourneyUpdated={handleJourneyUpdated}
        />
      )}
    </div>
  );
}
