'use client';

/**
 * SurgeryConfirmedTab
 * Left: filterable patient list    Right: 3-tab detail panel (Overview, Checklist, Coordination)
 * "Dept Coordination" card button → selects patient + opens Coordination tab (no overlay)
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  RefreshCw, Search, Scissors, User, Calendar, Clock,
  CheckCircle2, ExternalLink, Building2, AlertCircle, Loader2,
  Send, Eye,
} from 'lucide-react';
import { useSurgeryConfirmed, type SurgeryConfirmedPatient } from '@/hooks/use-surgery-confirmed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { SurgeryConfirmedCard } from './surgery-confirmed/SurgeryConfirmedCard';
import { PreAdmissionChecklist, progressPercent, type ChecklistState } from './surgery-confirmed/PreAdmissionChecklist';
import { InsurancePreAuthWidget } from './surgery-confirmed/InsurancePreAuthWidget';
import { ConsentStatusWidget } from './surgery-confirmed/ConsentStatusWidget';
import { IolStockWidget } from './surgery-confirmed/IolStockWidget';
import { SendDeptRequestModal } from './surgery-confirmed/SendDeptRequestModal';
import { PreAdmissionWorkflow } from './surgery-confirmed/PreAdmissionWorkflow';
import { DeptCoordinationPanel } from './surgery-confirmed/DeptCoordinationPanel';
import { SurgeryOverviewPanel } from './surgery-confirmed/SurgeryOverviewPanel';
import { useGetDeptRequests, type DeptCoordinationDepartment, type DeptRequestStatus } from '@/hooks/use-dept-coordination';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DATE_FILTERS = [
  { value: 'today',    label: 'Today' },
  { value: 'week',     label: 'This Week' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'all',      label: 'All' },
  { value: 'on_hold',  label: 'On Hold' },
] as const;

type DateFilter = 'today' | 'week' | 'upcoming' | 'all' | 'on_hold';
type DetailTab = 'overview' | 'workflow' | 'coordination';

// ── adapter ──────────────────────────────────────────────────────────────────
function toChecklistState(p: SurgeryConfirmedPatient['preAdmissionChecklist']): ChecklistState {
  return {
    biometryDone:        p.preOpTestsDone,
    labsDone:            p.preOpTestsDone,
    ecgDone:             p.preOpTestsDone,
    anesthesiaClearance: p.preOpTestsDone,
    consentSigned:       p.consentSigned,
    paymentConfirmed:    p.financialCleared,
    bedAssigned:         p.bedReserved === true,
    otSlotConfirmed:     p.otSlotConfirmed,
  };
}

export function SurgeryConfirmedTab({
  initialScheduleId,
  initialPanel,
}: {
  initialScheduleId?: string;
  initialPanel?: DetailTab;
}) {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<SurgeryConfirmedPatient | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [workflowInitialStep, setWorkflowInitialStep] = useState<number | undefined>(undefined);

  const { data: patients = [], isLoading, refetch, isFetching } = useSurgeryConfirmed(user?.branchId, dateFilter);

  // Deep-link: auto-select patient + tab when navigated from a notification toast
  useEffect(() => {
    if (!initialScheduleId || isLoading || patients.length === 0) return;
    const match = patients.find(p => p.scheduleId === initialScheduleId);
    if (match) {
      setSelectedPatient(match);
      setActiveTab(initialPanel ?? 'overview');
    }
  }, [initialScheduleId, initialPanel, isLoading, patients]);

  const filtered = patients.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.patientName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      (p.surgeonName ?? '').toLowerCase().includes(q)
    );
  });

  // Checklist update mutation
  const checklistMutation = useMutation({
    mutationFn: async ({ patient, updated }: { patient: SurgeryConfirmedPatient; updated: ChecklistState }) => {
      const api = getApi();
      await api.patch(`/otbooking/schedules/${patient.scheduleId}/checklist`, updated);
    },
    onSuccess: () => {
      toast.success('Checklist updated');
      qc.invalidateQueries({ queryKey: ['surgery-confirmed'] });
    },
    onError: () => toast.error('Failed to update checklist'),
  });

  // No-show mutation
  const noShowMutation = useMutation({
    mutationFn: async ({ patient, action, notes }: { patient: SurgeryConfirmedPatient; action: string; notes: string }) => {
      const api = getApi();
      await api.post(`/otbooking/schedules/${patient.scheduleId}/no-show`, { action, notes });
      // When cancelling, auto-create dept coordination requests for Billing + Admissions
      if (action === 'cancel') {
        const base = {
          patientId: patient.patientId,
          scheduleId: patient.scheduleId,
          ...(patient.sessionId ? { sessionId: patient.sessionId } : {}),
        };
        await Promise.allSettled([
          api.post('/dept-coordination', {
            ...base,
            department: 'Billing',
            requestMessage: 'Surgery cancelled — please process refund if applicable',
          }),
          api.post('/dept-coordination', {
            ...base,
            department: 'Admissions',
            requestMessage: 'Surgery cancelled — please release bed/ward slot',
          }),
        ]);
      }
    },
    onSuccess: (_, { action }) => {
      if (action === 'cancel') {
        toast.success('No-show recorded — Billing & Admissions notified');
      } else {
        toast.success('No-show recorded');
      }
      qc.invalidateQueries({ queryKey: ['surgery-confirmed'] });
      qc.invalidateQueries({ queryKey: ['deptCoordination'] });
    },
    onError: () => toast.error('Failed to record no-show'),
  });

  const handleSelect = useCallback((patient: SurgeryConfirmedPatient) => {
    setSelectedPatient(patient);
    setActiveTab('overview');
  }, []);

  const handleOpenCoordination = useCallback((patient: SurgeryConfirmedPatient) => {
    setSelectedPatient(patient);
    setActiveTab('coordination');
  }, []);

  const handleChecklistChange = useCallback((patient: SurgeryConfirmedPatient, updated: ChecklistState) => {
    checklistMutation.mutate({ patient, updated });
  }, [checklistMutation]);

  const handleNoShow = useCallback((patient: SurgeryConfirmedPatient, action: 'reschedule' | 'hold' | 'cancel', notes: string) => {
    noShowMutation.mutate({ patient, action, notes });
  }, [noShowMutation]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: patient list ──────────────────────────────────────────────── */}
      <div className="w-[380px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
        {/* Controls */}
        <div className="p-3 space-y-2 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient, MRN, surgeon…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {DATE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setDateFilter(f.value)}
                className={cn(
                  'flex-1 text-xs py-1 rounded-md font-medium transition-colors',
                  dateFilter === f.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() => refetch()}
              className="p-1.5 hover:bg-gray-100 rounded-md"
              title="Refresh"
            >
              <RefreshCw className={cn('w-4 h-4 text-gray-500', isFetching && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="px-3 py-1.5 text-xs text-gray-500">
          {isLoading ? 'Loading…' : `${filtered.length} patient${filtered.length !== 1 ? 's' : ''}`}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="text-sm">No confirmed surgeries</p>
              <p className="text-xs mt-1">{dateFilter === 'today' ? 'for today' : `for this ${dateFilter}`}</p>
            </div>
          ) : (
            filtered.map(patient => (
              <SurgeryConfirmedCard
                key={patient.scheduleId}
                patient={patient}
                isSelected={selectedPatient?.scheduleId === patient.scheduleId}
                onSelect={handleSelect}
                onOpenCoordination={handleOpenCoordination}
                onChecklistChange={handleChecklistChange}
                onNoShow={handleNoShow}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right: tabbed detail panel ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {selectedPatient ? (
          <PatientDetailPanel
            patient={selectedPatient}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            workflowInitialStep={workflowInitialStep}
            setWorkflowInitialStep={setWorkflowInitialStep}
            onChecklistChange={(updated) => handleChecklistChange(selectedPatient, updated)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Scissors className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-medium">Select a patient to view details</p>
            <p className="text-xs">Surgery confirmation + pre-admission workup</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right panel: tabbed detail view
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'workflow',     label: 'Pre-Admission Workflow' },
  { id: 'coordination', label: 'Dept Coordination' },
];

function PatientDetailPanel({
  patient,
  activeTab,
  onTabChange,
  workflowInitialStep,
  setWorkflowInitialStep,
  onChecklistChange,
}: {
  patient: SurgeryConfirmedPatient;
  activeTab: DetailTab;
  onTabChange: (t: DetailTab) => void;
  workflowInitialStep?: number;
  setWorkflowInitialStep: (step: number | undefined) => void;
  onChecklistChange: (updated: ChecklistState) => void;
}) {
  const checklist = toChecklistState(patient.preAdmissionChecklist);
  const pct = progressPercent(checklist);

  const daysLabel =
    patient.daysToSurgery > 0
      ? `${patient.daysToSurgery} day${patient.daysToSurgery !== 1 ? 's' : ''} to surgery`
      : patient.daysToSurgery === 0
      ? 'Surgery is Today!'
      : 'Surgery date passed';

  const urgencyColor =
    patient.daysToSurgery < 0  ? 'bg-gray-100 text-gray-600' :
    patient.daysToSurgery === 0 ? 'bg-red-100 text-red-700' :
    patient.daysToSurgery <= 2 ? 'bg-amber-100 text-amber-700' :
    'bg-emerald-100 text-emerald-700';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Patient header ──────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {(patient.patientName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{patient.patientName}</h2>
              <div className="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-gray-500">
                {patient.mrn && <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{patient.mrn}</span>}
                {patient.age && patient.gender && <span>{patient.gender} · {patient.age}y</span>}
                {patient.patientType && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">{patient.patientType}</span>}
              </div>
            </div>
          </div>
          {/* Days badge */}
          <div className={cn('text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 flex items-center gap-1.5', urgencyColor)}>
            <Clock className="w-3.5 h-3.5" />
            {daysLabel}
          </div>
        </div>

        {/* Surgery summary strip */}
        <div className="mt-4 flex flex-wrap gap-3">
          {patient.surgeryType && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
              <Scissors className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{patient.surgeryType}</span>
              {patient.eye && <span className="text-emerald-600 font-semibold">({patient.eye})</span>}
            </div>
          )}
          {patient.surgeonName && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <User className="w-4 h-4 text-gray-500" />
              {patient.surgeonName}
            </div>
          )}
          {patient.theatreName && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Calendar className="w-4 h-4 text-gray-500" />
              {patient.theatreName}
            </div>
          )}
          <div className={cn(
            'flex items-center gap-1.5 text-sm rounded-lg px-3 py-1.5 font-semibold border',
            patient.otStatus === 'Confirmed'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          )}>
            <CheckCircle2 className="w-4 h-4" />
            {patient.otStatus}
          </div>
        </div>

        {/* Readiness bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400')}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap font-medium">{pct}% ready</span>
          <button
            onClick={() => onTabChange('workflow')}
            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
          >
            View workflow →
          </button>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 bg-white px-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'py-2.5 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
            {tab.id === 'workflow' && (
              <span className={cn(
                'ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                pct === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              )}>
                {pct}%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <SurgeryOverviewPanel
            patient={patient}
            onNavigateToWorkflow={(stepNumber) => {
              setWorkflowInitialStep(stepNumber);
              onTabChange('workflow');
            }}
            onNavigateToCoordination={() => onTabChange('coordination')}
          />
        )}
        {activeTab === 'workflow' && <PreAdmissionWorkflow patient={patient} initialStep={workflowInitialStep} />}
        {activeTab === 'coordination' && <DeptCoordinationPanel patient={patient} />}
      </div>
    </div>
  );
}

// ── IOL biometry types ────────────────────────────────────────────────────────
interface BiometryRecord {
  id: string;
  eye: string; // OD | OS
  k1?: number;
  k2?: number;
  axialLength?: number;
  calculatedIol?: number;
  iolFormula?: string;
  measurementDate?: string;
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ patient, onTabChange }: { patient: SurgeryConfirmedPatient; onTabChange: (t: DetailTab) => void }) {
  const { data: biometryRecords } = useQuery<BiometryRecord[]>({
    queryKey: ['biometry', patient.patientId],
    enabled: !!patient.patientId,
    staleTime: 120_000,
    queryFn: async () => {
      const api = getApi();
      try {
        const res = await api.get('/biometry', { params: { patientId: patient.patientId, limit: 2 } });
        const d = res.data;
        return Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : d?.data ?? [];
      } catch {
        return [];
      }
    },
  });

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* Surgery date card */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Surgery Date</p>
        <p className="text-base font-bold text-emerald-900">
          {new Date(patient.surgeryDate).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
        {patient.surgeryTimeSlot && (
          <p className="text-sm text-emerald-700 mt-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {String(patient.surgeryTimeSlot)}
          </p>
        )}
      </div>

      {/* Readiness status cards */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Readiness Status</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { key: 'consentSigned',     label: 'Consent',     done: patient.preAdmissionChecklist?.consentSigned },
            { key: 'financialCleared',  label: 'Payment',     done: patient.preAdmissionChecklist?.financialCleared },
            { key: 'otSlotConfirmed',   label: 'OT Slot',     done: patient.preAdmissionChecklist?.otSlotConfirmed },
            { key: 'bedReserved',       label: 'Bed/Ward',    done: patient.preAdmissionChecklist?.bedReserved },
          ].map(item => (
            <div
              key={item.key}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl border py-3 px-2',
                item.done ? 'bg-green-50 border-green-200' : item.done === null ? 'bg-gray-50 border-gray-150' : 'bg-amber-50 border-amber-200'
              )}
            >
              {item.done
                ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                : item.done === null
                ? <span className="w-5 h-5 rounded-full border-2 border-gray-300 inline-block" />
                : <span className="w-5 h-5 rounded-full border-2 border-amber-400 inline-block" />}
              <span className={cn('text-[11px] font-semibold', item.done ? 'text-green-700' : item.done === null ? 'text-gray-400' : 'text-amber-700')}>
                {item.label}
              </span>
              <span className={cn('text-[9px]', item.done ? 'text-green-600' : item.done === null ? 'text-gray-400' : 'text-amber-600')}>
                {item.done ? 'Done' : item.done === null ? 'N/A' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Consent forms status (spec: in Overview tab) */}
      <ConsentStatusWidget patientId={patient.patientId} />

      {/* Surgery details grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Procedure',    value: patient.surgeryType },
          { label: 'Eye',          value: patient.eye },
          { label: 'Surgeon',      value: patient.surgeonName },
          { label: 'OT Theatre',   value: patient.theatreName },
          { label: 'Status',       value: patient.otStatus },
          { label: 'Patient Type', value: patient.patientType },
          patient.packageAmount
            ? { label: 'Package', value: `₹${patient.packageAmount.toLocaleString('en-IN')}` }
            : null,
        ].filter(Boolean).map(item => item && (
          <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* IOL / Biometry section */}
      {biometryRecords && biometryRecords.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Biometry / IOL
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {biometryRecords.map(record => (
              <div key={record.id} className="border border-gray-200 rounded-xl px-4 py-3 bg-white">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1.5">
                  {record.eye === 'OD' ? 'Right Eye (OD)' : record.eye === 'OS' ? 'Left Eye (OS)' : record.eye}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700">
                  {record.k1 != null && <><span className="text-gray-400">K1</span><span className="font-mono font-semibold">{record.k1.toFixed(2)} D</span></>}
                  {record.k2 != null && <><span className="text-gray-400">K2</span><span className="font-mono font-semibold">{record.k2.toFixed(2)} D</span></>}
                  {record.axialLength != null && <><span className="text-gray-400">Axial</span><span className="font-mono font-semibold">{record.axialLength.toFixed(2)} mm</span></>}
                  {record.calculatedIol != null && (
                    <>
                      <span className="text-gray-400">IOL</span>
                      <span className="font-mono font-bold text-indigo-700">{record.calculatedIol.toFixed(2)} D</span>
                    </>
                  )}
                </div>
                {record.iolFormula && (
                  <p className="mt-1.5 text-[10px] text-gray-400">Formula: {record.iolFormula}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links to other tabs */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={() => onTabChange('checklist')}
          className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Pre-Admission Checklist →
        </button>
        <button
          onClick={() => onTabChange('coordination')}
          className="flex-1 py-2.5 rounded-lg border border-emerald-200 text-sm text-emerald-700 font-medium hover:bg-emerald-50 transition-colors"
        >
          Dept Coordination →
        </button>
      </div>
    </div>
  );
}

// ── Status helpers ────────────────────────────────────────────────────────────

const DEPT_LIST: DeptCoordinationDepartment[] = [
  'Admissions', 'Billing', 'Lab', 'Surgeon', 'Anesthesia',
];

function requestStatusToDisplay(status: DeptRequestStatus): { label: string; cls: string; dotCls: string } {
  switch (status) {
    case 'Completed':  return { label: 'Completed',   cls: 'bg-green-50 border-green-200',  dotCls: 'bg-green-500' };
    case 'InProgress': return { label: 'In Progress', cls: 'bg-blue-50 border-blue-200',    dotCls: 'bg-blue-500 animate-pulse' };
    case 'Sent':       return { label: 'Sent',         cls: 'bg-sky-50 border-sky-200',      dotCls: 'bg-sky-400' };
    case 'Rejected':   return { label: 'Rejected',     cls: 'bg-red-50 border-red-200',      dotCls: 'bg-red-500' };
    case 'Cancelled':  return { label: 'Cancelled',    cls: 'bg-gray-50 border-gray-200',    dotCls: 'bg-gray-300' };
    default:           return { label: 'Pending',      cls: 'bg-amber-50 border-amber-200',  dotCls: 'bg-amber-400' };
  }
}

/** Step 20 — shows how many OT bookings the surgeon already has on the surgery date */
function SurgeonAvailabilityBadge({
  surgeonId,
  surgeryDate,
  currentScheduleId,
}: {
  surgeonId: string;
  surgeryDate: string;
  currentScheduleId: string;
}) {
  const dateStr = surgeryDate.split('T')[0];
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['surgeon-availability', surgeonId, dateStr],
    enabled: !!surgeonId && !!dateStr,
    staleTime: 60_000,
    queryFn: async () => {
      const api = getApi();
      try {
        const res = await api.get('/otbooking/schedules', {
          params: { surgeonId, dateFrom: dateStr, dateTo: dateStr, statuses: 'Booked,Confirmed,InProgress' },
        });
        const list: any[] = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.data ?? [];
        return list;
      } catch {
        return [];
      }
    },
  });

  if (isLoading) return <span className="text-[10px] text-gray-400 animate-pulse">Checking availability…</span>;
  if (!data) return null;

  const others = data.filter(s => s.id !== currentScheduleId && s.scheduleId !== currentScheduleId);
  const count = others.length;

  if (count === 0) {
    return <span className="text-[10px] text-green-600 font-medium">✓ No other bookings this day</span>;
  }
  return (
    <span className={cn(
      'text-[10px] font-medium',
      count >= 3 ? 'text-red-600' : count >= 2 ? 'text-amber-600' : 'text-gray-500'
    )}>
      {count} other booking{count !== 1 ? 's' : ''} this day
    </span>
  );
}

// ── Coordination tab ──────────────────────────────────────────────────────────

function CoordinationTab({
  patient,
  checklist,
  onChecklistChange,
}: {
  patient: SurgeryConfirmedPatient;
  checklist: ChecklistState;
  onChecklistChange: (updated: ChecklistState) => void;
}) {
  const [modalDept, setModalDept] = useState<DeptCoordinationDepartment | null>(null);

  const { data: requests = [], isLoading, refetch, isFetching } = useGetDeptRequests(patient.scheduleId);

  // Latest request per department
  const byDept = DEPT_LIST.reduce<Record<string, typeof requests[0] | undefined>>((acc, dept) => {
    const deptRequests = requests.filter(r => r.department === dept);
    acc[dept] = deptRequests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Department rows */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Department Coordination</h3>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {DEPT_LIST.map(d => <div key={d} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {DEPT_LIST.map(dept => {
              const req = byDept[dept];
              const { label, cls, dotCls } = req
                ? requestStatusToDisplay(req.requestStatus)
                : { label: 'Not contacted', cls: 'bg-gray-50 border-gray-200', dotCls: 'bg-gray-300' };

              return (
                <div
                  key={dept}
                  className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border', cls)}
                >
                  <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', dotCls)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{dept}</p>
                    {req?.requestMessage && (
                      <p className="text-xs text-gray-500 truncate">{req.requestMessage}</p>
                    )}
                    {req?.responseMessage && (
                      <p className="text-xs text-emerald-600 truncate">↩ {req.responseMessage}</p>
                    )}
                    {/* Step 20 — surgeon availability inline */}
                    {dept === 'Surgeon' && patient.surgeonId && (
                      <SurgeonAvailabilityBadge
                        surgeonId={patient.surgeonId}
                        surgeryDate={patient.surgeryDate}
                        currentScheduleId={patient.scheduleId}
                      />
                    )}
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap',
                    req?.requestStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                    req?.requestStatus === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                    req?.requestStatus === 'Sent' ? 'bg-sky-100 text-sky-700' :
                    req?.requestStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                    req ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  )}>
                    {label}
                  </span>
                  <button
                    onClick={() => setModalDept(dept)}
                    className="flex items-center gap-1 text-xs text-emerald-700 font-medium px-2.5 py-1 rounded-lg border border-emerald-300 hover:bg-emerald-50 whitespace-nowrap flex-shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    {req ? 'Re-send' : 'Send'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Checklist summary */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Pre-Admission Checklist</h3>
        <PreAdmissionChecklist checklist={checklist} onChange={onChecklistChange} patientType={patient.patientType} />
      </section>

      {/* Quick nav links */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Navigate To</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'OT Schedule',  href: `/dashboard/ot?patientId=${patient.patientId}` },
            { label: 'Billing',      href: `/dashboard/billing?patientId=${patient.patientId}` },
            { label: 'Admissions',   href: `/dashboard/admissions?patientId=${patient.patientId}` },
            { label: 'Lab Reports',  href: `/dashboard/lab?patientId=${patient.patientId}` },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {link.label}
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </a>
          ))}
        </div>
      </section>

      {/* Send request modal */}
      {modalDept && (
        <SendDeptRequestModal
          isOpen={!!modalDept}
          onClose={() => setModalDept(null)}
          scheduleId={patient.scheduleId}
          sessionId={patient.sessionId}
          patientId={patient.patientId}
          department={modalDept}
          onSuccess={() => toast.success(`Request sent to ${modalDept}`)}
        />
      )}
    </div>
  );
}
