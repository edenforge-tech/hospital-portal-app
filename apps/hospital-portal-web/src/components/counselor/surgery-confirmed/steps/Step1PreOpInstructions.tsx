'use client';

/**
 * Step1PreOpInstructions
 * Section A: patient-type-specific pre-op instructions (NPO, medication hold, arrival time)
 * Section B: counselor per-item checklist
 * Section C: surgical consent â€” checks for existing consent, inline sign flow if absent
 */

import React, { useRef, useState } from 'react';
import { CheckCircle2, Circle, ClipboardList, ChevronDown, ChevronUp, Info, FileSignature, Loader2, AlertTriangle, Upload, Pen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';
import type { WorkflowStepItem } from '@/hooks/use-pre-admission-workflow';
import type { PatientTypeInstructions } from '@/hooks/use-pre-admission-checklist';

interface Props {
  scheduleId: string;
  patientId?: string;
  patientType?: string;
  surgeryType?: string;
  patientAge?: number;
  patientTypeInstructions?: PatientTypeInstructions | null;
  items: WorkflowStepItem[];
  onMarkItem: (itemId: string, isComplete: boolean, notes?: string) => void;
  isMutating?: boolean;
}

export function Step1PreOpInstructions({
  scheduleId,
  patientId,
  patientType,
  patientTypeInstructions,
  items,
  onMarkItem,
  isMutating,
}: Props) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  // Mark All panel
  const [showMarkAllPanel, setShowMarkAllPanel] = useState(false);
  const [markAllNote, setMarkAllNote] = useState('');
  // Consent
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [consentMode, setConsentMode] = useState<'Physical' | 'Upload' | 'Digital'>('Physical');
  const [witnessName, setWitnessName] = useState('');
  const [consentNotes, setConsentNotes] = useState('');
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const [consentFilePreview, setConsentFilePreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const completedCount = items.filter((i) => i.isComplete).length;
  const allDone = items.length > 0 && items.every((i) => !i.isMandatory || i.isComplete);

  const qc = useQueryClient();

  // â”€â”€ Section C: check for existing surgical consent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: consents = [], isLoading: consentsLoading } = useQuery<any[]>({
    queryKey: ['patient-consents', patientId, 'surgical'],
    queryFn: async () => {
      if (!patientId) return [];
      const api = getApi();
      const res = await api.get(`/patient-consents/patient/${patientId}?consentType=surgical`);
      return Array.isArray(res.data) ? res.data : (res.data.consents ?? []);
    },
    enabled: !!patientId,
    staleTime: 60_000,
  });

  const surgicalConsent = consents.find(
    (c: any) => (c.consentType ?? c.consent_type) === 'surgical' && !(c.revokedAt ?? c.revoked_at)
  );
  const hasSurgicalConsent = !!surgicalConsent;

  const signConsentMutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      let payload: Record<string, unknown> = {
        patientId,
        scheduleId,
        consentType: 'surgical',
        consentGiven: true,
        notes: consentNotes || undefined,
      };
      if (consentMode === 'Physical') {
        payload.witnessedBy = witnessName || undefined;
      } else if (consentMode === 'Upload') {
        if (consentFile) {
          const fd = new FormData();
          fd.append('file', consentFile);
          fd.append('patientId', patientId ?? '');
          fd.append('scheduleId', scheduleId);
          fd.append('consentType', 'surgical');
          fd.append('notes', consentNotes || '');
          await api.post('/patient-consents/upload', fd);
          return;
        }
        payload.notes = `Uploaded consent form${consentNotes ? `: ${consentNotes}` : ''}`;
      } else if (consentMode === 'Digital') {
        const canvas = canvasRef.current;
        payload.signatureUrl = canvas ? canvas.toDataURL('image/png') : undefined;
      }
      await api.post('/patient-consents', payload);
    },
    onSuccess: () => {
      toast.success('Surgical consent recorded');
      qc.invalidateQueries({ queryKey: ['patient-consents', patientId] });
      setShowConsentForm(false);
      setWitnessName('');
      setConsentNotes('');
      setConsentFile(null);
      setConsentFilePreview(null);
      setHasSignature(false);
    },
    onError: () => toast.error('Failed to save consent'),
  });

  return (
    <div className="space-y-4">
      {/* â”€â”€ Section A: Patient-type instructions panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {patientTypeInstructions && (
        <div className="border border-indigo-200 rounded-xl overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            onClick={() => setShowInstructions((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-800">
                {patientType ?? 'Patient'} Type Instructions
              </span>
            </div>
            {showInstructions ? (
              <ChevronUp className="w-4 h-4 text-indigo-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {showInstructions && (
            <div className="px-4 py-3 space-y-3 bg-white">
              {patientTypeInstructions.docs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Documents Required
                  </p>
                  <ul className="space-y-1">
                    {patientTypeInstructions.docs.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-0.5 text-indigo-400">â€¢</span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {patientTypeInstructions.financial && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Financial
                  </p>
                  <p className="text-sm text-gray-700">{patientTypeInstructions.financial}</p>
                </div>
              )}

              {patientTypeInstructions.specialNote && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-amber-700 mb-0.5">Special Note</p>
                  <p className="text-sm text-amber-800">{patientTypeInstructions.specialNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* â”€â”€ Section B: Checklist items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Pre-Op Instructions Checklist</span>
          </div>
          <div className="flex items-center gap-2">
            {!allDone && (
              <button
                type="button"
                disabled={isMutating}
                onClick={() => setShowMarkAllPanel((v) => !v)}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:underline disabled:opacity-40 transition-colors"
              >
                Mark All Given
              </button>
            )}
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                allDone
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {completedCount}/{items.length}
            </span>
          </div>
        </div>

        {/* Mark All panel — expandable with shared note */}
        {showMarkAllPanel && (
          <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-200 space-y-2">
            <p className="text-xs text-emerald-700 font-medium">Add a shared note for all items (optional):</p>
            <textarea
              rows={2}
              placeholder="e.g. All instructions given verbally by counselor on {date}…"
              value={markAllNote}
              onChange={(e) => setMarkAllNote(e.target.value)}
              className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none bg-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isMutating}
                onClick={() => {
                  items.filter((i) => !i.isComplete).forEach((i) => onMarkItem(i.id, true, markAllNote || undefined));
                  setShowMarkAllPanel(false);
                  setMarkAllNote('');
                }}
                className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3 h-3" />
                Confirm &amp; Mark All
              </button>
              <button type="button" onClick={() => { setShowMarkAllPanel(false); setMarkAllNote(''); }} className="text-xs text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => {
                    if (!item.isComplete) {
                      setNoteFor(item.id);
                    } else {
                      onMarkItem(item.id, false);
                      setNoteFor(null);
                    }
                  }}
                  className="mt-0.5 flex-shrink-0"
                >
                  {item.isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
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
                  {item.notes && (
                    <p className="text-xs text-indigo-600 mt-0.5 italic">Note: {item.notes}</p>
                  )}
                </div>
              </div>

              {/* Inline note input when clicking to complete */}
              {noteFor === item.id && (
                <div className="mt-2 ml-8 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add note (optional)"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => {
                      onMarkItem(item.id, true, noteText || undefined);
                      setNoteFor(null);
                      setNoteText('');
                    }}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNoteFor(null); setNoteText(''); }}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* â”€â”€ Section C: Surgical Consent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={cn(
        'border rounded-xl overflow-hidden',
        hasSurgicalConsent ? 'border-green-200' : 'border-amber-300'
      )}>
        <div className={cn(
          'px-4 py-3 flex items-center justify-between',
          hasSurgicalConsent ? 'bg-green-50' : 'bg-amber-50'
        )}>
          <div className="flex items-center gap-2">
            <FileSignature className={cn('w-4 h-4', hasSurgicalConsent ? 'text-green-600' : 'text-amber-600')} />
            <span className={cn('text-sm font-medium', hasSurgicalConsent ? 'text-green-800' : 'text-amber-800')}>
              Surgical Consent
            </span>
            {!consentsLoading && hasSurgicalConsent && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Signed âœ“</span>
            )}
            {!consentsLoading && !hasSurgicalConsent && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Required</span>
            )}
          </div>
          {consentsLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        <div className="px-4 py-3 bg-white">
          {hasSurgicalConsent ? (
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                Signed on{' '}
                <strong>
                  {new Date(surgicalConsent.consentDate ?? surgicalConsent.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </strong>
              </p>
              {(surgicalConsent.witnessedBy ?? surgicalConsent.witnessed_by) && (
                <p>Witnessed by: <strong>{surgicalConsent.witnessedBy ?? surgicalConsent.witnessed_by}</strong></p>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-1">
                <CheckCircle2 className="w-3 h-3" /> Consent Recorded ✓
              </span>
            </div>
          ) : (
            <>
              {!showConsentForm ? (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-700">Surgical consent is required before OT admission.</p>
                    <button
                      type="button"
                      onClick={() => setShowConsentForm(true)}
                      className="mt-2 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"
                    >
                      Record Surgical Consent
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Mode picker */}
                  <div className="flex gap-1.5">
                    {(['Physical', 'Upload', 'Digital'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setConsentMode(mode)}
                        className={cn(
                          'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors',
                          consentMode === mode
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {mode === 'Physical' && <CheckCircle2 className="w-3 h-3" />}
                        {mode === 'Upload' && <Upload className="w-3 h-3" />}
                        {mode === 'Digital' && <Pen className="w-3 h-3" />}
                        {mode}
                      </button>
                    ))}
                  </div>

                  {/* Physical mode */}
                  {consentMode === 'Physical' && (
                    <>
                      <p className="text-xs text-gray-500">Confirm the patient/guardian signed the physical consent form.</p>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Witness Name <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={witnessName}
                          onChange={(e) => setWitnessName(e.target.value)}
                          placeholder="e.g. Nurse / Guardian name"
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                      </div>
                    </>
                  )}

                  {/* Upload mode */}
                  {consentMode === 'Upload' && (
                    <>
                      <p className="text-xs text-gray-500">Upload a scanned copy of the signed consent form.</p>
                      <label className={cn(
                        'flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-xs transition-colors w-full',
                        consentFile
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-amber-400 hover:text-amber-600'
                      )}>
                        <Upload className="w-4 h-4 flex-shrink-0" />
                        {consentFile ? <span className="truncate">Selected: {consentFile.name}</span> : <span>Click to select file (PDF, JPG, PNG)</span>}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setConsentFile(f);
                            if (f.type.startsWith('image/')) {
                              setConsentFilePreview(URL.createObjectURL(f));
                            } else {
                              setConsentFilePreview(null);
                            }
                          }}
                        />
                      </label>
                      {consentFilePreview && (
                        <img src={consentFilePreview} alt="Consent preview" className="max-h-40 rounded-lg border border-gray-200 object-cover" />
                      )}
                    </>
                  )}

                  {/* Digital signature mode */}
                  {consentMode === 'Digital' && (
                    <>
                      <p className="text-xs text-gray-500">Patient signs digitally on the canvas below.</p>
                      <div className="relative border border-gray-300 rounded-xl overflow-hidden bg-white">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={160}
                          className="w-full touch-none cursor-crosshair"
                          style={{ background: '#f9fafb' }}
                          onMouseDown={(e) => {
                            const c = canvasRef.current;
                            if (!c) return;
                            const ctx = c.getContext('2d');
                            if (!ctx) return;
                            const rect = c.getBoundingClientRect();
                            ctx.beginPath();
                            ctx.moveTo((e.clientX - rect.left) * (c.width / rect.width), (e.clientY - rect.top) * (c.height / rect.height));
                            setIsDrawing(true);
                          }}
                          onMouseMove={(e) => {
                            if (!isDrawing) return;
                            const c = canvasRef.current;
                            if (!c) return;
                            const ctx = c.getContext('2d');
                            if (!ctx) return;
                            const rect = c.getBoundingClientRect();
                            ctx.lineTo((e.clientX - rect.left) * (c.width / rect.width), (e.clientY - rect.top) * (c.height / rect.height));
                            ctx.strokeStyle = '#1e293b';
                            ctx.lineWidth = 2;
                            ctx.lineCap = 'round';
                            ctx.stroke();
                            setHasSignature(true);
                          }}
                          onMouseUp={() => setIsDrawing(false)}
                          onMouseLeave={() => setIsDrawing(false)}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            const c = canvasRef.current;
                            if (!c) return;
                            const ctx = c.getContext('2d');
                            if (!ctx) return;
                            const rect = c.getBoundingClientRect();
                            const t = e.touches[0];
                            ctx.beginPath();
                            ctx.moveTo((t.clientX - rect.left) * (c.width / rect.width), (t.clientY - rect.top) * (c.height / rect.height));
                            setIsDrawing(true);
                          }}
                          onTouchMove={(e) => {
                            e.preventDefault();
                            if (!isDrawing) return;
                            const c = canvasRef.current;
                            if (!c) return;
                            const ctx = c.getContext('2d');
                            if (!ctx) return;
                            const rect = c.getBoundingClientRect();
                            const t = e.touches[0];
                            ctx.lineTo((t.clientX - rect.left) * (c.width / rect.width), (t.clientY - rect.top) * (c.height / rect.height));
                            ctx.strokeStyle = '#1e293b';
                            ctx.lineWidth = 2;
                            ctx.lineCap = 'round';
                            ctx.stroke();
                            setHasSignature(true);
                          }}
                          onTouchEnd={() => setIsDrawing(false)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const c = canvasRef.current;
                            if (!c) return;
                            c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
                            setHasSignature(false);
                          }}
                          className="absolute top-2 right-2 text-xs text-gray-400 hover:text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded"
                        >
                          Clear
                        </button>
                      </div>
                    </>
                  )}

                  {/* Shared notes + save/cancel */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
                    <textarea
                      rows={2}
                      value={consentNotes}
                      onChange={(e) => setConsentNotes(e.target.value)}
                      placeholder="Any special notes about consent process…"
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        signConsentMutation.isPending ||
                        (consentMode === 'Digital' && !hasSignature) ||
                        (consentMode === 'Upload' && !consentFile)
                      }
                      onClick={() => signConsentMutation.mutate()}
                      className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {signConsentMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      Confirm Consent Signed
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConsentForm(false)}
                      className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
