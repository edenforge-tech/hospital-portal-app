/**
 * Session Notes Widget
 * Rich text editor with templates, auto-save, and voice-to-text
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Phone as Mic, CheckCircle2 as Save, CheckCircle2 as Check, Clock, X as ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';

interface NoteTemplate {
  id: string;
  name: string;
  content: string;
}

export default function SessionNotesWidget({
  widgetId,
  patientId,
  sessionId,
  size,
  isMinimized,
  data,
  onAction,
  onDataChange,
}: WidgetProps) {
  const [notes, setNotes] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing notes
  useEffect(() => {
    if (sessionId) {
      loadNotes();
    }
  }, [sessionId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getSessionNotes(sessionId);
      setNotes(data.notes || '');
      if (data.lastSaved) setLastSaved(new Date(data.lastSaved));
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!notes || notes === data?.notes) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [notes]);

  // Mock note templates
  const templates: NoteTemplate[] = [
    {
      id: 'initial-consultation',
      name: 'Initial Consultation',
      content: `INITIAL CONSULTATION NOTES

Chief Complaint:
- 

History of Present Illness:
- Duration: 
- Progression: 
- Associated symptoms: 

Visual Symptoms:
- Distance vision: 
- Near vision: 
- Glare/Halos: 
- Double vision: 

Medical History:
- Diabetes: 
- Hypertension: 
- Other: 

Current Medications:
- 

Examination Findings:
- Visual Acuity: RE: _____ LE: _____
- IOP: RE: _____ mmHg LE: _____ mmHg
- Lens status: 

Assessment:
- 

Plan:
- Package discussed: 
- IOL recommended: 
- Surgery date: 
- Follow-up: `,
    },
    {
      id: 'financial-counseling',
      name: 'Financial Counseling',
      content: `FINANCIAL COUNSELING NOTES

Package Selected:
- Package type: 
- Total amount: ₹
- Discount applied: 

Payment Plan:
- Advance paid: ₹
- Balance due: ₹
- Payment mode: 

Insurance:
- Company: 
- Policy number: 
- Pre-auth status: 
- Coverage amount: ₹

Patient Concerns:
- 

Counselor Notes:
- `,
    },
    {
      id: 'pre-surgery',
      name: 'Pre-Surgery Checklist',
      content: `PRE-SURGERY CHECKLIST

Tests Completed:
□ Blood tests (CBC, RBS, HBsAg, HIV)
□ ECG
□ Physician fitness certificate
□ Eye examination updated

Preparations:
□ Fasting instructions explained
□ Eye drops schedule confirmed
□ Post-op care explained
□ Escort arrangements confirmed

Documents:
□ Consent forms signed
□ Insurance pre-auth (if applicable)
□ Admission papers ready

Patient Understanding:
- Procedure: 
- Risks explained: 
- Expectations set: 

Additional Notes:
- `,
    },
    {
      id: 'quick-note',
      name: 'Quick Note',
      content: `SESSION NOTES - ${new Date().toLocaleDateString('en-IN')}

`,
    },
  ];

  const handleSave = async (confirm = false) => {
    if (!sessionId) return;
    setIsSaving(true);
    try {
      await widgetsApi.saveSessionNotes(sessionId, notes);
      const now = new Date();
      setLastSaved(now);
      onDataChange?.({ notes, lastSaved: now, ...(confirm ? { confirmed: true } : {}) });
      onAction?.({ type: 'NOTES_SAVED', timestamp: now });
    } catch (err) {
      console.error('Failed to save session notes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateInsert = (template: NoteTemplate) => {
    setNotes(template.content);
    setShowTemplates(false);
    onAction?.({ type: 'TEMPLATE_INSERTED', payload: { templateId: template.id }, timestamp: new Date() });
  };

  const handleVoiceToText = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Mock voice recording start
      onAction?.({ type: 'VOICE_RECORDING_STARTED', timestamp: new Date() });
      
      // Simulate voice-to-text after 3 seconds
      setTimeout(() => {
        const mockTranscription = '\n\nPatient expressed concerns about recovery time. Reassured regarding normal healing process. Follow-up scheduled in one week.';
        setNotes(prev => prev + mockTranscription);
        setIsRecording(false);
        onAction?.({ type: 'VOICE_RECORDING_STOPPED', timestamp: new Date() });
      }, 3000);
    }
  };

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
        <FileText className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No patient selected</p>
        <p className="text-xs text-gray-400 mt-1">Select a patient to take notes</p>
      </div>
    );
  }

  const isCompact = size === 'small';

  if (isCompact) {
    const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Session Notes</p>
        <div className="bg-gray-50 rounded p-2 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">{wordCount} words</p>
          </div>
          {lastSaved && (
            <p className="text-xs text-gray-500">
              Saved {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          onClick={() => onAction?.({ type: 'OPEN_NOTES_EDITOR', timestamp: new Date() })}
          className="w-full py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Open Editor
        </button>
      </div>
    );
  }

  const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex h-full gap-3 p-3">
      {/* LEFT: Templates + metadata */}
      <div className="w-2/5 flex flex-col gap-3 overflow-y-auto hide-scrollbar">
        {/* Save Status Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Note Status</p>
          <p className="text-xs text-gray-600">{wordCount} words · {notes.length} chars</p>
          {isSaving && (
            <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 animate-spin" /> Saving...
            </p>
          )}
          {!isSaving && lastSaved && (
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <Check className="h-3 w-3" />
              Saved {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Templates Panel */}
        <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col flex-1">
          <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <p className="text-sm font-semibold text-gray-800">Templates</p>
            <p className="text-xs text-gray-500 mt-0.5">Click to insert into editor</p>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto hide-scrollbar">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateInsert(template)}
                className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-200 text-gray-700"
              >
                <p className="font-medium text-xs">{template.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs text-blue-700 flex-shrink-0">
          <div className="flex items-start gap-2">
            <FileText className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Tip:</strong> Use bullet points (-) or numbers (1. 2.) for better organization.
            </div>
          </div>
        </div>

        {/* Voice to Text */}
        <button
          onClick={handleVoiceToText}
          className={cn(
            'flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0',
            isRecording
              ? 'bg-red-600 text-white animate-pulse'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          <Mic className="h-4 w-4" />
          {isRecording ? 'Recording...' : 'Voice to Text'}
        </button>
      </div>

      {/* RIGHT: Editor */}
      <div className="w-3/5 flex flex-col border border-gray-200 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">Session Notes</p>
            {isSaving && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Clock className="h-3 w-3 animate-spin" />
                Saving...
              </div>
            )}
            {!isSaving && lastSaved && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3 w-3" />
                Saved {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-3 w-3" />
            Save
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type your session notes here or pick a template from the left panel...

Tips:
- Voice-to-text available for quick dictation
- Notes auto-save every 3 seconds
- Include key patient information and decisions made"
          className="flex-1 w-full px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none font-mono"
          style={{ lineHeight: '1.6' }}
        />

        {/* Footer Stats */}
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{notes.length} chars</span>
            <span>{notes.split('\n').length} lines</span>
          </div>
          {isRecording && (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              Recording...
            </span>
          )}
        </div>

        {/* Confirm Button */}
        <div className="px-3 pb-3 pt-2 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold text-sm"
          >
            <Check className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save & Confirm Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}
