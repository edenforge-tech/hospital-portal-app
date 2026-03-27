'use client';

/**
 * DeptCoordinationPanel
 * 3×3 grid of 9 department status cards.
 * Clicking a card opens a DeptSideWidget slide-in for full request history + send form.
 */

import React, { useEffect, useState } from 'react';
import {
  Send, RefreshCw, X, Clock, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Loader2, UserCheck, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ALL_DEPARTMENTS,
  useGetDeptRequests,
  useGetDeptSummary,
  useSendDeptRequest,
  useRespondDeptRequest,
  useAutoCreateDeptRequests,
  type DeptCoordinationDepartment,
  type DeptCoordinationRequestDto,
  type DeptRequestStatus,
} from '@/hooks/use-dept-coordination';
import type { SurgeryConfirmedPatient } from '@/hooks/use-surgery-confirmed';

// ── Status helpers ─────────────────────────────────────────────────────────────

function statusConfig(status: DeptRequestStatus | undefined): {
  label: string;
  cardCls: string;
  dotCls: string;
  textCls: string;
} {
  switch (status) {
    case 'Completed':
      return { label: 'Completed',   cardCls: 'bg-green-50  border-green-200',  dotCls: 'bg-green-500',          textCls: 'text-green-700' };
    case 'InProgress':
      return { label: 'In Progress', cardCls: 'bg-blue-50   border-blue-200',   dotCls: 'bg-blue-500 animate-pulse', textCls: 'text-blue-700' };
    case 'Sent':
      return { label: 'Sent',        cardCls: 'bg-sky-50    border-sky-200',    dotCls: 'bg-sky-400',            textCls: 'text-sky-700' };
    case 'Rejected':
      return { label: 'Rejected',    cardCls: 'bg-red-50    border-red-200',    dotCls: 'bg-red-500',            textCls: 'text-red-700' };
    case 'Cancelled':
      return { label: 'Cancelled',   cardCls: 'bg-gray-50   border-gray-200',   dotCls: 'bg-gray-300',           textCls: 'text-gray-500' };
    case 'None':
    case 'Pending':
      return { label: 'Pending',     cardCls: 'bg-amber-50  border-amber-200',  dotCls: 'bg-amber-400',          textCls: 'text-amber-700' };
    default:
      return { label: 'Not sent',    cardCls: 'bg-white     border-gray-200',   dotCls: 'bg-gray-200',           textCls: 'text-gray-400' };
  }
}

// ── Dept card ─────────────────────────────────────────────────────────────────

function DeptStatusCard({
  dept,
  status,
  latestMessage,
  isSelected,
  onClick,
}: {
  dept: DeptCoordinationDepartment;
  status?: DeptRequestStatus;
  latestMessage?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = statusConfig(status);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-left rounded-xl border p-3 transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400',
        cfg.cardCls,
        isSelected && 'ring-2 ring-emerald-500 ring-offset-1'
      )}
    >
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className="text-xs font-bold text-gray-700 truncate">{dept}</span>
        <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', cfg.dotCls)} />
      </div>
      <p className={cn('text-[11px] font-semibold', cfg.textCls)}>{cfg.label}</p>
      {latestMessage && (
        <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-tight">{latestMessage}</p>
      )}
    </button>
  );
}

// ── Surgeon context banner (shown in DeptSideWidget when dept === Surgeon) ─────

function SurgeonContextBanner({
  patient,
  surgeonRequests,
}: {
  patient: SurgeryConfirmedPatient;
  surgeonRequests: DeptCoordinationRequestDto[];
}) {
  const latest = surgeonRequests[0];
  const isConfirmed = latest?.requestStatus === 'Completed' || patient.otStatus === 'Confirmed';
  const isRejected = latest?.requestStatus === 'Rejected';

  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5 flex items-start gap-2.5',
        isConfirmed ? 'bg-green-50 border-green-200' :
        isRejected  ? 'bg-red-50 border-red-200' :
                      'bg-amber-50 border-amber-200'
      )}
    >
      {isConfirmed ? (
        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
      ) : isRejected ? (
        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      ) : (
        <UserCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        <p className={cn(
          'text-xs font-semibold',
          isConfirmed ? 'text-green-700' : isRejected ? 'text-red-700' : 'text-amber-700'
        )}>
          {isConfirmed ? 'Surgeon Confirmed' : isRejected ? 'Surgeon Rejected' : 'Awaiting Surgeon Confirmation'}
        </p>
        {patient.surgeonName && (
          <p className="text-[11px] text-gray-500 truncate">{patient.surgeonName}</p>
        )}
        {latest?.responseMessage && (
          <p className="text-[11px] text-gray-600 mt-0.5 italic">“{latest.responseMessage}”</p>
        )}
        {isRejected && (
          <p className="text-[10px] text-red-500 mt-0.5">Open Step 6 in the workflow to assign an alternate surgeon.</p>
        )}
      </div>
    </div>
  );
}

// ── Side widget ───────────────────────────────────────────────────────────────

