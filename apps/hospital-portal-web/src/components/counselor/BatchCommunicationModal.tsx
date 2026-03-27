'use client';

/**
 * BatchCommunicationModal
 * Allows counselor to send a templated SMS/message to multiple patients at once.
 * Uses GET /api/message-templates for template list.
 * Uses POST /api/counseling/sessions/{sessionId}/communication-logs to log each send.
 */

import React, { useState, useMemo } from 'react';
import { X, Send, Check, MessageSquare, ChevronDown, ChevronUp, Loader2, Search, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface MessageTemplate {
  id: string;
  templateName: string;
  templateCategory: string;
  channel: string;
  subject?: string;
  body: string;
  patientTypeTarget?: string | null;
}

export interface BatchPatient {
  sessionId: string;
  patientName: string;
  patientType?: string;
  phone?: string;
}

interface SendResult {
  sessionId: string;
  patientName: string;
  success: boolean;
  error?: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: MessageTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={cn(
        'border rounded-xl overflow-hidden cursor-pointer transition-colors',
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={cn('w-4 h-4 rounded-full border-2 flex-shrink-0', selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300')}>
          {selected && <div className="w-full h-full rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{template.templateName}</p>
          <p className="text-xs text-gray-500">{template.templateCategory} · {template.channel}</p>
        </div>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          className="p-1 hover:bg-gray-100 rounded-md"
        >
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-100 bg-white">
          {template.subject && <p className="text-xs font-bold text-gray-500 mt-2 mb-1">Subject: {template.subject}</p>}
          <p className="text-xs text-gray-700 whitespace-pre-wrap">{template.body}</p>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface BatchCommunicationModalProps {
  patients: BatchPatient[];
  onClose: () => void;
}

export function BatchCommunicationModal({ patients, onClose }: BatchCommunicationModalProps) {
  const [step, setStep] = useState<'select' | 'template' | 'preview' | 'result'>('select');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(patients.map(p => p.sessionId)));
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [results, setResults] = useState<SendResult[]>([]);
  const [search, setSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');

  // Load templates
  const { data: templateData, isLoading: templatesLoading } = useQuery<{ items: MessageTemplate[] }>({
    queryKey: ['message-templates', 'SMS'],
    staleTime: 120_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/message-templates?channel=SMS&pageSize=100');
      return res.data;
    },
  });
  const templates = templateData?.items ?? [];

  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return templates;
    const q = templateSearch.toLowerCase();
    return templates.filter(t =>
      t.templateName.toLowerCase().includes(q) ||
      t.templateCategory.toLowerCase().includes(q) ||
      t.body.toLowerCase().includes(q)
    );
  }, [templates, templateSearch]);

  const selectedPatients = patients.filter(p => selectedIds.has(p.sessionId));
  const displayPatients = search.trim()
    ? patients.filter(p => p.patientName.toLowerCase().includes(search.toLowerCase()))
    : patients;

  // Bulk send mutation
  const [sending, setSending] = useState(false);
  const handleSend = async () => {
    if (!selectedTemplate || selectedPatients.length === 0) return;
    setSending(true);
    const api = getApi();
    const out: SendResult[] = [];
    for (const p of selectedPatients) {
      try {
        await api.post(`/counseling/sessions/${p.sessionId}/communication-logs`, {
          channel: selectedTemplate.channel,
          direction: 'Outbound',
          outcome: 'Sent',
          messageBody: selectedTemplate.body,
          templateId: selectedTemplate.id,
        });
        out.push({ sessionId: p.sessionId, patientName: p.patientName, success: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        out.push({ sessionId: p.sessionId, patientName: p.patientName, success: false, error: msg });
      }
    }
    setResults(out);
    setSending(false);
    setStep('result');
  };

  const toggleAll = () => {
    if (selectedIds.size === patients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(patients.map(p => p.sessionId)));
    }
  };

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Batch Communication</h2>
              <p className="text-xs text-gray-500">Send a message to multiple patients at once</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 bg-gray-50">
          {['Select Patients', 'Choose Template', 'Preview & Send'].map((label, i) => {
            const stepKeys = ['select', 'template', 'preview'] as const;
            const active = stepKeys[i] === step;
            const done = ['select', 'template', 'preview'].indexOf(step) > i;
            return (
              <React.Fragment key={label}>
                <div className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors',
                  active ? 'bg-blue-600 text-white' : done ? 'bg-green-100 text-green-700' : 'text-gray-400'
                )}>
                  {done ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                  {label}
                </div>
                {i < 2 && <div className={cn('flex-none h-0.5 w-6', done ? 'bg-green-400' : 'bg-gray-200')} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select patients */}
          {step === 'select' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search patients…"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap"
                >
                  {selectedIds.size === patients.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <p className="text-xs text-gray-500">{selectedIds.size} of {patients.length} selected</p>
              <ul className="space-y-1.5">
                {displayPatients.map(p => (
                  <li
                    key={p.sessionId}
                    onClick={() => toggle(p.sessionId)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors',
                      selectedIds.has(p.sessionId) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                      selectedIds.has(p.sessionId) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    )}>
                      {selectedIds.has(p.sessionId) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.patientName}</p>
                      {p.patientType && <p className="text-xs text-gray-500">{p.patientType}</p>}
                    </div>
                    {!p.phone && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">No phone</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 2: Choose template */}
          {step === 'template' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={templateSearch}
                  onChange={e => setTemplateSearch(e.target.value)}
                  placeholder="Search templates…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading templates…
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No templates found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map(t => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      selected={selectedTemplate?.id === t.id}
                      onSelect={() => setSelectedTemplate(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && selectedTemplate && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Template: {selectedTemplate.templateName}</p>
                {selectedTemplate.subject && (
                  <p className="text-sm font-semibold text-gray-700">{selectedTemplate.subject}</p>
                )}
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTemplate.body}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Will be sent to {selectedPatients.length} patient{selectedPatients.length !== 1 ? 's' : ''}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatients.map(p => (
                    <span key={p.sessionId} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {p.patientName}
                    </span>
                  ))}
                </div>
              </div>
              {selectedPatients.some(p => !p.phone) && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Some patients don't have a phone number. The communication log will still be recorded.</span>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Results */}
          {step === 'result' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-green-700">{results.filter(r => r.success).length}</p>
                  <p className="text-xs text-gray-500">Sent</p>
                </div>
                {results.some(r => !r.success) && (
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-red-600">{results.filter(r => !r.success).length}</p>
                    <p className="text-xs text-gray-500">Failed</p>
                  </div>
                )}
              </div>
              <ul className="space-y-1.5 mt-2">
                {results.map(r => (
                  <li key={r.sessionId} className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm',
                    r.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  )}>
                    {r.success
                      ? <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                    <span className="font-medium">{r.patientName}</span>
                    {!r.success && r.error && <span className="ml-auto text-xs opacity-70 truncate max-w-[140px]">{r.error}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          {step === 'result' ? (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={step === 'select'}
                onClick={() => setStep(prev => prev === 'template' ? 'select' : 'template')}
                className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-100 disabled:opacity-30"
              >
                Back
              </button>
              {step !== 'preview' ? (
                <button
                  type="button"
                  disabled={step === 'select' ? selectedIds.size === 0 : !selectedTemplate}
                  onClick={() => setStep(prev => prev === 'select' ? 'template' : 'preview')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl disabled:opacity-40"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  disabled={sending}
                  onClick={handleSend}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl disabled:opacity-40"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send to {selectedPatients.length} Patient{selectedPatients.length !== 1 ? 's' : ''}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
