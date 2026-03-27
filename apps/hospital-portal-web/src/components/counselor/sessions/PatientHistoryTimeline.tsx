'use client';

/**
 * PatientHistoryTimeline
 * Left panel on the session detail page showing all past sessions for a patient.
 * Vertical timeline: oldest at top → newest at bottom.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ChevronDown, ChevronUp, User, Users } from 'lucide-react';
import type { PatientSessionSummary } from '@/hooks/use-patient-session-history';

interface PatientHistoryTimelineProps {
  sessions: PatientSessionSummary[];
  currentSessionId: string;
  isLoading?: boolean;
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  Initial: 'Initial Counseling',
  Followup: 'Follow-up',
  Recheck: 'Recheck',
  Urgent: 'Urgent Counseling',
  AttenderCounseling: 'Attender Visit',
};

const STATUS_STYLES: Record<string, string> = {
  Completed:  'bg-green-100 text-green-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Scheduled:  'bg-gray-100 text-gray-600',
  Cancelled:  'bg-red-50 text-red-600',
  NoShow:     'bg-orange-100 text-orange-700',
};

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  agreed:    { label: '✅ Agreed to Surgery', color: 'text-green-600' },
  declined:  { label: '❌ Declined',           color: 'text-red-500' },
  pending:   { label: '⏳ Pending Decision',   color: 'text-amber-600' },
  inprogress:{ label: '🔵 In Progress',        color: 'text-blue-600' },
};

function getOutcome(s: PatientSessionSummary) {
  if (s.status === 'InProgress') return OUTCOME_LABELS.inprogress;
  if (s.status === 'Cancelled' || s.status === 'NoShow') return { label: `⛔ ${s.status}`, color: 'text-gray-500' };
  if (s.patientAgreedToSurgery === true) return OUTCOME_LABELS.agreed;
  if (s.patientAgreedToSurgery === false && !s.pendingDecision) return OUTCOME_LABELS.declined;
  return OUTCOME_LABELS.pending;
}

function SessionTimelineNode({
  session,
  index,
  total,
  isCurrent,
  onOpen,
}: {
  session: PatientSessionSummary;
  index: number;
  total: number;
  isCurrent: boolean;
  onOpen: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const outcome = getOutcome(session);
  const dateLabel = new Date(session.sessionDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const isAttenderOnly = session.sessionType === 'AttenderCounseling' || !session.patientPresent;

  return (
    <div className="relative flex gap-3">
      {/* Vertical line connector */}
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
          isCurrent
            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
            : session.status === 'Completed'
              ? 'bg-green-500 text-white'
              : 'bg-gray-300 text-gray-700'
        }`}>
          {index + 1}
        </div>
        {index < total - 1 && (
          <div className="w-0.5 flex-1 bg-gray-200 my-1" />
        )}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-3 rounded-lg border p-3 text-sm transition-all ${
        isCurrent ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-1">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isAttenderOnly
                ? <span className="flex items-center gap-1 text-purple-600 text-xs font-semibold"><Users className="w-3 h-3" />Attender Visit</span>
                : <span className="font-semibold text-gray-800">{SESSION_TYPE_LABELS[session.sessionType] ?? session.sessionType}</span>
              }
              {isCurrent && <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">Current</span>}
            </div>
            <div className="text-gray-500 text-xs mt-0.5">{dateLabel}</div>
          </div>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[session.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {session.status}
          </span>
        </div>

        {/* Outcome */}
        <div className={`mt-1.5 text-xs font-medium ${outcome.color}`}>{outcome.label}</div>

        {/* Attender info */}
        {isAttenderOnly && session.attenderName && (
          <div className="mt-1 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded">
            👤 {session.attenderName}{session.attenderRelation ? ` (${session.attenderRelation})` : ''}
            {session.attenderIsDecisionMaker && ' — Decision-maker'}
          </div>
        )}

        {/* Expand toggle */}
        <button
          className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'Show details'}
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-2 space-y-1 border-t pt-2 text-xs text-gray-600">
            {session.counselorName && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-gray-400" />
                <span>Counselor: {session.counselorName}</span>
              </div>
            )}
            {session.recommendedSurgery && (
              <div>🔬 Procedure: <span className="font-medium">{session.recommendedSurgery}</span></div>
            )}
            {session.packageAmount && (
              <div>💰 Package: <span className="font-medium">₹{session.packageAmount.toLocaleString('en-IN')}</span></div>
            )}
            {session.reasonsForDelay && (
              <div>⏸ Delay reason: <span className="text-amber-700 font-medium">{session.reasonsForDelay}</span></div>
            )}
            {session.durationMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>Duration: {session.durationMinutes} min</span>
              </div>
            )}
            {session.additionalNotes && (
              <div className="mt-1 bg-gray-50 p-1.5 rounded text-gray-500 italic">
                {session.additionalNotes.slice(0, 120)}{session.additionalNotes.length > 120 ? '…' : ''}
              </div>
            )}
            {!isCurrent && session.status === 'Completed' && (
              <button
                onClick={() => onOpen(session.id)}
                className="mt-1 text-blue-600 hover:underline text-xs"
              >
                Open this session →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function PatientHistoryTimeline({
  sessions,
  currentSessionId,
  isLoading,
}: PatientHistoryTimelineProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <div className="text-2xl mb-1">📋</div>
        <div>First session for this patient</div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Session History ({sessions.length})
      </div>
      {sessions.map((s, i) => (
        <SessionTimelineNode
          key={s.id}
          session={s}
          index={i}
          total={sessions.length}
          isCurrent={s.id === currentSessionId}
          onOpen={(id) => router.push(`/dashboard/counselor/sessions/${id}`)}
        />
      ))}
    </div>
  );
}
