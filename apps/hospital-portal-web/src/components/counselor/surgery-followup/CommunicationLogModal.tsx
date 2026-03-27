'use client';

/**
 * CommunicationLogModal
 * Log a communication attempt (call, SMS, WhatsApp, email, in-person) with outcome, notes, and next action.
 * Saves to /api/counseling/sessions/{id}/communication-logs (Migration 69 dedicated endpoint).
 */

import React, { useState } from 'react';
import { X, Phone, MessageSquare, Mail, Users, ChevronDown } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CHANNELS = [
  { id: 'Phone',      label: 'Phone Call',  icon: Phone },
  { id: 'SMS',        label: 'SMS',         icon: MessageSquare },
  { id: 'WhatsApp',   label: 'WhatsApp',    icon: MessageSquare },
  { id: 'Email',      label: 'Email',       icon: Mail },
  { id: 'InPerson',   label: 'In-Person',   icon: Users },
] as const;

const OUTCOMES = [
  { value: 'AnsweredInterested',       label: 'Answered — Interested' },
  { value: 'AnsweredNotInterested',    label: 'Answered — Not Interested' },
  { value: 'AnsweredCallbackNeeded',   label: 'Answered — Callback Needed' },
  { value: 'Answered',                 label: 'Answered' },
  { value: 'NoAnswer',                 label: 'No Answer' },
  { value: 'Voicemail',                label: 'Voicemail Left' },
  { value: 'Busy',                     label: 'Busy / Call Failed' },
  { value: 'WrongNumber',              label: 'Wrong Number' },
  { value: 'DeclinedContact',          label: 'Declined Contact' },
  { value: 'MessageSent',              label: 'Message Sent' },
] as const;

const NEXT_ACTIONS = [
  { value: 'ScheduleCallback',   label: 'Schedule Callback' },
  { value: 'SendDocuments',      label: 'Send Documents' },
  { value: 'EscalateToManager',  label: 'Escalate to Manager' },
  { value: 'WaitForPatient',     label: 'Wait for Patient' },
  { value: 'BookSurgery',        label: 'Book Surgery' },
  { value: 'NoFurtherAction',    label: 'No Further Action' },
] as const;

interface CommunicationLogModalProps {
  sessionId: string;
  patientName: string;
  onClose: () => void;
  onLogged?: () => void;
}

export function CommunicationLogModal({
  sessionId,
  patientName,
  onClose,
  onLogged,
}: CommunicationLogModalProps) {
  const [channel, setChannel] = useState<string>('Phone');
  const [direction, setDirection] = useState<'Outbound' | 'Inbound'>('Outbound');
  const [outcome, setOutcome] = useState('');
  const [callDuration, setCallDuration] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [responseSummary, setResponseSummary] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [dispatchSms, setDispatchSms] = useState(false);
  const qc = useQueryClient();

  const isVoiceChannel = channel === 'Phone';
  const isTextChannel  = channel === 'SMS' || channel === 'WhatsApp' || channel === 'Email';
  const isSmsChannel   = channel === 'SMS';

  // Fetch message templates when a text channel is selected
  const { data: templates = [] } = useQuery<{ id: string; templateName: string; body: string; templateCategory: string }[]>({
    queryKey: ['message-templates', channel],
    enabled: isTextChannel,
    staleTime: 300_000,
    queryFn: async () => {
      const api = getApi();
      try {
        const res = await api.get(`/message-templates?channel=${channel}&pageSize=50`);
        const d = res.data;
        return Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : d?.data ?? [];
      } catch {
        return [];
      }
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.post(`/counseling/sessions/${sessionId}/communication-logs`, {
        channel,
        direction,
        outcome,
        callDurationMinutes: isVoiceChannel && callDuration ? parseInt(callDuration, 10) : undefined,
        messageBody: isTextChannel ? messageBody : responseSummary,
        responseSummary,
        nextAction: nextAction || undefined,
        nextActionDate: nextActionDate || undefined,
        ...(isSmsChannel ? { dispatchSms } : {}),
      });
    },
    onSuccess: () => {
      toast.success('Communication logged');
      qc.invalidateQueries({ queryKey: ['pending-decisions'] });
      onLogged?.();
      onClose();
    },
    onError: () => toast.error('Failed to log communication'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Log Communication</h2>
            <p className="text-xs text-gray-500 mt-0.5">{patientName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Channel */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Channel</label>
            <div className="grid grid-cols-4 gap-2">
              {CHANNELS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChannel(id)}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg border text-xs font-medium transition-colors ${
                    channel === id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Template picker (text channels only) */}
          {isTextChannel && templates.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Use Template <span className="text-gray-400 font-normal normal-case">(pre-fills message)</span>
              </label>
              <select
                defaultValue=""
                onChange={e => {
                  const tmpl = templates.find(t => t.id === e.target.value);
                  if (tmpl) setMessageBody(tmpl.body);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">— Pick a template —</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.templateName} · {t.templateCategory}</option>
                ))}
              </select>
            </div>
          )}

          {/* Outcome */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Outcome <span className="text-red-500">*</span></label>
            <select
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select outcome…</option>
              {OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Direction */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Direction</label>
            <div className="flex gap-2">
              {(['Outbound', 'Inbound'] as const).map(d => (
                <button key={d} type="button" onClick={() => setDirection(d)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    direction === d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Call Duration (phone only) */}
          {isVoiceChannel && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Call Duration (minutes)</label>
              <input type="number" min="0" max="120" value={callDuration} onChange={e => setCallDuration(e.target.value)}
                placeholder="e.g. 5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          )}

          {/* Message Body (text channels) */}
          {isTextChannel && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Message Sent</label>
              <textarea value={messageBody} onChange={e => setMessageBody(e.target.value)}
                placeholder="What message was sent?"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" />
            </div>
          )}

          {/* SMS dispatch toggle (SMS channel only) */}
          {isSmsChannel && (
            <label className="flex items-center gap-2 cursor-pointer select-none px-1">
              <input
                type="checkbox"
                checked={dispatchSms}
                onChange={e => setDispatchSms(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-700">
                Dispatch via Twilio SMS immediately
              </span>
            </label>
          )}

          {/* Response / Summary */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes / Response Summary</label>
            <textarea value={responseSummary} onChange={e => setResponseSummary(e.target.value)}
              placeholder="What did the patient say? Any concerns?"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none" />
          </div>

          {/* Next Action */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Next Action</label>
              <select value={nextAction} onChange={e => setNextAction(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="">— None —</option>
                {NEXT_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Next Action Date</label>
              <input type="date" value={nextActionDate} onChange={e => setNextActionDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!outcome || mutation.isPending}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {mutation.isPending ? 'Saving…' : 'Log Communication'}
          </button>
        </div>
      </div>
    </div>
  );
}
