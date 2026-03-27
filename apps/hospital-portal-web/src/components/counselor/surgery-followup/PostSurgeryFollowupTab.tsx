'use client';

/**
 * PostSurgeryFollowupTab
 * Counselor read-only view of completed surgeries + post-op care status.
 *
 * Data:   GET /api/post-op-care/counselor-view?branchId=&days=30
 * Action: POST /api/post-op-care/{postOpScheduleId}/send-instructions
 *         (sends SMS with post-op instructions to patient)
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle2, Circle, AlertCircle, Send, RefreshCw,
  User, Calendar, Pill, FileText, Stethoscope, Eye,
  Phone, ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PostOpVisit {
  id: string;
  visitName: string;
  scheduledDate: string;
  completed: boolean;
  completedDate?: string;
  findings?: string;
  visualAcuity?: string;
  iop?: number;
  complications?: string;
}

interface PostOpMedication {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  adherence: 'good' | 'moderate' | 'poor' | 'unknown';
  lastRefillDate?: string;
}

interface CounselorPostOpViewItem {
  otScheduleId: string;
  scheduleNumber?: string;
  patientId?: string;
  patientName: string;
  patientPhone?: string;
  mrn?: string;
  surgeryType: string;
  eyeOperated?: string;
  surgeryDate: string;
  surgeryCompletedAt?: string;
  outcome?: string;
  complications?: string;
  surgeonName: string;
  daysSinceSurgery: number;
  hasPostOpCare: boolean;
  postOpScheduleId?: string;
  visits: PostOpVisit[];
  medications: PostOpMedication[];
  instructions: string[];
  restrictions: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const ADHERENCE_STYLES: Record<string, string> = {
  good:     'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  poor:     'bg-red-100 text-red-700',
  unknown:  'bg-gray-100 text-gray-500',
};

const EYE_LABELS: Record<string, string> = {
  OD: 'Right (OD)',
  OS: 'Left (OS)',
  OU: 'Both (OU)',
};

function AgeDaysBadge({ days }: { days: number }) {
  const color = days <= 3
    ? 'bg-red-100 text-red-700'
    : days <= 7
    ? 'bg-amber-100 text-amber-700'
    : 'bg-gray-100 text-gray-500';
  return (
    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', color)}>
      {days}d post-op
    </span>
  );
}

// ── Patient Card ───────────────────────────────────────────────────────────────

function PostOpPatientCard({
  item,
  isSelected,
  onSelect,
}: {
  item: CounselorPostOpViewItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const nextVisit = item.visits.find(v => !v.completed);

  return (
    <div
      onClick={onSelect}
      className={cn(
        'border-l-4 bg-white border-b border-gray-100 px-4 py-3 cursor-pointer transition-all hover:bg-gray-50',
        isSelected ? 'border-l-green-600 bg-green-50' : 'border-l-gray-300',
      )}
    >
      {/* Row 1: Days badge + outcome */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <AgeDaysBadge days={item.daysSinceSurgery} />
          {item.eyeOperated && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
              {EYE_LABELS[item.eyeOperated] ?? item.eyeOperated}
            </span>
          )}
          {!item.hasPostOpCare && (
            <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-semibold">
              No post-op plan
            </span>
          )}
        </div>
        {item.outcome && (
          <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">
            {item.outcome}
          </span>
        )}
      </div>

      {/* Row 2: Patient name + MRN */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
          {(item.patientName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{item.patientName}</p>
          <div className="flex items-center gap-1.5">
            {item.mrn && <span className="text-[10px] font-mono bg-gray-100 px-1 rounded text-gray-600">{item.mrn}</span>}
            <span className="text-[10px] text-gray-500 truncate">{item.surgeryType}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Surgeon + next visit */}
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-0.5">
          <User className="w-3 h-3" /> {item.surgeonName}
        </span>
        {nextVisit && (
          <span className="flex items-center gap-0.5 text-blue-600">
            <Calendar className="w-3 h-3" />
            Next: {new Date(nextVisit.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Visit Timeline ─────────────────────────────────────────────────────────────

function VisitTimeline({ visits }: { visits: PostOpVisit[] }) {
  return (
    <div className="space-y-2">
      {visits.map((v, i) => (
        <div key={v.id} className="flex gap-3">
          {/* Connector */}
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2',
              v.completed ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
            )}>
              {v.completed
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                : <Circle className="w-3.5 h-3.5 text-gray-300" />}
            </div>
            {i < visits.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
          </div>

          {/* Content */}
          <div className="flex-1 pb-3">
            <div className="flex items-center justify-between">
              <p className={cn('text-xs font-semibold', v.completed ? 'text-gray-700' : 'text-gray-500')}>
                {v.visitName}
              </p>
              <span className={cn('text-[10px]', v.completed ? 'text-green-600' : 'text-gray-400')}>
                {v.completed && v.completedDate
                  ? `Done ${new Date(v.completedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                  : new Date(v.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            {v.completed && (v.findings || v.visualAcuity || v.iop) && (
              <div className="mt-1 grid grid-cols-3 gap-1">
                {v.visualAcuity && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">VA: {v.visualAcuity}</span>}
                {v.iop != null && <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">IOP: {v.iop} mmHg</span>}
                {v.complications && <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{v.complications}</span>}
              </div>
            )}
            {v.findings && <p className="text-[10px] text-gray-500 mt-0.5 italic">{v.findings}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Medication Adherence ───────────────────────────────────────────────────────

function MedicationList({ medications }: { medications: PostOpMedication[] }) {
  return (
    <div className="space-y-1.5">
      {medications.map(m => (
        <div key={m.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Pill className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{m.medicationName}</p>
            <p className="text-[10px] text-gray-500">{m.dosage} · {m.frequency}</p>
          </div>
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', ADHERENCE_STYLES[m.adherence] ?? ADHERENCE_STYLES.unknown)}>
            {m.adherence}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Detail Panel ───────────────────────────────────────────────────────────────

function PostOpDetailPanel({ item }: { item: CounselorPostOpViewItem }) {
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!item.postOpScheduleId) throw new Error('No post-op care plan exists for this patient yet.');
      if (!item.patientPhone) throw new Error('Patient phone number is not available.');

      const api = getApi();
      await api.post(`/post-op-care/${item.postOpScheduleId}/send-instructions`, {
        patientPhone: item.patientPhone,
      });
    },
    onSuccess: () => {
      setSendSuccess(true);
      setSendError('');
    },
    onError: (err: any) => {
      setSendError(err?.response?.data?.message ?? err?.message ?? 'Failed to send instructions');
    },
  });

  const completedVisits = item.visits.filter(v => v.completed).length;
  const overdueVisits = item.visits.filter(v => !v.completed && new Date(v.scheduledDate) < new Date()).length;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{item.patientName}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {item.mrn && <span className="font-mono">{item.mrn} · </span>}
            {item.surgeryType} · {item.eyeOperated ? (EYE_LABELS[item.eyeOperated] ?? item.eyeOperated) : ''}
          </p>
          {item.scheduleNumber && (
            <p className="text-xs text-gray-400 mt-0.5">Schedule: <span className="font-mono">{item.scheduleNumber}</span></p>
          )}
        </div>

        {/* Send Instructions */}
        <div className="flex flex-col items-end gap-1">
          {sendSuccess ? (
            <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Instructions sent!
            </div>
          ) : (
            <button
              disabled={sendMutation.isPending || !item.hasPostOpCare || !item.patientPhone}
              onClick={() => sendMutation.mutate()}
              title={
                !item.hasPostOpCare ? 'No post-op care plan exists yet'
                : !item.patientPhone ? 'Patient phone not available'
                : 'Send post-op instructions via SMS'
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendMutation.isPending ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Send Instructions
                </>
              )}
            </button>
          )}
          {!item.patientPhone && (
            <p className="text-[10px] text-gray-400">No phone on file</p>
          )}
          {sendError && <p className="text-[10px] text-red-600 max-w-[200px] text-right">{sendError}</p>}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoBlock label="Surgeon" value={item.surgeonName} />
        <InfoBlock label="Surgery Date" value={new Date(item.surgeryDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} />
        <InfoBlock label="Days Post-Op" value={`${item.daysSinceSurgery} days`} />
        <InfoBlock label="Outcome" value={item.outcome} />
        {item.patientPhone && (
          <InfoBlock label="Patient Phone" value={item.patientPhone} icon={<Phone className="w-3 h-3" />} />
        )}
        {item.complications && (
          <InfoBlock label="Complications" value={item.complications} className="col-span-2 bg-red-50 border border-red-100" />
        )}
      </div>

      {/* Visit progress summary */}
      {item.hasPostOpCare && item.visits.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800">Visit Schedule</h3>
            </div>
            <div className="flex gap-2 text-[10px]">
              <span className="text-green-700"><strong>{completedVisits}</strong> done</span>
              <span className="text-gray-400">·</span>
              <span className={overdueVisits > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                {overdueVisits > 0 ? `${overdueVisits} overdue!` : `${item.visits.length - completedVisits} pending`}
              </span>
            </div>
          </div>
          <VisitTimeline visits={item.visits} />
        </div>
      )}

      {/* Medications */}
      {item.hasPostOpCare && item.medications.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">Medications</h3>
          </div>
          <MedicationList medications={item.medications} />
        </div>
      )}

      {/* Instructions */}
      {item.hasPostOpCare && (item.instructions.length > 0 || item.restrictions.length > 0) && (
        <div className="bg-gray-50 rounded-xl p-4">
          <button
            onClick={() => setShowInstructions(v => !v)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800">Instructions &amp; Restrictions</h3>
            </div>
            {showInstructions ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {showInstructions && (
            <div className="mt-3 space-y-3">
              {item.instructions.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Instructions</p>
                  <ol className="space-y-1">
                    {item.instructions.map((inst, i) => (
                      <li key={i} className="text-xs text-gray-700 flex gap-2">
                        <span className="text-gray-400 font-mono">{i + 1}.</span> {inst}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {item.restrictions.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Restrictions</p>
                  <ol className="space-y-1">
                    {item.restrictions.map((r, i) => (
                      <li key={i} className="text-xs text-amber-700 flex gap-2">
                        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" /> {r}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No post-op plan warning */}
      {!item.hasPostOpCare && (
        <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">No post-op care plan</p>
            <p className="text-xs text-orange-600 mt-0.5">
              A post-op care plan hasn't been created for this surgery yet. The clinical team can create one from the Post-Op Care module.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value, icon, className }: { label: string; value?: string | null; icon?: React.ReactNode; className?: string }) {
  if (!value) return null;
  return (
    <div className={cn('bg-gray-50 rounded-lg px-3 py-2', className)}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5 flex items-center gap-1">{icon}{value}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function PostSurgeryFollowupTab() {
  const { user } = useAuthStore();
  const [selected, setSelected] = useState<CounselorPostOpViewItem | null>(null);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isFetching } = useQuery<CounselorPostOpViewItem[]>({
    queryKey: ['post-op-counselor-view', user?.branchId, days],
    queryFn: async () => {
      const api = getApi();
      const params = new URLSearchParams({ days: String(days) });
      if (user?.branchId) params.set('branchId', user.branchId);
      const res = await api.get(`/post-op-care/counselor-view?${params}`);
      return res.data.data ?? res.data;
    },
  });

  const items = data ?? [];
  const filtered = items.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.patientName.toLowerCase().includes(q) ||
      (item.mrn ?? '').toLowerCase().includes(q) ||
      item.surgeryType.toLowerCase().includes(q)
    );
  });

  const overdueCount = items.filter(item =>
    item.visits.some(v => !v.completed && new Date(v.scheduledDate) < new Date())
  ).length;

  return (
    <div className="flex h-full">
      {/* Left: List */}
      <div className="w-[380px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">

        {/* Controls */}
        <div className="p-3 space-y-2 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient, MRN, surgery…"
                className="w-full pl-3 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="text-xs border border-gray-300 rounded-lg py-1.5 px-2 text-gray-600 focus:ring-green-500 focus:border-green-500"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
            <button onClick={() => refetch()} className="p-1.5 hover:bg-gray-100 rounded-md" title="Refresh">
              <RefreshCw className={cn('w-4 h-4 text-gray-500', isFetching && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="px-3 py-2 bg-white border-b border-gray-200">
          <div className="flex gap-3 text-[10px] text-gray-500">
            <span><strong className="text-gray-700">{items.length}</strong> surgeries</span>
            {overdueCount > 0 && (
              <span className="flex items-center gap-0.5 text-red-600 font-semibold">
                <AlertCircle className="w-3 h-3" /> {overdueCount} with overdue visits
              </span>
            )}
          </div>
        </div>

        {/* Count */}
        <div className="px-3 py-1.5 text-xs text-gray-500">
          {isLoading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Stethoscope className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm">No completed surgeries</p>
              <p className="text-xs mt-1">in the selected time period</p>
            </div>
          ) : (
            filtered.map(item => (
              <PostOpPatientCard
                key={item.otScheduleId}
                item={item}
                isSelected={selected?.otScheduleId === item.otScheduleId}
                onSelect={() => setSelected(item)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Detail */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <PostOpDetailPanel item={selected} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Stethoscope className="w-10 h-10 text-gray-300" />
            <p className="text-sm font-medium">Select a patient to view post-op status</p>
            <p className="text-xs text-center max-w-[240px]">
              Counselor read-only view — visit schedules, medications, and send care instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
