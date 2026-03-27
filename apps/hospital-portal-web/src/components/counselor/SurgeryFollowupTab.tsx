'use client';

/**
 * SurgeryFollowupTab
 * Assembles the Surgery Followup view:
 *  - Left: filterable patient list with sub-filters + conversion funnel count
 *  - Right: selected patient's full session detail
 */

import React, { useState } from 'react';
import { RefreshCw, Search, TrendingUp, Scissors, Stethoscope, Phone, Calendar, Zap, AlertCircle, CheckSquare, Square, Send } from 'lucide-react';
import { usePendingDecisions, type PendingDecisionPatient, type FollowupSubFilter } from '@/hooks/use-pending-decisions';
import { useAuthStore } from '@/lib/auth-store';
import { FollowupPatientCard } from './surgery-followup/FollowupPatientCard';
import { TodaysCallbacksWidget } from './surgery-followup/TodaysCallbacksWidget';
import { PostSurgeryFollowupTab } from './surgery-followup/PostSurgeryFollowupTab';
import { useQueryClient } from '@tanstack/react-query';
import { CommunicationLogModal } from './surgery-followup/CommunicationLogModal';
import { CallbackSchedulerModal } from './surgery-followup/CallbackSchedulerModal';
import { QuickSurgeryBookingModal } from './surgery-followup/QuickSurgeryBookingModal';
import { BatchCommunicationModal, type BatchPatient } from './BatchCommunicationModal';
import { getApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const SUB_FILTERS: { value: FollowupSubFilter; label: string; color: string }[] = [
  { value: 'all',       label: 'All',       color: 'bg-gray-600' },
  { value: 'agreed',    label: 'Agreed',    color: 'bg-green-600' },
  { value: 'undecided', label: 'Undecided', color: 'bg-amber-500' },
  { value: 'declined',  label: 'Declined',  color: 'bg-red-600' },
];

export function SurgeryFollowupTab() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [followupView, setFollowupView] = useState<'pre-surgery' | 'post-surgery'>('pre-surgery');
  const [subFilter, setSubFilter] = useState<FollowupSubFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PendingDecisionPatient | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);

  const toggleBatchSelect = (sessionId: string) => {
    setSelectedBatchIds(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const exitMultiSelect = () => {
    setMultiSelectMode(false);
    setSelectedBatchIds(new Set());
  };

  const { data: patients = [], isLoading, refetch, isFetching } = usePendingDecisions(user?.branchId, subFilter);

  const filtered = patients.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.patientName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      (p.reasonsForDelay ?? '').toLowerCase().includes(q)
    );
  });

  // Funnel counts (always from full list)
  const agreedCount   = patients.filter(p => p.patientAgreedToSurgery === true).length;
  const undecidedCount = patients.filter(p => p.patientAgreedToSurgery === undefined).length;
  const declinedCount = patients.filter(p => p.patientAgreedToSurgery === false).length;
  const conversionRate = patients.length > 0
    ? Math.round((agreedCount / patients.length) * 100)
    : 0;

  const handleDelayReasonUpdate = async (sessionId: string, reason: string) => {
    const api = getApi();
    await api.patch(`/counseling/sessions/${sessionId}/delay-reason`, { reason });
    qc.invalidateQueries({ queryKey: ['pending-decisions'] });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Pre / Post sub-tab toggle — spans full width */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={() => setFollowupView('pre-surgery')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors',
            followupView === 'pre-surgery'
              ? 'border-b-2 border-amber-500 text-amber-700 bg-amber-50'
              : 'text-gray-500 hover:bg-gray-50'
          )}
        >
          <Scissors className="w-3.5 h-3.5" /> Pre-Surgery
        </button>
        <button
          onClick={() => setFollowupView('post-surgery')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors',
            followupView === 'post-surgery'
              ? 'border-b-2 border-green-500 text-green-700 bg-green-50'
              : 'text-gray-500 hover:bg-gray-50'
          )}
        >
          <Stethoscope className="w-3.5 h-3.5" /> Post-Surgery
        </button>
      </div>

      {/* Content — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {followupView === 'post-surgery' ? (
          <PostSurgeryFollowupTab />
        ) : (
          <>
            {/* Left: Patient list */}
            <div className="w-[380px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
        {/* Controls */}
        <div className="p-3 space-y-2 border-b border-gray-200 bg-white">
          {/* Search + multi-select toggle */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient, MRN, reason…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => { if (multiSelectMode) { exitMultiSelect(); } else { setMultiSelectMode(true); } }}
              title={multiSelectMode ? 'Exit multi-select' : 'Select multiple patients'}
              className={cn(
                'p-1.5 rounded-md border transition-colors flex-shrink-0',
                multiSelectMode
                  ? 'bg-blue-100 border-blue-400 text-blue-700'
                  : 'border-gray-300 text-gray-500 hover:bg-gray-100'
              )}
            >
              {multiSelectMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>
          </div>

          {/* Sub-filter chips */}
          <div className="flex items-center gap-1.5">
            {SUB_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setSubFilter(f.value)}
                className={cn(
                  'flex-1 text-xs py-1 rounded-md font-medium transition-colors',
                  subFilter === f.value
                    ? `${f.color} text-white`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f.label}
              </button>
            ))}
            <button onClick={() => refetch()} className="p-1.5 hover:bg-gray-100 rounded-md" title="Refresh">
              <RefreshCw className={cn('w-4 h-4 text-gray-500', isFetching && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Conversion funnel summary */}
        <div className="px-3 py-2 bg-white border-b border-gray-200">
          <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
            <TrendingUp className="w-3 h-3" /> Conversion Funnel
          </div>
          <div className="flex gap-2">
            <FunnelPill label="Agreed"    count={agreedCount}    color="bg-green-500" total={patients.length} />
            <FunnelPill label="Undecided" count={undecidedCount} color="bg-amber-400" total={patients.length} />
            <FunnelPill label="Declined"  count={declinedCount}  color="bg-red-500"   total={patients.length} />
          </div>
          <div className="mt-1.5 text-[10px] text-gray-500 text-right">
            Conversion rate: <strong className="text-green-600">{conversionRate}%</strong>
          </div>
        </div>

        {/* Count */}
        <div className="px-3 py-1.5 text-xs text-gray-500">
          {isLoading ? 'Loading…' : `${filtered.length} patient${filtered.length !== 1 ? 's' : ''}`}
        </div>

        {/* Today's callbacks widget */}
        <TodaysCallbacksWidget branchId={user?.branchId} />

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="text-sm">No pending decisions</p>
              <p className="text-xs mt-1">for the selected filter</p>
            </div>
          ) : (
            filtered.map(p => (
              <FollowupPatientCard
                key={p.sessionId}
                patient={p}
                isSelected={!multiSelectMode && selectedPatient?.sessionId === p.sessionId}
                onSelect={multiSelectMode ? () => toggleBatchSelect(p.sessionId) : setSelectedPatient}
                onDelayReasonUpdate={handleDelayReasonUpdate}
                multiSelectMode={multiSelectMode}
                selectedInBatch={selectedBatchIds.has(p.sessionId)}
              />
            ))
          )}
        </div>

        {/* Batch send CTA — visible only in multi-select mode */}
        {multiSelectMode && (
          <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between gap-2">
            <span className="text-xs text-gray-600">
              {selectedBatchIds.size} patient{selectedBatchIds.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={exitMultiSelect}
                className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowBatchModal(true)}
                disabled={selectedBatchIds.size === 0}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
              >
                <Send className="w-3.5 h-3.5" /> Send Batch SMS
              </button>
            </div>
          </div>
        )}
            </div>

            {/* Right: Detail */}
            <div className="flex-1 overflow-y-auto">
              {multiSelectMode ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 px-6 text-center">
                  <CheckSquare className="w-8 h-8 text-blue-400" />
                  <p className="text-sm font-medium text-gray-600">Multi-select mode</p>
                  <p className="text-xs text-gray-400">Select patients on the left, then click <strong>Send Batch SMS</strong></p>
                  <p className="text-xs font-semibold text-blue-600">{selectedBatchIds.size} selected</p>
                </div>
              ) : selectedPatient ? (
                <FollowupPatientDetail patient={selectedPatient} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="text-sm font-medium">Select a patient to view details</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Batch communication modal */}
      {showBatchModal && (
        <BatchCommunicationModal
          patients={filtered
            .filter(p => selectedBatchIds.has(p.sessionId))
            .map(p => ({
              sessionId: p.sessionId,
              patientName: p.patientName,
              patientType: p.patientType,
              phone: p.patientPhone,
            } as BatchPatient))}
          onClose={() => {
            setShowBatchModal(false);
            exitMultiSelect();
          }}
        />
      )}
    </div>
  );
}

