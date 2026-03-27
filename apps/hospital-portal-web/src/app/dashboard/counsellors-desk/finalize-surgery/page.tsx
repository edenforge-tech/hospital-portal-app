'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MoreVertical, ClipboardList, Lock, AlertCircle, X, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { counsellorsDeskApi } from '@/lib/api/counsellors-desk.api';
import { StatusBadge } from '@/components/counsellors-desk/StatusBadge';
import { FinalizeOtModal } from '@/components/counsellors-desk/FinalizeOtModal';
import type {
  FinalizeSurgeryRecord,
  FinalizeStatus,
  PrepareOtListItem,
} from '@/types/counsellors-desk';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'All',          label: 'All' },
  { key: 'NotConfirmed', label: 'Not Confirmed' },
  { key: 'Confirmed',    label: 'Confirmed' },
  { key: 'Finalised',    label: 'Finalised' },
  { key: 'OTPrepared',   label: 'OT Prepared' },
  { key: 'Cancelled',    label: 'Cancelled' },
  { key: 'SurgeryDone',  label: 'Surgery Done' },
];

type ActionKey = 'confirm' | 'finalise' | 'cancel' | 'reopen';

interface MenuOption { key: ActionKey; label: string; colorCls: string }

function getMenuOptions(status: FinalizeStatus): MenuOption[] {
  switch (status) {
    case 'NotConfirmed': return [
      { key: 'confirm',  label: 'Confirm',     colorCls: 'text-blue-700 hover:bg-blue-50' },
      { key: 'cancel',   label: 'Cancel',      colorCls: 'text-red-600 hover:bg-red-50' },
    ];
    case 'Confirmed': return [
      { key: 'finalise', label: 'Finalise',    colorCls: 'text-indigo-700 hover:bg-indigo-50' },
      { key: 'cancel',   label: 'Cancel',      colorCls: 'text-red-600 hover:bg-red-50' },
    ];
    case 'Finalised': return [
      { key: 'cancel',   label: 'Cancel',      colorCls: 'text-red-600 hover:bg-red-50' },
    ];
    case 'OTPrepared': return [
      { key: 'reopen',   label: 'Reopen Case', colorCls: 'text-amber-700 hover:bg-amber-50' },
    ];
    default: return [];
  }
}

// ─── Three-dot ActionMenu (status-aware) ──────────────────────────────────────

