'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Activity } from 'lucide-react';
import { PatientSidebar } from '@/components/counselor/PatientSidebar';
import { SessionCompletionModal } from '@/components/counselor/SessionCompletionModal';

import { counselingSessionsApi } from '@/lib/api/counseling-sessions.api';
import { CounselingWorkspaceProvider, useCounselingWorkspace } from '@/contexts/CounselingWorkspaceContext';
import { registerAllWidgets, getWidgetComponent } from '@/lib/widgets/widget-registry';
import { getApi } from '@/lib/api';
import { useCounselingSession, useUpdateCounselingSession } from '@/hooks/use-counseling-sessions';
import type { RecommendedProcedureItem } from '@/lib/api/master-data.api';
import { PatientHistoryTimeline } from '@/components/counselor/sessions/PatientHistoryTimeline';
import { usePatientSessionHistory } from '@/hooks/use-patient-session-history';

// Register widgets on module load
registerAllWidgets();

// 6-Step Workflow Configuration
const ALL_WORKFLOW_STEPS = [
  { id: 1, name: 'Pre-Op Instructions',  widgetStep: 1, description: 'Pre-operative assessment and instructions',         widgetIds: ['preoperative-instructions'] },
  { id: 2, name: 'Procedure Counseling',  widgetStep: 2, description: 'Procedure selection, IOL counseling and lens recommendation', widgetIds: ['iol-recommendation'], requiresIol: true },
  { id: 3, name: 'Imaging Orders',        widgetStep: 3, description: 'Pre-operative imaging and tests',                  widgetIds: ['imaging-order'] },
  { id: 4, name: 'Surgery Scheduling',   widgetStep: 4, description: 'Book surgery date and operating room',             widgetIds: ['surgery-scheduling'], optional: true },
  { id: 5, name: 'Payment Mode',         widgetStep: 5, description: 'Payment mode selection and patient type',          widgetIds: ['payment-mode-selection'] },
  { id: 6, name: 'Session Notes',        widgetStep: 6, description: 'Final notes and documentation',                    widgetIds: ['session-notes'] },
];

