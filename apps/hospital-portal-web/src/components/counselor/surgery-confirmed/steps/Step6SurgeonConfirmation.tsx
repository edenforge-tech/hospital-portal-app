'use client';

/**
 * Step6SurgeonConfirmation
 * S6-1: Track A — live dept request timeline for Surgeon dept
 * S6-2: Track A — "Send Reminder" to Surgeon dept
 * S6-3: Track B — manual confirmation (confirmedBy, confirmedAt, notes)
 * S6-4: SurgeonAvailabilityBadge — same-day booking count
 * S6-5: Step complete logic — Track A Completed OR Track B manual check
 */

import React, { useState } from 'react';
import {
  CheckCircle2, Circle, UserCheck, AlertTriangle,
  RefreshCw, UserPlus, ShieldAlert, FileText, Send,
  Loader2, Clock, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';
import { useGetDeptRequests, useSendDeptRequest, type DeptCoordinationRequestDto } from '@/hooks/use-dept-coordination';
import type { WorkflowStepItem } from '@/hooks/use-pre-admission-workflow';

type SurgeonStatus = 'pending' | 'confirmed' | 'rejected' | 'no_response';

interface SurgeonOption {
  id: string;
  name: string;
  specialization?: string;
}

interface Props {
  scheduleId: string;
  surgeonId?: string;
  surgeonName?: string;
  surgeryDate?: string;
  patientName?: string;
  branchId?: string;
  surgeonStatus?: SurgeonStatus;
  items: WorkflowStepItem[];
  onMarkItem: (itemId: string, isComplete: boolean, notes?: string) => void;
  onReschedule?: () => void;
  onRequestAlternateSurgeon?: () => void;
  onOverride?: (reason: string) => void;
  onSendDeptRequest?: (dept: string, message: string) => void;
  isMutating?: boolean;
}

const surgeonStatusConfig: Record<SurgeonStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending:     { label: 'Awaiting Confirmation', className: 'bg-amber-100 text-amber-700',  icon: <RefreshCw className="w-3.5 h-3.5" /> },
  confirmed:   { label: 'Confirmed',             className: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  rejected:    { label: 'Rejected',              className: 'bg-red-100 text-red-700',      icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  no_response: { label: 'No Response',           className: 'bg-gray-100 text-gray-600',    icon: <RefreshCw className="w-3.5 h-3.5" /> },
};

// ── S6-4: Surgeon availability badge ─────────────────────────────────────────
function SurgeonAvailabilityBadge({ surgeonId, surgeryDate }: { surgeonId?: string; surgeryDate?: string }) {
  const { data } = useQuery<{ items?: unknown[]; total?: number }>({
    queryKey: ['surgeon-bookings', surgeonId, surgeryDate],
    enabled: !!(surgeonId && surgeryDate),
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/otbooking/schedules', { params: { surgeonId, date: surgeryDate } });
      return res.data;
    },
  });

  const count = data ? (Array.isArray(data) ? data.length : data.total ?? 0) : null;

  if (count === null) return null;

  return (
    <span
      className={cn(
        'flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
        count >= 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      )}
    >
      <Calendar className="w-3 h-3" />
      {count >= 3 ? `⚠ ${count} bookings today` : 'Available'}
    </span>
  );
}

// ── Track A: dept request timeline ────────────────────────────────────────────
function DeptRequestTimeline({ requests }: { requests: DeptCoordinationRequestDto[] }) {
  if (requests.length === 0) {
    return <p className="text-xs text-gray-400 py-2">No dept requests sent yet.</p>;
  }

  return (
    <div className="space-y-2">
      {requests.map((req) => (
        <div key={req.id} className={cn(
          'border rounded-lg px-3 py-2 text-xs',
          req.requestStatus === 'Completed' ? 'bg-green-50 border-green-200' :
          req.requestStatus === 'Rejected'  ? 'bg-red-50 border-red-200' :
          req.requestStatus === 'InProgress' ? 'bg-blue-50 border-blue-200' :
                                               'bg-amber-50 border-amber-200'
        )}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={cn(
              'font-semibold',
              req.requestStatus === 'Completed' ? 'text-green-700' :
              req.requestStatus === 'Rejected'  ? 'text-red-700' :
              req.requestStatus === 'InProgress' ? 'text-blue-700' : 'text-amber-700'
            )}>
              {req.requestStatus}
            </span>
            <span className="text-gray-400">{new Date(req.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
          {req.requestMessage && <p className="text-gray-600 mb-0.5">{req.requestMessage}</p>}
          {req.responseMessage && (
            <p className="text-emerald-700 bg-emerald-50 rounded px-2 py-1 mt-1">↩ {req.responseMessage}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function Step6SurgeonConfirmation({
  scheduleId,
  surgeonId,
  surgeonName,
  surgeryDate,
  patientName,
  branchId,
  surgeonStatus = 'pending',
  items,
  onMarkItem,
  onReschedule,
  onRequestAlternateSurgeon,
  onOverride,
  onSendDeptRequest,
  isMutating,
}: Props) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  // Alternate surgeon inline selector
  const [showAltSurgeon, setShowAltSurgeon] = useState(false);
  const [altSurgeonSearch, setAltSurgeonSearch] = useState('');
  const [selectedAltSurgeonId, setSelectedAltSurgeonId] = useState('');
  const [selectedAltSurgeonName, setSelectedAltSurgeonName] = useState('');

  const queryClient = useQueryClient();

  const { data: surgeonOptions = [], isFetching: isLoadingSurgeons } = useQuery<SurgeonOption[]>({
    queryKey: ['surgeons', branchId, altSurgeonSearch],
    enabled: showAltSurgeon,
    staleTime: 2 * 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/surgeons', {
        params: { branchId, search: altSurgeonSearch || undefined, specialization: 'ophthalmology' },
      });
      return Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
    },
  });

  const { mutate: assignAltSurgeon, isPending: isAssigning } = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.patch(`/otbooking/schedules/${scheduleId}`, {
        surgeonId: selectedAltSurgeonId,
        surgeonName: selectedAltSurgeonName,
      });
    },
    onSuccess: () => {
      toast.success(`Alternate surgeon assigned: ${selectedAltSurgeonName}`);
      queryClient.invalidateQueries({ queryKey: ['ot-schedule', scheduleId] });
      setShowAltSurgeon(false);
      onRequestAlternateSurgeon?.();
    },
    onError: () => toast.error('Failed to assign alternate surgeon'),
  });

  // S6-3: Track B manual confirmation
  const [manualConfirmed, setManualConfirmed] = useState(false);
  const [manualSaved, setManualSaved] = useState(false);
  const [confirmedBy, setConfirmedBy] = useState('');
  const [confirmedAt, setConfirmedAt] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [showManualTrack, setShowManualTrack] = useState(false);

  const completedCount = items.filter((i) => i.isComplete).length;
  const isRejected = surgeonStatus === 'rejected';
  const isNoResponse = surgeonStatus === 'no_response';
  const showEscalation = isRejected || isNoResponse;
  const config = surgeonStatusConfig[surgeonStatus];

  // ── S6-1: Track A — dept request timeline ────────────────────────────────
  const { data: allRequests = [] } = useGetDeptRequests(scheduleId);
  const surgeonRequests = allRequests
    .filter((r) => r.department === 'Surgeon')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const latestSurgeonRequest = surgeonRequests[0] ?? null;
  const trackAComplete = latestSurgeonRequest?.requestStatus === 'Completed';

  // ── S6-2: Send reminder ───────────────────────────────────────────────────
  const { mutate: sendDeptRequest, isPending: isSendingReminder } = useSendDeptRequest(scheduleId);

  function handleSendReminder() {
    sendDeptRequest(
      {
        patientId: '', // required by hook but filled server-side via scheduleId
        scheduleId,
        department: 'Surgeon',
        requestMessage: `Reminder: Please confirm surgery for patient${patientName ? ` ${patientName}` : ''}${surgeonName ? ` with surgeon ${surgeonName}` : ''}.`,
      },
      {
        onSuccess: () => toast.success('Reminder sent to Surgeon'),
        onError: () => toast.error('Failed to send reminder'),
      }
    );
  }

  // ── S6-5: Step complete logic ─────────────────────────────────────────────
  const isStepComplete = trackAComplete || manualConfirmed;

  // Confirmation item key
  const confirmItem = items.find((i) => i.itemKey === 'surgeon_confirmed' || i.itemLabel?.toLowerCase().includes('surgeon'));

  function handleManualConfirm() {
    if (!manualConfirmed) return;
    if (confirmItem && !confirmItem.isComplete) {
      const notes = `Manual — by: ${confirmedBy || 'unknown'}, at: ${confirmedAt || 'now'}${manualNotes ? `, notes: ${manualNotes}` : ''}`;
      onMarkItem(confirmItem.id, true, notes);
    }
    setManualSaved(true);
  }

  return (
    <div className="space-y-4">
      {/* Surgeon status card */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-4 rounded-xl border',
          isRejected
            ? 'bg-red-50 border-red-200'
            : surgeonStatus === 'confirmed'
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        )}
      >
        <div className="flex items-center gap-3">
          <UserCheck
            className={cn(
              'w-5 h-5',
              isRejected
                ? 'text-red-500'
                : surgeonStatus === 'confirmed'
                ? 'text-green-600'
                : 'text-amber-500'
            )}
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {surgeonName ?? 'Assigned Surgeon'}
            </p>
            <p className="text-xs text-gray-500">Surgeon confirmation status</p>
          </div>
        </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* S6-4: Availability badge */}
          <SurgeonAvailabilityBadge surgeonId={surgeonId} surgeryDate={surgeryDate} />
          {/* Dept-request live status badge */}
          {latestSurgeonRequest && (
            <span className={cn(
              'flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
              latestSurgeonRequest.requestStatus === 'Completed' ? 'bg-green-100 text-green-700' :
              latestSurgeonRequest.requestStatus === 'Rejected'  ? 'bg-red-100 text-red-700' :
              latestSurgeonRequest.requestStatus === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-amber-100 text-amber-700'
            )}>
              {latestSurgeonRequest.requestStatus === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> :
               latestSurgeonRequest.requestStatus === 'Rejected'  ? <AlertTriangle className="w-3 h-3" /> :
                                                                    <RefreshCw className="w-3 h-3" />}
              {latestSurgeonRequest.requestStatus}
            </span>
          )}
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
              config.className
            )}
          >
            {config.icon}
            {config.label}
          </span>
        </div>
      </div>

      {/* S6-5: All confirmed banner */}
      {isStepComplete && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-green-700">
            {trackAComplete ? 'Surgeon confirmed via dept request' : 'Surgeon confirmed manually'}
          </p>
        </div>
      )}

      {/* ── Track A: dept request timeline ─────────────────────────────────── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">Track A — Dept Request Timeline</span>
          </div>
          {/* S6-2: Send reminder */}
          <button
            type="button"
            disabled={isSendingReminder}
            onClick={handleSendReminder}
            className="flex items-center gap-1.5 text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg hover:bg-indigo-200 disabled:opacity-50"
          >
            {isSendingReminder ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Send Reminder
          </button>
        </div>
        <div className="px-4 py-3">
          <DeptRequestTimeline requests={surgeonRequests} />
        </div>
      </div>

      {/* ── Track B: manual confirmation ────────────────────────────────────── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowManualTrack((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Track B — Manual Confirmation</span>
          </div>
          {manualConfirmed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        </button>

        {showManualTrack && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 bg-gray-50/30">
            {manualSaved ? (
              <div className="pt-3 bg-green-50 -mx-4 px-4 pb-3 rounded-b-xl">
                <p className="text-sm font-semibold text-green-700 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Confirmation Recorded
                </p>
                <div className="text-xs text-green-600 space-y-0.5">
                  {confirmedBy && <p>By: <strong>{confirmedBy}</strong></p>}
                  {confirmedAt && <p>At: {new Date(confirmedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                  {manualNotes && <p>Notes: {manualNotes}</p>}
                </div>
                <button type="button" onClick={() => setManualSaved(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600 hover:underline">Edit</button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setManualConfirmed((v) => !v)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {manualConfirmed ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-400" />
                    )}
                  </button>
                  <p className="text-sm text-gray-700">Surgeon verbally confirmed this surgery</p>
                </div>
                {manualConfirmed && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Confirmed By</label>
                        <input
                          type="text"
                          value={confirmedBy}
                          onChange={(e) => setConfirmedBy(e.target.value)}
                          placeholder="Name of confirming person"
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Confirmed At</label>
                        <input
                          type="datetime-local"
                          value={confirmedAt}
                          onChange={(e) => setConfirmedAt(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                      <input
                        type="text"
                        value={manualNotes}
                        onChange={(e) => setManualNotes(e.target.value)}
                        placeholder="Additional notes"
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={handleManualConfirm}
                      className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Save Manual Confirmation
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Escalation options (rejection / no-response) */}
      {showEscalation && (
        <div className="border border-red-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-red-200">
            <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Action Required
            </p>
          </div>
          <div className="px-4 py-3 space-y-2 bg-white">
            {onReschedule && (
              <button
                type="button"
                onClick={onReschedule}
                className="w-full flex items-center gap-2 text-sm px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 text-amber-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reschedule Surgery
              </button>
            )}
            {/* Alternate Surgeon inline selector */}
            <div>
              <button
                type="button"
                onClick={() => setShowAltSurgeon((v) => !v)}
                className="w-full flex items-center gap-2 text-sm px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                {showAltSurgeon ? 'Cancel' : 'Request Alternate Surgeon'}
              </button>

              {showAltSurgeon && (
                <div className="mt-2 border border-blue-200 rounded-xl overflow-hidden bg-white">
                  <div className="px-3 pt-3 pb-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search surgeon by name..."
                      value={altSurgeonSearch}
                      onChange={(e) => setAltSurgeonSearch(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                    {isLoadingSurgeons && (
                      <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading surgeons…
                      </div>
                    )}
                    {!isLoadingSurgeons && surgeonOptions.length === 0 && (
                      <p className="px-3 py-3 text-xs text-gray-400">No surgeons found.</p>
                    )}
                    {surgeonOptions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedAltSurgeonId(s.id);
                          setSelectedAltSurgeonName(s.name);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-50 transition-colors',
                          selectedAltSurgeonId === s.id && 'bg-blue-100'
                        )}
                      >
                        <span className="font-medium text-gray-800">{s.name}</span>
                        <SurgeonAvailabilityBadge surgeonId={s.id} surgeryDate={surgeryDate} />
                      </button>
                    ))}
                  </div>

                  {selectedAltSurgeonId && (
                    <div className="px-3 py-2 border-t border-gray-100 flex justify-end">
                      <button
                        type="button"
                        disabled={isAssigning}
                        onClick={() => assignAltSurgeon()}
                        className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isAssigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                        Assign {selectedAltSurgeonName}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {onOverride && (
              <>
                <button
                  type="button"
                  onClick={() => setShowOverride((v) => !v)}
                  className="w-full flex items-center gap-2 text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Override (Emergency)
                </button>
                {showOverride && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Enter override reason (mandatory)..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                    <button
                      type="button"
                      disabled={!overrideReason.trim()}
                      onClick={() => {
                        onOverride(overrideReason);
                        setShowOverride(false);
                        setOverrideReason('');
                      }}
                      className="flex-shrink-0 flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 disabled:opacity-40"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      Override
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Final checklist */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Final Confirmation Items</span>
          </div>
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              completedCount === items.length
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {completedCount}/{items.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-start gap-3">
              <button
                type="button"
                disabled={isMutating}
                onClick={() => onMarkItem(item.id, !item.isComplete)}
                className="mt-0.5 flex-shrink-0"
              >
                {item.isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-400 transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    item.isComplete ? 'text-gray-400 line-through' : 'text-gray-800'
                  )}
                >
                  {item.itemLabel}
                  {item.isMandatory && !item.isComplete && (
                    <span className="ml-1 text-xs text-red-500">*</span>
                  )}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