function ActionMenu({
  status,
  onAction,
}: {
  status: FinalizeStatus;
  onAction: (action: ActionKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = getMenuOptions(status);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (options.length === 0) return <span className="text-gray-300 px-2">—</span>;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-0 top-8 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
          {options.map(({ key, label, colorCls }) => (
            <button
              key={key}
              onClick={(e) => { e.stopPropagation(); setOpen(false); onAction(key); }}
              className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${colorCls}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Prepare OT List Modal ────────────────────────────────────────────────────

interface PrepareModalProps {
  finalisedRecords: FinalizeSurgeryRecord[];
  onClose: () => void;
  onSubmit: (items: PrepareOtListItem[]) => Promise<void>;
}

function PrepareOtListModal({ finalisedRecords, onClose, onSubmit }: PrepareModalProps) {
  const [sequences, setSequences] = useState<Record<string, string>>(
    Object.fromEntries(finalisedRecords.map((r, i) => [r.id, String(i + 1)]))
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const items: PrepareOtListItem[] = finalisedRecords.map(r => ({
      scheduleId: r.id,
      sequence: parseInt(sequences[r.id] ?? '0', 10) || 0,
    }));

    const hasDuplicates = items.some(
      (a, i) => items.slice(i + 1).some(b => b.sequence === a.sequence && a.sequence !== 0)
    );
    if (hasDuplicates) {
      toast.error('Duplicate sequence numbers — each row must have a unique number.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(items);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Prepare OT List</h3>
            <p className="text-xs text-gray-500 mt-0.5">Assign sequence numbers. Records will be locked once submitted.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-96 px-6 py-4">
          {finalisedRecords.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No Finalised records found for this date.</p>
              <p className="text-xs mt-1 text-gray-400">Apply a date filter or finalise some records first.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 text-left font-semibold w-20">Seq #</th>
                  <th className="pb-2 text-left font-semibold">Patient</th>
                  <th className="pb-2 text-left font-semibold">Surgery</th>
                  <th className="pb-2 text-left font-semibold">Start Time</th>
                  <th className="pb-2 text-left font-semibold">Surgeon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {finalisedRecords.map(r => (
                  <tr key={r.id}>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={1}
                        value={sequences[r.id] ?? ''}
                        onChange={e => setSequences(s => ({ ...s, [r.id]: e.target.value }))}
                        className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <p className="font-medium text-gray-900">{r.patientName}</p>
                      <p className="text-xs text-gray-500 font-mono">{r.uhid}</p>
                    </td>
                    <td className="py-2 pr-3 text-gray-700">{r.surgeryName}</td>
                    <td className="py-2 pr-3 text-gray-600 text-xs whitespace-nowrap">{r.startTime || '—'}</td>
                    <td className="py-2 text-gray-600 text-xs">{r.surgeon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || finalisedRecords.length === 0}
            className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            Lock & Prepare
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: `${40 + (i * 13) % 45}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinalizeSurgeryPage() {
  const [records, setRecords] = useState<FinalizeSurgeryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [filters, setFilters] = useState({ date: '', uhid: '', name: '' });
  const [appliedFilters, setAppliedFilters] = useState({ date: '', uhid: '', name: '' });

  // Finalize OT detail modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Prepare OT List modal
  const [prepareModalOpen, setPrepareModalOpen] = useState(false);
  const [prepareDate, setPrepareDate] = useState('');

  // Locked OT list (bottom section)
  const [otListDate, setOtListDate] = useState('');
  const [otList, setOtList] = useState<FinalizeSurgeryRecord[]>([]);
  const [otLoading, setOtLoading] = useState(false);

  const fetchRecords = async (f = appliedFilters) => {
    setIsLoading(true);
    try {
      const data = await counsellorsDeskApi.getFinalizeList({
        date: f.date || undefined,
        uhid: f.uhid || undefined,
        name: f.name || undefined,
      });
      setRecords(data);
    } catch {
      toast.error('Failed to load finalize list');
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRecords(); }, []);

  const handleSearch = () => {
    setAppliedFilters(filters);
    fetchRecords(filters);
  };

  const filtered = useMemo(() => {
    if (activeTab === 'All') return records;
    return records.filter(r => r.status === activeTab);
  }, [records, activeTab]);

  const tabCounts = useMemo(() => {
    const map: Record<string, number> = { All: records.length };
    STATUS_TABS.slice(1).forEach(({ key }) => {
      map[key] = records.filter(r => r.status === key).length;
    });
    return map;
  }, [records]);

  const finalisedForDate = useMemo(() => {
    const base = records.filter(r => r.status === 'Finalised');
    if (!prepareDate) return base;
    return base.filter(r => r.startTime?.startsWith(prepareDate));
  }, [records, prepareDate]);

  const handleAction = async (action: ActionKey, rec: FinalizeSurgeryRecord) => {
    const patch = (p: Partial<FinalizeSurgeryRecord>) =>
      setRecords(rs => rs.map(r => r.id === rec.id ? { ...r, ...p } : r));

    try {
      if (action === 'confirm') {
        const u = await counsellorsDeskApi.confirmOtSchedule(rec.id);
        patch({ status: u.status, version: u.version });
        toast.success(`${rec.patientName} confirmed`);
      } else if (action === 'finalise') {
        const u = await counsellorsDeskApi.finaliseOtSchedule(rec.id);
        patch({ status: u.status, version: u.version });
        toast.success(`${rec.patientName} finalised`);
      } else if (action === 'cancel') {
        const u = await counsellorsDeskApi.cancelOtSchedule(rec.id);
        patch({ status: u.status, version: u.version });
        toast.success(`${rec.patientName} cancelled — counselling session re-queued`);
      } else if (action === 'reopen') {
        const u = await counsellorsDeskApi.reopenOtCase(rec.id);
        patch({ status: u.status, version: u.version, isLocked: false });
        // Refresh OT list if loaded
        if (otList.find(r => r.id === rec.id)) {
          setOtList(l => l.filter(r => r.id !== rec.id));
        }
        toast.success(`${rec.patientName} reopened for editing`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleSubmitPrepareOtList = async (items: PrepareOtListItem[]) => {
    await counsellorsDeskApi.submitPrepareOtList({
      date: prepareDate || new Date().toISOString().slice(0, 10),
      items,
    });
    toast.success('OT list locked and prepared');
    setPrepareModalOpen(false);
    await fetchRecords();
  };

  const handleLoadOtList = async () => {
    setOtLoading(true);
    try {
      const data = await counsellorsDeskApi.getOtList(
        otListDate || new Date().toISOString().slice(0, 10)
      );
      setOtList(data);
    } catch {
      toast.error('Failed to load OT list');
    } finally {
      setOtLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FinalizeOtModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        scheduleId={selectedId}
        onStatusChange={(updated) => {
          setRecords((rs) => rs.map((r) => r.id === updated.id ? { ...r, ...updated } : r));
          setModalOpen(false);
        }}
      />
      {prepareModalOpen && (
        <PrepareOtListModal
          finalisedRecords={finalisedForDate}
          onClose={() => setPrepareModalOpen(false)}
          onSubmit={handleSubmitPrepareOtList}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <button
          disabled={(tabCounts['Finalised'] ?? 0) === 0}
          title={(tabCounts['Finalised'] ?? 0) === 0 ? 'No Finalised records — finalise some records first' : 'Prepare OT List'}
          onClick={() => { setPrepareDate(filters.date); setPrepareModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <ClipboardList className="h-4 w-4" />
          Prepare OT List
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Schedule Date</label>
            <input type="date" value={filters.date}
              onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">UHID</label>
            <input type="text" placeholder="Search UHID…" value={filters.uhid}
              onChange={e => setFilters(f => ({ ...f, uhid: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Patient Name</label>
            <input type="text" placeholder="Search name…" value={filters.name}
              onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={handleSearch}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Search className="h-4 w-4" />Search
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center px-4 pt-4 pb-0 overflow-x-auto gap-1">
          {STATUS_TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap border-b-2 transition-colors
                ${activeTab === key ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {tabCounts[key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">UHID</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Surgery</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Eyes</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Surgeon</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Time</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Theatre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
                : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-gray-400">
                      <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No records found</p>
                    </td>
                  </tr>
                ) : filtered.map(rec => (
                  <tr
                    key={rec.id}
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${rec.isLocked ? 'bg-indigo-50/30' : ''}`}
                    onClick={() => { setSelectedId(rec.id); setModalOpen(true); }}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={rec.status} size="sm" />
                        {rec.isLocked && (
                          <span title="Record locked — use Reopen to edit">
                            <Lock className="h-3 w-3 text-indigo-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-blue-700 font-medium">{rec.uhid}</td>
                    <td className="px-3 py-3 font-medium text-gray-900">{rec.patientName}</td>
                    <td className="px-3 py-3 text-gray-700">{rec.surgeryName}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{rec.eyes}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{rec.patientType}</td>
                    <td className="px-3 py-3 text-gray-700 text-xs">{rec.surgeon}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{rec.startTime || '—'}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{rec.theaterName}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium">{filtered.length}</span> of{' '}
              <span className="font-medium">{records.length}</span> records
            </p>
          </div>
        )}
      </div>

      {/* ── Locked OT List Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-500" />
            Prepared OT List
          </h2>
          {otList.length > 0 && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-end gap-3 mb-4 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" value={otListDate}
                onChange={e => setOtListDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={handleLoadOtList} disabled={otLoading}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {otLoading ? (
                <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>Loading…</>
              ) : (
                <><ClipboardList className="h-4 w-4" />Load OT List</>
              )}
            </button>
            <button
              onClick={() => { setPrepareDate(otListDate); setPrepareModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 border border-indigo-300 text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
            >
              + Prepare New List
            </button>
          </div>

          {otList.length === 0 && !otLoading ? (
            <div className="py-10 text-center text-gray-400">
              <ClipboardList className="h-7 w-7 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a date and click "Load OT List" to view the locked schedule.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-indigo-50 text-indigo-700">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold">#</th>
                    <th className="px-3 py-2.5 text-left font-semibold">UHID</th>
                    <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Patient Name</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Surgery</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Eyes</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Surgeon</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Theatre</th>
                    <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Start Time</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Type</th>
                    <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Prepared At</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {otList.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="px-3 py-2.5 text-indigo-600 font-bold">{row.sequenceNo ?? idx + 1}</td>
                      <td className="px-3 py-2.5 font-mono text-blue-700 font-medium">{row.uhid}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">{row.patientName}</td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.surgeryName}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">{row.eyes}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.surgeon}</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.theaterName}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.startTime || '—'}</td>
                      <td className="px-3 py-2.5 text-gray-500">{row.patientType}</td>
                      <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">
                        {row.preparedAt ? new Date(row.preparedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => handleAction('reopen', row)}
                          className="px-2 py-1 text-amber-700 border border-amber-300 hover:bg-amber-50 rounded-lg text-xs font-medium transition-colors"
                        >
                          Reopen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