function DeptSideWidget({
  dept,
  patient,
  requests,
  onClose,
  onRespond,
}: {
  dept: DeptCoordinationDepartment;
  patient: SurgeryConfirmedPatient;
  requests: DeptCoordinationRequestDto[];
  onClose: () => void;
  onRespond: (id: string, status: DeptRequestStatus, message: string) => void;
}) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'critical'>('normal');
  const [showHistory, setShowHistory] = useState(false);
  const { mutate: sendRequest, isPending: isSending } = useSendDeptRequest(patient.scheduleId);

  const deptRequests = requests
    .filter((r) => r.department === dept)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function handleSend() {
    if (!message.trim()) return;
    sendRequest(
      {
        patientId: patient.patientId,
        scheduleId: patient.scheduleId,
        sessionId: patient.sessionId,
        department: dept,
        requestMessage: message.trim(),
        priority,
      },
      {
        onSuccess: () => {
          toast.success(`Request sent to ${dept}`);
          setMessage('');
          setPriority('normal');
        },
        onError: () => toast.error('Failed to send request'),
      }
    );
  }

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div>
          <p className="text-sm font-bold text-gray-800">{dept}</p>
          <p className="text-xs text-gray-500">{deptRequests.length} request{deptRequests.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* P14: Surgeon-specific context banner */}
        {dept === 'Surgeon' && (
          <SurgeonContextBanner patient={patient} surgeonRequests={deptRequests} />
        )}

        {/* Latest request status */}
        {deptRequests.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">Latest Request</p>
            <LatestRequestCard
              request={deptRequests[0]}
              onRespond={(status, msg) => onRespond(deptRequests[0].id, status, msg)}
            />
          </div>
        )}

        {/* History (collapsible) */}
        {deptRequests.length > 1 && (
          <div>
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showHistory ? 'Hide' : 'Show'} history ({deptRequests.length - 1} more)
            </button>
            {showHistory && (
              <div className="mt-2 space-y-2">
                {deptRequests.slice(1).map((r) => (
                  <div key={r.id} className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">{r.requestStatus}</span>
                      <span className="text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.requestMessage && <p className="text-gray-500 mt-0.5 truncate">{r.requestMessage}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {deptRequests.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No requests yet for {dept}.</p>
        )}
      </div>

      {/* Send new request */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">Send New Request</p>
        <div className="mb-2">
          <label className="block text-[10px] font-medium text-gray-500 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'normal' | 'urgent' | 'critical')}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={`Message to ${dept} department…`}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
        />
        <button
          type="button"
          disabled={!message.trim() || isSending}
          onClick={handleSend}
          className="mt-2 w-full flex items-center justify-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors disabled:opacity-40"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send to {dept}
        </button>

        {/* P4-1: Navigate to dept module deep-link */}
        {(() => {
          const DEPT_ROUTES: Partial<Record<DeptCoordinationDepartment, string>> = {
            Surgeon:    '/dashboard/ot-booking',
            Anesthesia: '/dashboard/ot-booking',
            OT:         '/dashboard/ot-booking',
            Lab:        '/dashboard/lab-orders',
            Billing:    '/dashboard/billing',
            Admissions: '/dashboard/admissions',
            Pharmacy:   '/dashboard/pharmacy',
            Radiology:  '/dashboard/radiology',
            Nursing:    '/dashboard/nursing',
          };
          const route = DEPT_ROUTES[dept];
          if (!route) return null;
          return (
            <div className="mt-3 space-y-1">
              <a
                href={route}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                → Navigate to {dept} Module
              </a>
              {/* P4-2: Lab-specific link with patientId */}
              {dept === 'Lab' && patient.patientId && (
                <a
                  href={`/dashboard/lab-orders?patientId=${patient.patientId}`}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  → View Lab Orders for this Patient
                </a>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function LatestRequestCard({
  request,
  onRespond,
}: {
  request: DeptCoordinationRequestDto;
  onRespond: (status: DeptRequestStatus, message: string) => void;
}) {
  const [responseMsg, setResponseMsg] = useState('');
  const [showRespond, setShowRespond] = useState(false);

  const cfg = statusConfig(request.requestStatus);

  return (
    <div className={cn('border rounded-xl p-3', cfg.cardCls)}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className={cn('text-xs font-bold', cfg.textCls)}>{cfg.label}</span>
        <span className="text-[10px] text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</span>
      </div>
      {request.requestMessage && (
        <p className="text-xs text-gray-700 mb-1">{request.requestMessage}</p>
      )}
      {request.responseMessage && (
        <p className="text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1">↩ {request.responseMessage}</p>
      )}
      {/* Quick respond (mark complete / rejected) */}
      {request.requestStatus !== 'Completed' && request.requestStatus !== 'Cancelled' && (
        <div className="mt-2">
          {showRespond ? (
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Response note (optional)…"
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-300"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => { onRespond('Completed', responseMsg); setShowRespond(false); setResponseMsg(''); }}
                  className="flex-1 text-xs bg-green-100 text-green-700 rounded px-2 py-1 hover:bg-green-200 font-semibold"
                >
                  ✓ Complete
                </button>
                <button
                  type="button"
                  onClick={() => { onRespond('Rejected', responseMsg); setShowRespond(false); setResponseMsg(''); }}
                  className="flex-1 text-xs bg-red-100 text-red-700 rounded px-2 py-1 hover:bg-red-200 font-semibold"
                >
                  ✗ Reject
                </button>
                <button
                  type="button"
                  onClick={() => setShowRespond(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowRespond(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              Respond →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────

interface Props {
  patient: SurgeryConfirmedPatient;
}

export function DeptCoordinationPanel({ patient }: Props) {
  const [selectedDept, setSelectedDept] = useState<DeptCoordinationDepartment | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const { data: requests = [], isLoading, refetch, isFetching } = useGetDeptRequests(patient.scheduleId);
  const { data: summary } = useGetDeptSummary(patient.scheduleId);
  const { mutate: autoCreate, isPending: isAutoCreating } = useAutoCreateDeptRequests(patient.scheduleId);
  const { mutate: respondRequest } = useRespondDeptRequest(patient.scheduleId);

  // Track last successful sync time
  useEffect(() => {
    if (!isFetching) {
      setLastSyncedAt(new Date());
    }
  }, [isFetching]);

  function getStatusForDept(dept: DeptCoordinationDepartment): DeptRequestStatus | undefined {
    const deptInfo = summary?.departments?.[dept];
    return deptInfo?.status;
  }

  function getLatestMessageForDept(dept: DeptCoordinationDepartment): string | undefined {
    const deptInfo = summary?.departments?.[dept];
    return deptInfo?.latestMessage;
  }

  function handleAutoCreate() {
    autoCreate(
      {
        patientId: patient.patientId,
        sessionId: patient.sessionId,
      },
      {
        onSuccess: () => toast.success('Dept requests created for all 9 departments'),
        onError: () => toast.error('Failed to auto-create requests'),
      }
    );
  }

  function handleRespond(id: string, status: DeptRequestStatus, message: string) {
    respondRequest(
      { id, body: { requestStatus: status, responseMessage: message } },
      {
        onSuccess: () => toast.success(`Request marked ${status}`),
        onError: () => toast.error('Failed to update request'),
      }
    );
  }

  const completedCount = ALL_DEPARTMENTS.filter(
    (d) => getStatusForDept(d) === 'Completed'
  ).length;
  const blockedCount = ALL_DEPARTMENTS.filter(
    (d) => getStatusForDept(d) === 'Rejected'
  ).length;
  const pendingCount = ALL_DEPARTMENTS.length - completedCount - blockedCount;

  function formatSyncTime(date: Date): string {
    const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1m ago';
    return `${mins}m ago`;
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: grid + controls */}
      <div className="flex flex-col flex-1 min-w-0 p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Department Coordination</h3>
            <p className="text-xs text-gray-500">
              <span className="text-green-600 font-semibold">{completedCount} done</span>
              {' • '}
              <span className="text-amber-600 font-semibold">{pendingCount} pending</span>
              {' • '}
              <span className="text-red-500 font-semibold">{blockedCount} blocked</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoCreate}
              disabled={isAutoCreating}
              title="Create pending requests for all 9 departments (idempotent)"
              className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isAutoCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Auto-Create All
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn('w-4 h-4 text-gray-500', isFetching && 'animate-spin')} />
            </button>
            {lastSyncedAt && (
              <span className="text-[10px] text-gray-400">
                {formatSyncTime(lastSyncedAt)}
              </span>
            )}
          </div>
        </div>

        {/* 3 × 3 grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {ALL_DEPARTMENTS.map((d) => (
              <div key={d} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {ALL_DEPARTMENTS.map((dept) => (
              <DeptStatusCard
                key={dept}
                dept={dept}
                status={getStatusForDept(dept)}
                latestMessage={getLatestMessageForDept(dept)}
                isSelected={selectedDept === dept}
                onClick={() => setSelectedDept((prev) => (prev === dept ? null : dept))}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[10px] text-gray-400 pt-1">
          {[
            { label: 'Completed',   dot: 'bg-green-500' },
            { label: 'In Progress', dot: 'bg-blue-500' },
            { label: 'Sent',        dot: 'bg-sky-400' },
            { label: 'Pending',     dot: 'bg-amber-400' },
            { label: 'Rejected',    dot: 'bg-red-500' },
            { label: 'Not sent',    dot: 'bg-gray-200' },
          ].map(({ label, dot }) => (
            <div key={label} className="flex items-center gap-1">
              <span className={cn('w-2 h-2 rounded-full', dot)} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Right: side widget (slide-in) */}
      {selectedDept && (
        <div className="w-72 flex-shrink-0 border-l border-gray-200">
          <DeptSideWidget
            dept={selectedDept}
            patient={patient}
            requests={requests}
            onClose={() => setSelectedDept(null)}
            onRespond={(id, status, message) => handleRespond(id, status, message)}
          />
        </div>
      )}
    </div>
  );
}