function parseProcedures(raw?: string | null): RecommendedProcedureItem[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Inner component with workspace context access
 */
function SessionWorkflowContent({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const workspace = useCounselingWorkspace();
  const updateSessionMutation = useUpdateCounselingSession();

  // Load real session data
  const { data: sessionData, isLoading: isSessionLoading } = useCounselingSession(sessionId);

  // Derive procedures from session — backend may return either a parsed array or a JSON string
  const procedures = useMemo((): RecommendedProcedureItem[] => {
    const raw = sessionData?.recommendedProcedures;
    if (!raw) {
      // Synthesize from plain recommendedSurgery text as fallback
      const surgeryName: string = (sessionData as any)?.recommendedSurgery || '';
      if (!surgeryName) return [];
      const isLaser = /lasik|prk|lasek|smile|femto/i.test(surgeryName);
      const isIcl = /icl|implantable/i.test(surgeryName);
      const requiresIol = !isLaser && !isIcl && /cataract|phaco|ecce|sics/i.test(surgeryName);
      return [{
        eye: 'Both' as any,
        surgeryTypeId: '312638d7-bac4-471d-8ef5-5872c376a28e',
        surgeryName,
        surgeryCategory: requiresIol ? 'Cataract' : isLaser ? 'Refractive' : 'Other' as any,
        requiresIol,
        iclProcedure: isIcl,
        laserProcedure: isLaser,
      }];
    }
    if (Array.isArray(raw)) return raw as RecommendedProcedureItem[];
    return parseProcedures(raw as unknown as string);
  }, [sessionData?.recommendedProcedures, (sessionData as any)?.recommendedSurgery]);

  // Dynamic step list: skip IOL step when no procedure requires IOL
  const WORKFLOW_STEPS = useMemo(() => {
    if (procedures.length === 0) return ALL_WORKFLOW_STEPS; // keep all steps when no data yet
    const anyRequiresIol = procedures.some(p => p.requiresIol);
    return ALL_WORKFLOW_STEPS.filter(s => !s.requiresIol || anyRequiresIol);
  }, [procedures]);

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState<any>(null);
  const [vitalsData, setVitalsData] = useState<any>(null);
  const [surgeryRecommendation, setSurgeryRecommendation] = useState<any>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [branchData, setBranchData] = useState<any>(null);
  const [logoBase64, setLogoBase64] = useState<string | undefined>(undefined);

  // Patient session history for the timeline panel
  const patientId = sessionData?.patientId;
  const { data: sessionHistory = [], isLoading: isHistoryLoading } = usePatientSessionHistory(patientId);

  // Load workspace template on mount
  useEffect(() => {
    workspace.applyTemplate('comprehensive-counseling');
    workspace.setActiveSession(sessionId);
  }, [sessionId]);

  // Fetch branch info (hospital name/address/phone) when session loads
  useEffect(() => {
    if (!sessionData?.branchId) return;
    const api = getApi();
    api.get(`/branches/${sessionData.branchId}`)
      .then(res => {
        const b = res.data;
        setBranchData({
          name: b.name || b.branchName || b.BranchName || 'Hospital',
          address: [b.address, b.city, b.state].filter(Boolean).join(', ') || b.address || '',
          phoneNumber: b.phoneNumber || b.phone_number || b.phone || b.contactPhone || '',
        });
      })
      .catch(() => { /* silently ignore — header will show generic name */ });
  }, [sessionData?.branchId]);

  // Load hospital logo as base64 for PDF embedding
  useEffect(() => {
    fetch('/hospital-logo.png')
      .then(r => r.ok ? r.blob() : Promise.reject())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = e => setLogoBase64(e.target?.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => { /* logo not available — PDF will use text-only header */ });
  }, []);

  // When session loads: update workspace patient context + push recommendedProcedures to all widgets
  useEffect(() => {
    if (!sessionData) return;

    // Set patient context for widgets
    if (sessionData.patientId) {
      workspace.setActivePatient(sessionData.patientId);
    }

    // Seed recommendedProcedures into widget data so IOL + Package widgets can read it
    let procJson = (sessionData as any).recommendedProcedures;

    // Fallback: synthesize procedures from recommendedSurgery when structured data is absent
    if (!procJson && (sessionData as any).recommendedSurgery) {
      const surgeryName: string = (sessionData as any).recommendedSurgery;
      const isLaser = /lasik|prk|lasek|smile|femto/i.test(surgeryName);
      const isIcl = /icl|implantable/i.test(surgeryName);
      const requiresIol = !isLaser && !isIcl && /cataract|phaco|ecce|sics/i.test(surgeryName);
      const fallbackProc = {
        eye: 'Both',
        surgeryTypeId: '312638d7-bac4-471d-8ef5-5872c376a28e',
        surgeryName,
        surgeryCategory: requiresIol ? 'Cataract' : isLaser ? 'Refractive' : 'Other',
        requiresIol,
        iclProcedure: isIcl,
        laserProcedure: isLaser,
      };
      procJson = JSON.stringify([fallbackProc]);
    }

    if (procJson) {
      workspace.updateWidgetData('iol-recommendation', { recommendedProcedures: procJson });
    }

    // Seed surgery scheduling widget from saved DB values
    const sd = sessionData as any;
    if (sd.surgeryTentativeDate || sd.surgeryTentativeSurgeonId || sd.surgeryTentativeTimeSlot) {
      workspace.updateWidgetData('surgery-scheduling', {
        surgeryDate: sd.surgeryTentativeDate || null,
        surgeonId: sd.surgeryTentativeSurgeonId || null,
        surgeonName: sd.surgeryTentativeSurgeonName || null,
        timeSlot: sd.surgeryTentativeTimeSlot || null,
        eye: sd.surgeryTentativeEye || null,
      });
    }

    // Seed consent widget from saved DB values
    if (sd.consentWitnessName || sd.videoConsentRecorded || sd.consentFormsStatus) {
      workspace.updateWidgetData('consent-signing', {
        witnessName: sd.consentWitnessName || null,
        witnessRelation: sd.consentWitnessRelation || null,
        videoConsentRecorded: sd.videoConsentRecorded || false,
        consentFormsStatus: sd.consentFormsStatus ? JSON.parse(sd.consentFormsStatus) : null,
      });
    }

    // Seed session notes
    if (sd.additionalNotes) {
      workspace.updateWidgetData('session-notes', { notes: sd.additionalNotes });
    }

    // Map DB urgency string to PatientSidebar urgency type
    const mapUrgency = (u?: string): 'high' | 'medium' | 'low' => {
      const lower = u?.toLowerCase();
      if (lower === 'urgent' || lower === 'emergency' || lower === 'high') return 'high';
      if (lower === 'routine' || lower === 'low') return 'low';
      return 'medium';
    };

    // Build sidebar data from session
    setSurgeryRecommendation({
      procedure: procedures.length > 0
        ? procedures.map(p => `${p.eye}: ${p.surgeryName}`).join(', ')
        : ((sessionData as any).recommendedSurgery || 'Not specified'),
      urgency: mapUrgency((sessionData as any).urgency),
      doctorName: (sessionData as any).doctorName || '',
      notes: (sessionData as any).clinicalSummary || undefined,
    });
    // NOTE: isLoadingPatient stays true until patient API resolves below
  }, [sessionData]);

  // Load patient details + vitals from patient API
  useEffect(() => {
    if (!sessionData?.patientId) return;

    const api = getApi();
    const patientId = sessionData.patientId;

    // Load patient demographics
    api.get(`/patients/${patientId}`)
      .then(res => {
        const p = res.data;
        const dob = p.dateOfBirth || p.date_of_birth || p.dob;
        const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)) : undefined;
        setPatientData({
          id: p.id || patientId,
          firstName: p.firstName || p.first_name || '',
          lastName: p.lastName || p.last_name || '',
          age,
          gender: p.gender,
          mrn: p.medicalRecordNumber || p.medical_record_number || p.mrn || '',
          phone: p.phoneNumber || p.phone_number || p.phone || p.contactNumber || '',
          email: p.email || '',
          address: p.address || '',
          bloodGroup: p.bloodGroup || p.blood_group || '',
          dateOfBirth: dob || '',
          emergencyContactName: p.emergencyContactName || p.emergency_contact_name || '',
          emergencyContactPhone: p.emergencyContactPhone || p.emergency_contact_phone || '',
          emergencyContactRelation: p.emergencyContactRelationship || p.emergencyContactRelation || p.emergency_contact_relationship || p.emergency_contact_relation || '',
          photoUrl: p.photoUrl || p.photo_url || p.photoThumbnailUrl || p.photo_thumbnail_url || '',
        });
      })
      .catch(() => {
        // Fallback: build from session data so widgets always have a patientId
        setPatientData({
          id: patientId,
          firstName: (sessionData as any).patientName?.split(' ')[0] || 'Patient',
          lastName: (sessionData as any).patientName?.split(' ').slice(1).join(' ') || '',
          mrn: (sessionData as any).patientMrn || '',
          age: undefined,
          gender: '',
        });
      })
      .finally(() => {
        setIsLoadingPatient(false);
      });

    // Load latest vitals
    api.get(`/patients/${patientId}/vitals/latest`)
      .then(res => {
        setVitalsData(res.data);
      })
      .catch(() => {
        // Vitals are optional — no fallback needed
      });
  }, [sessionData?.patientId]);

  // Handle UPDATE_SESSION_PROCEDURES action from IOL / Package widgets
  const handleWidgetAction = (widgetId: string, action: { type: string; payload?: any; timestamp: Date }) => {
    if (action.type === 'UPDATE_SESSION_PROCEDURES' && action.payload?.recommendedProcedures) {
      // Persist updated procedures to session
      updateSessionMutation.mutate({
        id: sessionId,
        data: { recommendedProcedures: action.payload.recommendedProcedures },
      });
      // Also propagate to IOL widget
      if (widgetId !== 'iol-recommendation') {
        workspace.updateWidgetData('iol-recommendation', { recommendedProcedures: action.payload.recommendedProcedures });
      }
    }
    // Delegate to workspace context default handler
  };

  const handleBackToQueue = () => {
    router.push('/dashboard/counselor');
  };

  const handleNextStep = async () => {
    // Auto-save current step widget data before advancing (uses widgetId checks, not hardcoded step numbers)
    try {
      const savePayload: Record<string, any> = {};
      const stepWidgetIds = WORKFLOW_STEPS[currentStep - 1]?.widgetIds || [];

      if (stepWidgetIds.includes('surgery-scheduling')) {
        const surgWidgetData = workspace.widgets.find(w => w.widgetId === 'surgery-scheduling')?.data;
        if (surgWidgetData) {
          savePayload.surgeryTentativeDate = (surgWidgetData as any).surgeryDate || null;
          savePayload.surgeryTentativeSurgeonId = (surgWidgetData as any).surgeonId || null;
          savePayload.surgeryTentativeTimeSlot = (surgWidgetData as any).timeSlot || null;
          savePayload.surgeryTentativeEye = (surgWidgetData as any).eye || null;
        }
      }

      if (stepWidgetIds.includes('consent-signing')) {
        const consentWidgetData = workspace.widgets.find(w => w.widgetId === 'consent-signing')?.data;
        if (consentWidgetData) {
          savePayload.consentWitnessName = (consentWidgetData as any).witnessName || null;
          savePayload.consentWitnessRelation = (consentWidgetData as any).witnessRelation || null;
          savePayload.videoConsentRecorded = (consentWidgetData as any).videoConsentRecorded || false;
          savePayload.consentFormsStatus = (consentWidgetData as any).consentFormsStatus
            ? JSON.stringify((consentWidgetData as any).consentFormsStatus)
            : null;
        }
      }

      if (stepWidgetIds.includes('session-notes')) {
        const notesWidgetData = workspace.widgets.find(w => w.widgetId === 'session-notes')?.data;
        if (notesWidgetData) {
          savePayload.additionalNotes = (notesWidgetData as any).notes || null;
        }
      }

      if (Object.keys(savePayload).length > 0) {
        await updateSessionMutation.mutateAsync({ id: sessionId, data: savePayload });
      }
    } catch {
      // Auto-save failures are non-blocking — user can still navigate
    }
    if (currentStep < WORKFLOW_STEPS.length) setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCompleteSession = () => setShowCompletionModal(true);

  const handleSessionComplete = async (finalData: { patientIntention: string; confirmedSurgeryDate?: string; confirmedTimeSlot?: string }) => {
    try {
      const savePayload: Record<string, any> = {};

      // Save session notes
      const notesWidgetData = workspace.widgets.find(w => w.widgetId === 'session-notes')?.data;
      if (notesWidgetData) {
        savePayload.additionalNotes = (notesWidgetData as any).notes || null;
      }

      // Save patient decision
      if (finalData.patientIntention) {
        savePayload.patientIntention = finalData.patientIntention;
        const willingValues = new Set(['WillingNow', 'WillingWeek', 'WillingTwoWeeks', 'WillingMonth', 'WillingQuarter', 'WillingSixMonths', 'WillingCallToConfirm']);
        savePayload.patientAgreedToSurgery = willingValues.has(finalData.patientIntention);
        savePayload.pendingDecision = !willingValues.has(finalData.patientIntention);
      }

      // Save confirmed surgery booking if booked from modal
      if (finalData.confirmedSurgeryDate) {
        savePayload.surgeryTentativeDate = finalData.confirmedSurgeryDate;
      }
      if (finalData.confirmedTimeSlot) {
        savePayload.surgeryTentativeTimeSlot = finalData.confirmedTimeSlot;
      }

      if (Object.keys(savePayload).length > 0) {
        await updateSessionMutation.mutateAsync({ id: sessionId, data: savePayload });
      }

      await counselingSessionsApi.complete(sessionId);
    } catch (err) {
      console.error('Failed to complete session:', err);
      throw err;
    }
    router.push('/dashboard/counselor');
  };

  // Keyboard shortcuts: Ctrl+Enter for next/complete, Escape to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (currentStep < WORKFLOW_STEPS.length) {
          handleNextStep();
        } else {
          handleCompleteSession();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, WORKFLOW_STEPS.length]);

  // currentStep is 1-based position in the filtered WORKFLOW_STEPS array
  const currentStepConfig = WORKFLOW_STEPS[currentStep - 1] || WORKFLOW_STEPS[0];
  const progressPercentage = (currentStep / WORKFLOW_STEPS.length) * 100;

  // Per-step primary widget IDs — used for confirm gating the Next button
  const STEP_PRIMARY_WIDGETS = [
    'preoperative-instructions', // step 1
    'iol-recommendation',         // step 2
    'imaging-order',              // step 3
    'surgery-scheduling',         // step 4 (optional — bypass handled by currentStepConfig.optional)
    'payment-mode-selection',     // step 5
    'session-notes',              // step 6
  ];

  // Map WORKFLOW_STEPS index (0-based) to primary widget ID
  const currentPrimaryWidgetId = (() => {
    const step = WORKFLOW_STEPS[currentStep - 1];
    if (!step) return null;
    // Find first matching primaryWidget for this step
    return STEP_PRIMARY_WIDGETS.find(wId => step.widgetIds.includes(wId)) ?? null;
  })();
  const currentPrimaryWidgetData = workspace.widgets.find(w => w.widgetId === currentPrimaryWidgetId)?.data;
  const currentStepConfirmed = !!currentStepConfig?.optional
    || !!(currentPrimaryWidgetData as any)?.confirmed
    || !!(currentPrimaryWidgetData as any)?.isConfirmed;

  // Read live widget state (updated in real-time as users make selections)
  const pkgWidgetData = workspace.widgets.find(w => w.widgetId === 'package-selection')?.data;
  const iolWidgetData = workspace.widgets.find(w => w.widgetId === 'iol-recommendation')?.data;
  const surgeryWidget = workspace.widgets.find(w => w.widgetId === 'surgery-scheduling')?.data;
  const paymentWidget = workspace.widgets.find(w => w.widgetId === 'payment-mode-selection')?.data;
  const imagingWidget = workspace.widgets.find(w => w.widgetId === 'imaging-order')?.data;

  // Derive package summary from procedurePackages map
  const procedurePackagesMap = (pkgWidgetData?.procedurePackages as Record<string, any>) || {};
  const pkgEntries = Object.values(procedurePackagesMap);
  const packageNames = pkgEntries.map((p: any) => p.packageName).filter(Boolean).join(', ');
  const packageTotal = pkgEntries.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

  // Derive IOL summary from iolSelections map
  const iolSelectionsMap = (iolWidgetData?.iolSelections as Record<string, any>) || {};
  const iolNames = Object.values(iolSelectionsMap)
    .filter((s: any) => s?.iolModelName)
    .map((s: any) => s.iolModelName as string)
    .join(', ');

  // Build procedure rows for PDF: merge IOL selections into procedure list
  const pdfProcedures = procedures.length > 0
    ? procedures.map(p => {
        const key = `${p.eye}-${p.surgeryTypeId}`;
        const iolSel = iolSelectionsMap[key] || Object.values(iolSelectionsMap)[0];
        const pkgSel = procedurePackagesMap[key] || Object.values(procedurePackagesMap)[0];
        return {
          eye: p.eye,
          procedureName: p.surgeryName,
          iolModel: (iolSel as any)?.iolModelName || undefined,
          packageName: (pkgSel as any)?.packageName || undefined,
          amount: (pkgSel as any)?.amount || 0,
        };
      })
    : pkgEntries.length > 0
      ? [{ eye: 'Both', procedureName: packageNames || 'Surgery', iolModel: iolNames || undefined, packageName: packageNames || undefined, amount: packageTotal }]
      : (sessionData as any)?.recommendedSurgery
        ? [{ eye: 'Both', procedureName: (sessionData as any).recommendedSurgery as string, iolModel: iolNames || undefined, packageName: packageNames || undefined, amount: packageTotal > 0 ? packageTotal : undefined }]
        : [];

  // Format DOB as "01 Jan 1999 (26 yrs)"
  const formatDOB = (dob?: string) => {
    if (!dob) return '';
    try {
      const d = new Date(dob);
      const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
      return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} (${age} yrs)`;
    } catch { return dob; }
  };

  const sessionSummary = {
    // Patient info
    patientName: patientData
      ? `${patientData.firstName} ${patientData.lastName}`.trim()
      : ((sessionData as any)?.patientName || 'Patient'),
    mrn: patientData?.mrn || sessionData?.patientMRN || '',
    patientPhone: patientData?.phone || sessionData?.patientPhone || '',
    patientEmail: patientData?.email || '',
    patientDOB: formatDOB(patientData?.dateOfBirth),
    patientAge: patientData?.age,
    patientGender: patientData?.gender || '',
    patientAddress: patientData?.address || '',

    // Hospital / branch info
    hospitalName: branchData?.name || 'Hospital',
    hospitalAddress: branchData?.address || undefined,
    hospitalPhone: branchData?.phoneNumber || undefined,
    hospitalLogoBase64: logoBase64,

    // Session info
    sessionId,
    sessionNumber: sessionData?.sessionNumber || '',
    sessionDate: sessionData?.sessionDate
      ? new Date(sessionData.sessionDate).toLocaleDateString('en-IN')
      : new Date().toLocaleDateString('en-IN'),
    patientType: sessionData?.patientType || '',

    // Insurance info (only relevant for Insurance/CoPay)
    insuranceProvider: (sessionData as any)?.insuranceProvider || '',
    tpaName: (sessionData as any)?.tpaName || '',
    policyNumber: (sessionData as any)?.policyNumber || '',
    corporateName: (sessionData as any)?.corporateName || '',

    // Clinical
    diagnosisOD: sessionData?.diagnosis || '',
    diagnosisOS: sessionData?.diagnosis || '',
    vitalsIopRight: sessionData?.iopRight,
    vitalsIopLeft: sessionData?.iopLeft,
    vitalsVaRight: sessionData?.visualAcuityRight || '',
    vitalsVaLeft: sessionData?.visualAcuityLeft || '',

    // Personnel — doctorName from surgery scheduler or session data
    doctorName: (surgeryWidget as any)?.surgeonName || (sessionData as any)?.doctorName || '',
    counsellorName: sessionData?.counseledByUserName || '',
    // OR booking support fields
    surgeonId: (surgeryWidget as any)?.surgeonId || '',
    patientId: patientData?.id || sessionData?.patientId || '',
    branchId: sessionData?.branchId || '',

    // Surgery name (from DB) — used as procedure fallback
    surgeryName: (sessionData as any)?.recommendedSurgery || '',
    surgeryEye: procedures.length > 0
      ? [...new Set(procedures.map(p => p.eye as string))].join(', ')
      : '',

    // Selections
    packageSelected: packageNames || 'Not selected',
    iolSelected: iolNames || 'Not selected',
    paymentType: (paymentWidget as any)?.selectedPaymentMode || sessionData?.patientType || 'Not selected',
    totalAmount: packageTotal > 0 ? packageTotal : Number((sessionData as any)?.packageAmount || 0),

    // Surgery scheduling
    surgeryDate: (surgeryWidget as any)?.surgeryDate || sessionData?.tentativeSurgeryDate || '',
    nextSurgeryDate: (surgeryWidget as any)?.surgeryDate
      ? new Date((surgeryWidget as any).surgeryDate).toLocaleDateString('en-IN')
      : sessionData?.tentativeSurgeryDate
        ? new Date(sessionData.tentativeSurgeryDate).toLocaleDateString('en-IN')
        : undefined,
    nextSurgeryTime: (surgeryWidget as any)?.timeSlot || undefined,

    // Patient decision (read from DB only — captured in completion modal)
    patientIntention: (sessionData as any)?.patientIntention || '',

    // Investigations
    investigationCount: ((imagingWidget as any)?.orders || []).length,

    // Imaging orders from Step 3 widget
    imagingOrders: ((imagingWidget as any)?.orders || []) as Array<{
      modality: string; eye: string; urgency: string; estimatedCost?: number;
    }>,

    // PDF procedure rows
    procedures: pdfProcedures,

    // Pre-op instructions
    preOpInstructions: [
      'Fast for 6 hours — no food or water before surgery',
      'Continue prescribed eye drops until the day of surgery',
      'Arrange an escort — no self-driving post-surgery',
      'Wear loose, comfortable clothing on the day',
      'Bring all current medications for review',
      'Bring all previous eye reports and investigation records',
    ],
  };

  return (
    <>
    <div className="flex h-full bg-gray-100 overflow-hidden p-3 gap-3">
      {/* Left Column — back button pill + patient sidebar card + history timeline */}
      <div className="w-[22.5%] flex-shrink-0 h-full flex flex-col gap-2 min-h-0">
        {/* Back to Queue */}
        <button
          onClick={handleBackToQueue}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex-shrink-0 self-start"
        >
          ← Back to Queue
        </button>
        {/* Patient details floating card */}
        <div className="rounded-2xl overflow-hidden shadow-md flex-shrink-0">
          <PatientSidebar
            patient={patientData}
            vitals={vitalsData}
            surgeryRecommendation={surgeryRecommendation}
            isLoading={isLoadingPatient}
          />
        </div>
        {/* Session history timeline */}
        {sessionHistory.length > 0 && (
          <div className="flex-1 overflow-y-auto rounded-2xl bg-white shadow-md min-h-0 p-3">
            <PatientHistoryTimeline
              sessions={sessionHistory}
              currentSessionId={sessionId}
              isLoading={isHistoryLoading}
            />
          </div>
        )}
      </div>

      {/* Right Area - Workflow */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
            {/* Header — floating widget card approach */}
            <div className="px-4 pt-3 pb-3 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm px-4 py-2.5">
                <div className="flex items-center gap-2 mb-2.5">
                  {/* Step tabs — display only, not clickable. Connector lines stretch to fill full width */}
                  <div className="flex-1 flex items-center min-w-0">
                    {WORKFLOW_STEPS.flatMap((step, index) => {
                      const items: React.ReactNode[] = [];
                      if (index > 0) {
                        items.push(
                          <div key={`conn-${index}`} className={`flex-1 h-px min-w-[4px] ${
                            index < currentStep ? 'bg-green-300' : 'bg-gray-200'
                          }`} />
                        );
                      }
                      items.push(
                        <div
                          key={step.id}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap flex-shrink-0 ${
                            index + 1 === currentStep
                              ? 'bg-blue-600 text-white shadow-sm'
                              : index + 1 < currentStep
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-400'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                            index + 1 < currentStep
                              ? 'bg-green-500 text-white'
                              : index + 1 === currentStep
                              ? 'bg-white/25 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {index + 1 < currentStep ? '✓' : index + 1}
                          </span>
                          {step.name}
                        </div>
                      );
                      return items;
                    })}
                  </div>

                </div>

                {/* Slim progress bar inside card */}
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Workflow Content Area — fixed height, each widget card scrolls internally */}
            <div className="flex-1 min-h-0 px-4 pb-3 bg-gray-100 flex flex-col">
              {(() => {
                const filtered = workspace.widgets.filter(w => currentStepConfig.widgetIds.includes(w.widgetId));
                if (filtered.length === 0) {
                  return (
                    <div className="flex-1 min-h-0 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No widgets loaded for this step</p>
                        <p className="text-sm text-gray-400 mt-2">Expected: {currentStepConfig.widgetIds.join(', ')}</p>
                        <p className="text-xs text-gray-400 mt-1">Loaded: {workspace.widgets.map(w => w.widgetId).join(', ') || 'none'}</p>
                      </div>
                    </div>
                  );
                }
                const isMulti = filtered.length > 1;
                return (
                  <div
                    className={`flex-1 min-h-0 ${isMulti ? 'grid gap-3' : 'flex flex-col'}`}
                    style={isMulti ? { gridTemplateColumns: `repeat(${filtered.length}, 1fr)` } : undefined}
                  >
                    {filtered.map((widget, index) => {
                      const WidgetComponent = getWidgetComponent(widget.widgetId);
                      if (!WidgetComponent) {
                        return (
                          <div key={`${widget.widgetId}-${index}`} className="rounded-xl border border-yellow-300 bg-yellow-50 flex items-center justify-center p-4 min-h-0">
                            <p className="text-yellow-700 text-sm">Widget &quot;{widget.widgetId}&quot; not found</p>
                          </div>
                        );
                      }
                      return (
                        <div key={`${widget.widgetId}-${index}`} className="flex-1 min-h-0 rounded-xl bg-white shadow-sm overflow-y-auto hide-scrollbar">
                          <WidgetComponent
                            widgetId={widget.widgetId}
                            patientId={patientData?.id}
                            sessionId={sessionId}
                            data={widget.data}
                            config={widget.config}
                            sessionStage={'pre-counseling' as any}
                            size="full"
                            isMinimized={false}
                            isCollapsed={false}
                            onChange={() => {}}
                            onDataChange={(newData: any) => workspace.updateWidgetData(widget.widgetId, newData)}
                            onAction={(a) => handleWidgetAction(widget.widgetId, a)}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer Navigation — floating white card matching header */}
            <div className="px-4 pb-3 pt-1 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm px-4 py-2.5 flex items-center justify-between gap-3">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  ← Previous
                </button>

                {/* Step progress indicator */}
                <div className="flex-1 flex items-center justify-center gap-1">
                  {WORKFLOW_STEPS.map((step, index) => (
                    <div
                      key={step.id}
                      className={`h-1.5 rounded-full transition-all ${
                        index + 1 < currentStep ? 'bg-green-500 w-6' :
                        index + 1 === currentStep ? 'bg-blue-500 w-10' : 'bg-gray-200 w-4'
                      }`}
                      title={step.name}
                    />
                  ))}
                </div>

                {currentStep < WORKFLOW_STEPS.length ? (
                  <button
                    onClick={handleNextStep}
                    disabled={!currentStepConfirmed}
                    className="px-5 py-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    title={!currentStepConfirmed ? 'Complete this step to continue' : undefined}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteSession}
                    className="px-5 py-1.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex-shrink-0"
                  >
                    Complete Session
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
    <SessionCompletionModal
      isOpen={showCompletionModal}
      onClose={() => setShowCompletionModal(false)}
      sessionSummary={sessionSummary}
      onComplete={handleSessionComplete}
    />
    </>
  );
}

/**
 * Main wrapper component
 */
export default function SessionWorkflowPage() {
  const params = useParams();
  const sessionId = params.id as string;

  return (
    <ProtectedRoute requiredPermissions={['counselor.view']}>
      <CounselingWorkspaceProvider sessionId={sessionId}>
        <SessionWorkflowContent sessionId={sessionId} />
      </CounselingWorkspaceProvider>
    </ProtectedRoute>
  );
}
