/**
 * Consent Signing Widget
 * Multi-stage consent workflow: Explain â†’ Patient Sign â†’ Witness Sign â†’ Finalize
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, User, Users, Printer, AlertCircle, Activity as Video, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';
import { getApi } from '@/lib/api';

type ConsentStage = 'explain' | 'patient-sign' | 'witness-sign' | 'finalized';

interface ConsentForm {
  id: string;
  type: 'surgery' | 'anesthesia' | 'iol-implant' | 'complications';
  title: string;
  required: boolean;
  explained: boolean;
  patientSigned: boolean;
  witnessSigned: boolean;
}

export default function ConsentSigningWidget({
  widgetId,
  patientId,
  sessionId,
  size,
  isMinimized,
  data,
  onAction,
  onDataChange,
}: WidgetProps) {
  const [currentStage, setCurrentStage] = useState<ConsentStage>((data as any)?.consentStage || 'explain');
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([]);
  const [videoConsentRecorded, setVideoConsentRecorded] = useState<boolean>((data as any)?.videoConsentRecorded ?? false);
  const [witnessName, setWitnessName] = useState<string>((data as any)?.witnessName || '');
  const [witnessRelation, setWitnessRelation] = useState<string>((data as any)?.witnessRelation || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load consent forms from API
  useEffect(() => {
    if (patientId) loadConsentForms();
  }, [patientId]);

  // Sync witness details when parent seeds data from DB
  useEffect(() => {
    if ((data as any)?.witnessName) setWitnessName((data as any).witnessName);
    if ((data as any)?.witnessRelation) setWitnessRelation((data as any).witnessRelation);
    if ((data as any)?.videoConsentRecorded != null) setVideoConsentRecorded((data as any).videoConsentRecorded);
    if ((data as any)?.consentStage) setCurrentStage((data as any).consentStage);
  }, [(data as any)?.witnessName, (data as any)?.witnessRelation, (data as any)?.videoConsentRecorded, (data as any)?.consentStage]);

  const loadConsentForms = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiforms = await widgetsApi.getConsentForms(patientId!);
      
      // Map API forms to widget format
      const mappedForms: ConsentForm[] = apiforms.map((form, idx) => {
        const types: ConsentForm['type'][] = ['surgery', 'anesthesia', 'iol-implant', 'complications'];
        return {
          id: form.id,
          type: types[idx % types.length],
          title: form.title,
          required: form.required,
          explained: form.signed,
          patientSigned: form.signed,
          witnessSigned: form.signed,
        };
      });
      
      setConsentForms(mappedForms);
    } catch (err: any) {
      console.error('Failed to load consent forms:', err);
      setError(err.message || 'Failed to load consent forms');
      // Fallback to mock data
      setConsentForms([
        { id: 'consent1', type: 'surgery', title: 'Cataract Surgery Consent', required: true, explained: false, patientSigned: false, witnessSigned: false },
        { id: 'consent2', type: 'anesthesia', title: 'Anesthesia Consent', required: true, explained: false, patientSigned: false, witnessSigned: false },
        { id: 'consent3', type: 'iol-implant', title: 'IOL Implantation Consent', required: true, explained: false, patientSigned: false, witnessSigned: false },
        { id: 'consent4', type: 'complications', title: 'Complications & Risks Acknowledgement', required: true, explained: false, patientSigned: false, witnessSigned: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Activity className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading consent forms...</span>
      </div>
    );
  }

  if (error && !consentForms.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadConsentForms}
          className="mt-3 text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!consentForms.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <FileText className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No consent forms available</p>
      </div>
    );
  }

  const stages: { id: ConsentStage; label: string; icon: React.ElementType }[] = [
    { id: 'explain', label: 'Explain', icon: FileText },
    { id: 'patient-sign', label: 'Patient Sign', icon: User },
    { id: 'witness-sign', label: 'Witness Sign', icon: Users },
    { id: 'finalized', label: 'Finalized', icon: CheckCircle },
  ];

  const handleExplainComplete = (formId: string) => {
    setConsentForms(forms =>
      forms.map(f => (f.id === formId ? { ...f, explained: true } : f))
    );
  };

  const handlePatientSign = (formId: string) => {
    setConsentForms(forms =>
      forms.map(f => (f.id === formId ? { ...f, patientSigned: true } : f))
    );
    onAction?.({ type: 'CONSENT_SIGNED', payload: { formId, signatory: 'patient' }, timestamp: new Date() });
  };

  const handleWitnessSign = (formId: string) => {
    setConsentForms(forms =>
      forms.map(f => (f.id === formId ? { ...f, witnessSigned: true } : f))
    );
    onAction?.({ type: 'CONSENT_SIGNED', payload: { formId, signatory: 'witness' }, timestamp: new Date() });
  };

  const handleFinalizeConsent = async () => {
    setCurrentStage('finalized');
    const consentFormsStatus = JSON.stringify(
      consentForms.reduce((acc, f) => ({
        ...acc,
        [f.id]: { explained: f.explained, patientSigned: f.patientSigned, witnessSigned: f.witnessSigned },
      }), {} as Record<string, any>)
    );
    onDataChange?.({
      consentStage: 'finalized',
      consentForms,
      witnessName,
      witnessRelation,
      videoConsentRecorded,
      confirmed: true,
    });
    onAction?.({ type: 'CONSENT_FINALIZED', timestamp: new Date() });
    if (sessionId) {
      try {
        await getApi().put(`/counseling/sessions/${sessionId}`, {
          consentWitnessName: witnessName,
          consentWitnessRelation: witnessRelation,
          videoConsentRecorded,
          consentFormsStatus,
          consentFormsSigned: true,
        });
      } catch (err) {
        console.error('Failed to save consent status:', err);
      }
    }
  };

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
        <FileText className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No patient selected</p>
        <p className="text-xs text-gray-400 mt-1">Select a patient for consent signing</p>
      </div>
    );
  }

  const isCompact = size === 'small';

  if (isCompact) {
    const totalForms = consentForms.filter(f => f.required).length;
    const signedForms = consentForms.filter(f => f.required && f.patientSigned && f.witnessSigned).length;
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Consent Status</p>
        <div className={cn(
          'rounded p-2 border',
          currentStage === 'finalized' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
        )}>
          <p className="text-sm font-semibold text-gray-900">{stages.find(s => s.id === currentStage)?.label}</p>
          <p className="text-xs text-gray-600 mt-1">{signedForms}/{totalForms} forms signed</p>
        </div>
      </div>
    );
  }

  const allExplained = consentForms.filter(f => f.required).every(f => f.explained);
  const allPatientSigned = consentForms.filter(f => f.required).every(f => f.patientSigned);
  const allWitnessSigned = consentForms.filter(f => f.required).every(f => f.witnessSigned);

  return (
    <div className="flex h-full gap-3 p-3">
      {/* â•â• LEFT: Stage progress + Consent forms list â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="w-1/2 flex flex-col gap-3 overflow-y-auto hide-scrollbar">
        {/* Stage progress stepper */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = stage.id === currentStage;
              const isComplete =
                (stage.id === 'explain' && allExplained) ||
                (stage.id === 'patient-sign' && allPatientSigned) ||
                (stage.id === 'witness-sign' && allWitnessSigned) ||
                (stage.id === 'finalized' && currentStage === 'finalized');

              return (
                <React.Fragment key={stage.id}>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                      isComplete ? 'bg-green-500 border-green-500 text-white'
                        : isActive ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className={cn('text-[10px] mt-1 leading-tight text-center', isActive ? 'font-semibold text-gray-900' : 'text-gray-500')}>
                      {stage.label}
                    </p>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-1 mb-4', isComplete ? 'bg-green-500' : 'bg-gray-200')} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Consent forms list */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex-1">
          <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Consent Forms</p>
          </div>
          <div className="p-3 space-y-2">
            {consentForms.map((form) => (
              <div
                key={form.id}
                className={cn(
                  'border rounded-lg p-3 transition-all',
                  form.patientSigned && form.witnessSigned ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-medium text-gray-900 leading-snug">
                    {form.title}
                    {form.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  {form.patientSigned && form.witnessSigned && (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 ml-1" />
                  )}
                </div>

                {/* Progress indicators */}
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1">
                    {form.explained ? <CheckCircle className="h-3 w-3 text-green-600" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                    <span className={form.explained ? 'text-green-600' : 'text-gray-500'}>Explained</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {form.patientSigned ? <CheckCircle className="h-3 w-3 text-green-600" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                    <span className={form.patientSigned ? 'text-green-600' : 'text-gray-500'}>Patient</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {form.witnessSigned ? <CheckCircle className="h-3 w-3 text-green-600" /> : <div className="h-3 w-3 rounded-full border border-gray-300" />}
                    <span className={form.witnessSigned ? 'text-green-600' : 'text-gray-500'}>Witness</span>
                  </div>
                </div>

                {/* Action buttons based on stage */}
                <div className="mt-2 flex gap-2">
                  {currentStage === 'explain' && !form.explained && (
                    <button
                      onClick={() => handleExplainComplete(form.id)}
                      className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Mark Explained
                    </button>
                  )}
                  {currentStage === 'patient-sign' && form.explained && !form.patientSigned && (
                    <button
                      onClick={() => handlePatientSign(form.id)}
                      className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Patient Sign
                    </button>
                  )}
                  {currentStage === 'witness-sign' && form.patientSigned && !form.witnessSigned && (
                    <button
                      onClick={() => handleWitnessSign(form.id)}
                      className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Witness Sign
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* â•â• RIGHT: Stage-specific content + Instructions + Navigation â•â•â•â•â•â•â• */}
      <div className="w-1/2 flex flex-col gap-3">
        {/* Stage-specific panel */}
        {currentStage === 'explain' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex-shrink-0">
            <p className="text-sm font-semibold text-blue-900 mb-1">Step 1: Explain Procedures</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Walk the patient through each consent form. Explain risks, benefits, and alternatives.
              Mark each form as explained once discussed.
            </p>
          </div>
        )}

        {currentStage === 'patient-sign' && (
          <div className="border border-blue-200 rounded-xl p-3 bg-blue-50 flex-shrink-0">
            <div className="flex items-start gap-2">
              <Video className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Video Consent <span className="text-xs font-normal text-gray-500">(Optional)</span></p>
                <p className="text-xs text-gray-600 mt-1">Record video consent for additional documentation</p>
                <button
                  onClick={() => {
                    setVideoConsentRecorded(true);
                    onAction?.({ type: 'VIDEO_CONSENT_RECORDED', timestamp: new Date() });
                  }}
                  disabled={videoConsentRecorded}
                  className={cn(
                    'mt-2 px-3 py-1.5 text-xs rounded transition-colors',
                    videoConsentRecorded ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                >
                  {videoConsentRecorded ? 'âœ“ Video Recorded' : 'Start Recording'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStage === 'witness-sign' && (
          <div className="border border-gray-200 rounded-xl p-3 flex-shrink-0">
            <p className="text-sm font-semibold text-gray-900 mb-3">Witness Details</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Witness Name *</label>
                <input
                  type="text"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  placeholder="Enter witness name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Relation to Patient *</label>
                <input
                  type="text"
                  value={witnessRelation}
                  onChange={(e) => setWitnessRelation(e.target.value)}
                  placeholder="e.g., Spouse, Son, Daughter"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {currentStage === 'finalized' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm font-semibold text-green-800">Consent Process Complete</p>
            </div>
            <p className="text-xs text-green-700">All forms have been explained, signed by patient and witness, and finalized.</p>
          </div>
        )}

        {/* Instructions â€” always visible */}
        <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700">
              <p className="font-semibold mb-1.5">Important:</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-1.5"><span className="text-yellow-600 flex-shrink-0">â€¢</span> Ensure patient understands all risks and procedures</li>
                <li className="flex items-start gap-1.5"><span className="text-yellow-600 flex-shrink-0">â€¢</span> Patient must sign in presence of counselor</li>
                <li className="flex items-start gap-1.5"><span className="text-yellow-600 flex-shrink-0">â€¢</span> Witness must be a family member (not hospital staff)</li>
                <li className="flex items-start gap-1.5"><span className="text-yellow-600 flex-shrink-0">â€¢</span> Keep original consent forms in patient file</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation buttons â€” pinned at bottom */}
        <div className="flex gap-2 flex-shrink-0">
          {currentStage === 'explain' && allExplained && (
            <button
              onClick={() => setCurrentStage('patient-sign')}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Proceed to Patient Signing
            </button>
          )}
          {currentStage === 'patient-sign' && allPatientSigned && (
            <button
              onClick={() => setCurrentStage('witness-sign')}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Proceed to Witness Signing
            </button>
          )}
          {currentStage === 'witness-sign' && allWitnessSigned && witnessName && witnessRelation && (
            <button
              onClick={handleFinalizeConsent}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Finalize Consent Forms
            </button>
          )}
          {currentStage === 'finalized' && (
            <button
              onClick={() => onAction?.({ type: 'PRINT_CONSENT_FORMS', timestamp: new Date() })}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Consent Forms
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
