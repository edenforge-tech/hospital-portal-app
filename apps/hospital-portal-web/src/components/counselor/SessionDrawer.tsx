/**
 * Session Drawer
 * Slides in from the right edge of the dashboard body when a counselling
 * session is active.  The left queue panel stays fully visible and
 * interactive so the counsellor can switch patients at any time.
 *
 * Architecture:
 *   - Positioned absolutely within the `.relative` body flex container
 *   - Covers only the right ~70 % (left queue is unaffected)
 *   - CSS transform slide-in with 300 ms ease
 *
 * Created: March 10, 2026
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Clock, CheckCircle } from 'lucide-react';
import { SessionControls } from '@/components/counselor/SessionControls';
import { ClinicalContextBanner, type ClinicalContext } from '@/components/counselor/ClinicalContextBanner';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { cn } from '@/lib/utils';

interface SessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;

  // Session metadata
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  patientName: string;
  sessionId?: string;
  sessionElapsedSec: number;

  // Navigation
  canGoBack: boolean;
  canGoNext: boolean;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onCompleteSession: () => void;
  onCancelSession: () => void;

  // Clinical context from optometrist / doctor
  clinicalContext: ClinicalContext | null;

  // Recording — called with the recorded Blob when session ends
  onRecordingReady?: (blob: Blob, fileName: string) => void;

  // Widget workspace content
  children: React.ReactNode;
}

function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const STEP_LABELS: Record<number, string> = {
  1: 'Demographics',
  2: 'Pre-Op',
  3: 'IOL',
  4: 'Package',
  5: 'Imaging',
  6: 'Surgery',
  7: 'Payment',
};

export function SessionDrawer({
  isOpen,
  onClose,
  currentStep,
  totalSteps,
  stepTitle,
  patientName,
  sessionId,
  sessionElapsedSec,
  canGoBack,
  canGoNext,
  onPreviousStep,
  onNextStep,
  onCompleteSession,
  onCancelSession,
  clinicalContext,
  onRecordingReady,
  children,
}: SessionDrawerProps) {
  // ── Recording state ─────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Auto-start recording when drawer opens; stop when it closes
  useEffect(() => {
    if (isOpen) {
      startRecording();
    } else {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startRecording = async () => {
    if (mediaRecorderRef.current?.state === 'recording') return;
    setRecordingError(null);
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > 0 && onRecordingReady) {
          const ts = new Date().toISOString().replace(/[:.]/g, '-');
          onRecordingReady(blob, `session-${sessionId || 'unknown'}-${ts}.webm`);
        }
      };
      recorder.start(1000); // collect a chunk every second
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? 'Mic permission denied — recording disabled'
        : `Recording unavailable: ${err?.message || 'Unknown error'}`;
      setRecordingError(msg);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  return (
    <>
      {/* Backdrop — lightweight dim over the area behind the drawer */}
      <div
        className={cn(
          'absolute inset-0 z-30 bg-gray-900/20 transition-opacity duration-300 pointer-events-none',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Drawer panel — slides over the RIGHT portion of the body */}
      <div
        className={cn(
          'absolute top-0 right-0 bottom-0 z-40 flex flex-col bg-white shadow-2xl',
          'w-[70%] transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* ── Drawer Header ─────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-700 to-blue-800 px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            {/* Patient name + live timer */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-blue-100 uppercase tracking-wide">Active Session</span>
              </span>
              <span className="text-sm font-bold text-white truncate max-w-[200px]">{patientName}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Recording indicator */}
              {isRecording && (
                <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/40 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-red-200 uppercase tracking-wide">REC</span>
                </span>
              )}
              {recordingError && (
                <span className="text-[10px] text-yellow-300 max-w-[120px] truncate" title={recordingError}>
                  ⚠ No mic
                </span>
              )}
              {/* Elapsed timer */}
              <span className="flex items-center gap-1 text-xs font-mono font-bold text-white bg-blue-900/40 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                {formatElapsed(sessionElapsedSec)}
              </span>
              {/* Close / minimise button */}
              <button
                onClick={onClose}
                className="text-blue-200 hover:text-white hover:bg-blue-900/40 p-1.5 rounded-lg transition-colors"
                title="Collapse session panel (queue stays active)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step progress pills */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const step = i + 1;
              const done = step < currentStep;
              const active = step === currentStep;
              return (
                <div key={step} className="flex items-center gap-1">
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full text-[10px] font-bold transition-all',
                      done
                        ? 'w-5 h-5 bg-green-400 text-white'
                        : active
                        ? 'w-6 h-6 bg-white text-blue-700 ring-2 ring-white/60'
                        : 'w-5 h-5 bg-blue-500/50 text-blue-200'
                    )}
                  >
                    {done ? <CheckCircle className="w-3 h-3" /> : step}
                  </div>
                  {active && (
                    <span className="text-[10px] text-white font-semibold whitespace-nowrap">
                      {STEP_LABELS[step]}
                    </span>
                  )}
                  {step < totalSteps && (
                    <div className={cn('h-px w-3', done ? 'bg-green-400' : 'bg-blue-500/40')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Session Controls (prev / next / complete) ─────────── */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <SessionControls
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepTitle={stepTitle}
            patientName={patientName}
            sessionId={sessionId}
            canGoBack={canGoBack}
            canGoNext={canGoNext}
            onPreviousStep={onPreviousStep}
            onNextStep={onNextStep}
            onCompleteSession={onCompleteSession}
            onCancelSession={onCancelSession}
          />
        </div>

        {/* ── Clinical Context Banner (from Optometrist / Doctor) ── */}
        {clinicalContext && (
          <div className="flex-shrink-0">
            <ClinicalContextBanner
              context={clinicalContext}
              patientName={patientName}
            />
          </div>
        )}

        {/* ── Widget Workspace (scrollable) ─────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-5 py-4">
            <WidgetGrid layout="stack">
              {children}
            </WidgetGrid>
          </div>
        </div>

        {/* ── Collapse tab on left edge ─────────────────────────── */}
        <button
          onClick={onClose}
          className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-l-lg px-1.5 py-4 flex flex-col items-center gap-1 shadow-lg transition-colors group"
          title="Collapse — queue remains active"
        >
          <span className="text-base leading-none">›</span>
          <span className="text-[9px] font-bold uppercase tracking-widest rotate-90 mt-1">Session</span>
        </button>
      </div>
    </>
  );
}
