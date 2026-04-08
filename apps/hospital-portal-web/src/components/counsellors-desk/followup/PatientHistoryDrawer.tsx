'use client';

import { useEffect, useState } from 'react';
import { X, Phone, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { counsellorsDeskApi } from '@/lib/api/counsellors-desk.api';

interface HistoryEntry {
  id: string;
  channel: string;
  direction: string;
  outcome: string | null;
  communicationAt: string;
  messageBody: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  callDurationMinutes: number | null;
}

interface PatientHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  patientName: string;
}

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  Phone: <Phone className="w-4 h-4" />,
  WhatsApp: <MessageSquare className="w-4 h-4 text-green-600" />,
  SMS: <MessageSquare className="w-4 h-4 text-blue-500" />,
};

const OUTCOME_COLOR: Record<string, string> = {
  Answered:    'bg-emerald-100 text-emerald-800',
  NoAnswer:    'bg-amber-100 text-amber-800',
  Busy:        'bg-orange-100 text-orange-800',
  LeftMessage: 'bg-sky-100 text-sky-800',
  Declined:    'bg-red-100 text-red-800',
};

export default function PatientHistoryDrawer({
  isOpen,
  onClose,
  sessionId,
  patientName,
}: PatientHistoryDrawerProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    setLoading(true);
    setError(null);
    counsellorsDeskApi
      .getSessionCommHistory(sessionId)
      .then((data) => setEntries(data))
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Contact History</h2>
            <p className="text-sm text-gray-500 mt-0.5">{patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Loading history…
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm gap-2">
              <Phone className="w-8 h-8 text-gray-300" />
              No contact history yet
            </div>
          )}

          {!loading && entries.length > 0 && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[17px] top-0 bottom-0 w-px bg-gray-200" />

              <div className="space-y-4">
                {entries.map((entry, idx) => {
                  const outcomeCls = OUTCOME_COLOR[entry.outcome ?? ''] ?? 'bg-gray-100 text-gray-600';
                  return (
                    <div key={entry.id} className="flex gap-3">
                      {/* Circle */}
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center z-10">
                        {CHANNEL_ICON[entry.channel] ?? <Phone className="w-4 h-4 text-gray-400" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{entry.channel}</span>
                            {entry.outcome && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${outcomeCls}`}>
                                {entry.outcome}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(entry.communicationAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>

                        {entry.callDurationMinutes != null && (
                          <p className="text-xs text-gray-500 mb-1">
                            Duration: {entry.callDurationMinutes} min
                          </p>
                        )}

                        {entry.messageBody && (
                          <p className="text-sm text-gray-700 mt-1">{entry.messageBody}</p>
                        )}

                        {entry.nextAction && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 rounded-lg px-2 py-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Next: {entry.nextAction}
                            {entry.nextActionDate && (
                              <span className="text-sky-500 ml-1">
                                — {new Date(entry.nextActionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