function FunnelPill({ label, count, color, total }: { label: string; count: number; color: string; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex-1 bg-gray-50 rounded-md px-2 py-1 text-center">
      <div className="flex items-center justify-center gap-1">
        <span className={cn('inline-block w-2 h-2 rounded-full', color)} />
        <span className="text-[10px] text-gray-500">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-800">{count}</p>
      <p className="text-[10px] text-gray-400">{pct}%</p>
    </div>
  );
}

function FollowupPatientDetail({ patient }: { patient: PendingDecisionPatient }) {
  const [showLogCall, setShowLogCall] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showQuickBook, setShowQuickBook] = useState(false);

  const canConvert = patient.patientAgreedToSurgery === true;
  const isOverdue = patient.daysSinceContact > 7;
  const hasCallback = !!patient.nextCallbackDate;
  const callbackOverdue = hasCallback && new Date(patient.nextCallbackDate!) < new Date();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Patient header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {(patient.patientName || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{patient.patientName}</h2>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {patient.mrn && <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{patient.mrn}</span>}
              {patient.age && patient.gender && <span className="text-xs text-gray-500">{patient.gender} · {patient.age}y</span>}
              {patient.patientType && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">{patient.patientType}</span>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Session: {new Date(patient.sessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        {/* Decision badge */}
        {patient.patientAgreedToSurgery === true && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">Agreed ✓</span>
        )}
        {patient.patientAgreedToSurgery === false && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700 flex-shrink-0">Declined</span>
        )}
        {patient.patientAgreedToSurgery === undefined && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">Undecided</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowLogCall(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Phone className="w-4 h-4" /> Log Call / Contact
        </button>
        <button
          onClick={() => setShowSchedule(true)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Calendar className="w-4 h-4" /> Schedule Callback
        </button>
        {canConvert && (
          <button
            onClick={() => setShowQuickBook(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Zap className="w-4 h-4" /> Convert to Surgery
          </button>
        )}
      </div>

      {/* Overdue warning */}
      {isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            No contact for <strong>{patient.daysSinceContact} days</strong> — overdue for follow-up
          </p>
        </div>
      )}

      {/* Callback status */}
      {hasCallback && (
        <div className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium',
          callbackOverdue ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
        )}>
          <Calendar className="w-4 h-4 flex-shrink-0" />
          {callbackOverdue ? '⚠ Callback overdue: ' : 'Next callback: '}
          <strong>{new Date(patient.nextCallbackDate!).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
        </div>
      )}

      {/* Aging stats */}
      <div className="flex gap-3">
        <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-center border border-gray-100">
          <p className="text-2xl font-bold text-gray-800">{patient.daysSinceSession}</p>
          <p className="text-xs text-gray-500 mt-0.5">days since session</p>
        </div>
        <div className={cn('flex-1 rounded-xl px-4 py-3 text-center border', isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100')}>
          <p className={cn('text-2xl font-bold', isOverdue ? 'text-red-700' : 'text-gray-800')}>{patient.daysSinceContact}</p>
          <p className={cn('text-xs mt-0.5', isOverdue ? 'text-red-500' : 'text-gray-500')}>days since contact</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-center border border-gray-100">
          <p className="text-2xl font-bold text-gray-800">{patient.callbackCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">total callbacks</p>
        </div>
      </div>

      {/* Session details */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Session Details</p>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Recommended Surgery" value={patient.recommendedSurgery} />
          <InfoRow label="Patient Type"        value={patient.patientType} />
          <InfoRow label="Counselor"           value={patient.counselorName} />
          <InfoRow label="Reason for Delay"    value={patient.reasonsForDelay} />
          <InfoRow label="Last Contact"        value={patient.lastContactDate ? new Date(patient.lastContactDate).toLocaleDateString('en-IN') : undefined} />
          <InfoRow label="Next Callback"       value={patient.nextCallbackDate ? new Date(patient.nextCallbackDate).toLocaleDateString('en-IN') : undefined} />
          {patient.attenderName && <InfoRow label="Attender" value={`${patient.attenderName} (${patient.attenderRelation})`} />}
          {patient.packageAmount && <InfoRow label="Package Amount" value={`₹${patient.packageAmount.toLocaleString('en-IN')}`} />}
        </div>
      </div>

      {/* Modals */}
      {showLogCall && (
        <CommunicationLogModal
          sessionId={patient.sessionId}
          patientName={patient.patientName}
          onClose={() => setShowLogCall(false)}
        />
      )}
      {showSchedule && (
        <CallbackSchedulerModal
          sessionId={patient.sessionId}
          patientId={patient.patientId}
          patientName={patient.patientName}
          onClose={() => setShowSchedule(false)}
        />
      )}
      {showQuickBook && canConvert && (
        <QuickSurgeryBookingModal
          sessionId={patient.sessionId}
          patientName={patient.patientName}
          recommendedSurgery={patient.recommendedSurgery}
          onClose={() => setShowQuickBook(false)}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}
