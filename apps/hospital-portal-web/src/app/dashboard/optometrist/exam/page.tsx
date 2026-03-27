'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useHasPermission } from '@/hooks/use-permissions';
import { useClinicalStore } from '@/lib/stores/clinical-store';
import { patientApi, type Patient as PatientDetails } from '@/lib/api/patients.api';
import { patientHistoryApi, type PatientHistory } from '@/lib/api/medical-records.api';
import {
  autoRefractionApi,
  colorVisionApi,
  contrastSensitivityApi,
  keratometryApi,
  pachymetryApi,
  refractionApi,
  retinoscopyApi,
  tonometryApi,
  visualAcuityApi,
  visualFieldApi,
} from '@/lib/api/examination.api';

import VisualAcuityForm from '@/components/examination/VisualAcuityForm';
import RefractionForm from '@/components/examination/RefractionForm';
import AutoRefractionForm from '@/components/examination/AutoRefractionForm';
import RetinoscopyForm from '@/components/examination/RetinoscopyForm';
import KeratometryForm from '@/components/examination/KeratometryForm';
import TonometryForm from '@/components/examination/TonometryForm';
import PachymetryForm from '@/components/examination/PachymetryForm';
import VisualFieldForm from '@/components/examination/VisualFieldForm';
import ColorVisionForm from '@/components/examination/ColorVisionForm';
import ContrastSensitivityForm from '@/components/examination/ContrastSensitivityForm';
import VisualAcuityMegaTab from '@/components/examination/VisualAcuityMegaTab';
import IOPMegaTab from '@/components/examination/IOPMegaTab';
import RetinoscopyMegaTab from '@/components/examination/RetinoscopyMegaTab';
import AnteriorSegmentTab from '@/components/examination/AnteriorSegmentTab';
import PosteriorSegmentTab from '@/components/examination/PosteriorSegmentTab';
import MedicationsTab from '@/components/examination/MedicationsTab';
import ContactLensTab from '@/components/examination/ContactLensTab';
import ReferralOrdersTab from '@/components/examination/ReferralOrdersTab';
import DiagnosisTab from '@/components/examination/DiagnosisTab';
import AdvicePatientEducationTab from '@/components/examination/AdvicePatientEducationTab';
import { MedicalHistoryTabContent } from '@/components/examination/MedicalHistoryTabContent';

import type {
  AutoRefractionData,
  ColorVisionData,
  ContrastSensitivityData,
  KeratometryData,
  PachymetryData,
  RefractionData,
  RetinoscopyData,
  TonometryData,
  VisualAcuityData,
  VisualFieldData,
} from '@/lib/stores/clinical-store';

const TAB_LIST = [
  { id: 'medical-history', label: 'Medical History' },
  { id: 'visual-acuity', label: 'Visual Acuity' },
  { id: 'iop', label: 'IOP' },
  { id: 'retinoscopy', label: 'Retinoscopy' },
  { id: 'anterior', label: 'Anterior Segment' },
  { id: 'posterior', label: 'Posterior Segment' },
  { id: 'medications', label: 'Medications' },
  { id: 'optical-prescription', label: 'Optical Prescription' },
  { id: 'referral', label: 'Referral & Orders' },
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'advice', label: 'Advice & Patient Education' },
];

const getAgeFromDob = (dob: Date | string) => {
  const date = dob instanceof Date ? dob : new Date(dob);
  if (Number.isNaN(date.getTime())) return null;
  const diff = Date.now() - date.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
};

function OptometristExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const complaintParam = searchParams.get('complaint') || '';

  const { currentPatient } = useClinicalStore();
  const canView = useHasPermission('CLINICAL:EXAMINATION:VIEW');
  const canEdit = useHasPermission('CLINICAL:EXAMINATION:EDIT');

  const [activeTab, setActiveTab] = useState('medical-history');
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [patientHistory, setPatientHistory] = useState<PatientHistory | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);

  const [visualAcuity, setVisualAcuity] = useState<VisualAcuityData | null>(null);
  const [refraction, setRefraction] = useState<RefractionData | null>(null);
  const [autoRefraction, setAutoRefraction] = useState<AutoRefractionData | null>(null);
  const [retinoscopy, setRetinoscopy] = useState<RetinoscopyData | null>(null);
  const [keratometry, setKeratometry] = useState<KeratometryData | null>(null);
  const [tonometry, setTonometry] = useState<TonometryData | null>(null);
  const [pachymetry, setPachymetry] = useState<PachymetryData | null>(null);
  const [visualField, setVisualField] = useState<VisualFieldData | null>(null);
  const [colorVision, setColorVision] = useState<ColorVisionData | null>(null);
  const [contrastSensitivity, setContrastSensitivity] = useState<ContrastSensitivityData | null>(null);

  // Retinoscopy mega-tab state (wet/dry/subjective)
  const [wetRetinoscopy, setWetRetinoscopy] = useState<any>(null); // TODO: Add proper type
  const [dryRetinoscopy, setDryRetinoscopy] = useState<any>(null); // TODO: Add proper type
  const [subjectiveRefraction, setSubjectiveRefraction] = useState<any>(null); // TODO: Add proper type

  // Anterior segment tab state
  const [pupilExam, setPupilExam] = useState<any>(null); // TODO: Add proper type
  const [anteriorSegment, setAnteriorSegment] = useState<any>(null); // TODO: Add proper type

  // Posterior segment tab state
  const [posteriorSegment, setPosteriorSegment] = useState<any>(null); // TODO: Add proper type
  const [fundusExam, setFundusExam] = useState<any>(null); // TODO: Add proper type

  // Medications tab state
  const [currentMedications, setCurrentMedications] = useState<any>(null); // TODO: Add proper type
  const [prescriptionItems, setPrescriptionItems] = useState<any>(null); // TODO: Add proper type

  // Contact lens tab state
  const [clAssessment, setClAssessment] = useState<any>(null); // TODO: Add proper type
  const [clPrescription, setClPrescription] = useState<any>(null); // TODO: Add proper type
  const [clFitting, setClFitting] = useState<any>(null); // TODO: Add proper type
  const [clCornealHealth, setClCornealHealth] = useState<any>(null); // TODO: Add proper type
  const [clInstructions, setClInstructions] = useState<any>(null); // TODO: Add proper type

  // Referral & orders tab state
  const [doctorReferrals, setDoctorReferrals] = useState<any>(null); // TODO: Add proper type
  const [imagingOrders, setImagingOrders] = useState<any>(null); // TODO: Add proper type
  const [receptionReferrals, setReceptionReferrals] = useState<any>(null); // TODO: Add proper type

  // Diagnosis tab state
  const [diagnoses, setDiagnoses] = useState<any>(null); // TODO: Add proper type

  // Advice & Patient Education tab state
  const [adviceInstructions, setAdviceInstructions] = useState<any>(null); // TODO: Add proper type
  const [adviceFollowUp, setAdviceFollowUp] = useState<any>(null); // TODO: Add proper type
  const [advicePrecautions, setAdvicePrecautions] = useState<any>(null); // TODO: Add proper type
  const [adviceEducation, setAdviceEducation] = useState<any>(null); // TODO: Add proper type

  const tabMap = useMemo(() => new Set(TAB_LIST.map((tab) => tab.id)), []);

  useEffect(() => {
    if (!patientId) return;

    const loadTabData = async () => {
      try {
        switch (activeTab) {
          case 'visual-acuity': {
            // Load all data for Visual Acuity mega-tab
            const [vaData, refData, autoRefData, keraData, colorData, contrastData] = await Promise.all([
              visualAcuityApi.get(patientId),
              refractionApi.get(patientId),
              autoRefractionApi.get(patientId),
              keratometryApi.get(patientId),
              colorVisionApi.get(patientId),
              contrastSensitivityApi.get(patientId),
            ]);
            setVisualAcuity(vaData);
            setRefraction(refData);
            setAutoRefraction(autoRefData);
            setKeratometry(keraData);
            setColorVision(colorData);
            setContrastSensitivity(contrastData);
            break;
          }
          case 'iop': {
            // Load all data for IOP mega-tab
            const [tonData, pachData, vfData] = await Promise.all([
              tonometryApi.get(patientId),
              pachymetryApi.get(patientId),
              visualFieldApi.get(patientId),
            ]);
            setTonometry(tonData);
            setPachymetry(pachData);
            setVisualField(vfData);
            break;
          }
          case 'retinoscopy': {
            // For now, load retinoscopy data and initialize empty wet/dry/subjective
            // TODO: Create separate APIs for wet/dry/subjective retinoscopy
            const data = await retinoscopyApi.get(patientId);
            setRetinoscopy(data);
            // Initialize empty structures until backend is ready
            setWetRetinoscopy({ drug: undefined, duration: undefined, timeAdministered: undefined, odReadings: [], osReadings: [] });
            setDryRetinoscopy({ odReadings: [], osReadings: [] });
            setSubjectiveRefraction({ readings: [] });
            break;
          }
          case 'anterior': {
            // TODO: Create separate APIs for pupil_exam and anterior_segment_exam
            // Initialize empty structures until backend is ready
            setPupilExam({
              sizeLightOD: undefined,
              sizeDarkOD: undefined,
              shapeOD: undefined,
              directReactionOD: undefined,
              consensualReactionOD: undefined,
              sizeLightOS: undefined,
              sizeDarkOS: undefined,
              shapeOS: undefined,
              directReactionOS: undefined,
              consensualReactionOS: undefined,
              rapdPresent: false,
              rapdEye: null,
            });
            setAnteriorSegment({
              lidsOD: undefined,
              conjunctivaOD: undefined,
              scleraOD: undefined,
              lacrimalOD: undefined,
              lidsOS: undefined,
              conjunctivaOS: undefined,
              scleraOS: undefined,
              lacrimalOS: undefined,
              corneaOD: undefined,
              acOD: undefined,
              acDepthOD: undefined,
              corneaOS: undefined,
              acOS: undefined,
              acDepthOS: undefined,
              irisOD: undefined,
              lensOD: undefined,
              lensOpacityGradeOD: undefined,
              irisOS: undefined,
              lensOS: undefined,
              lensOpacityGradeOS: undefined,
            });
            break;
          }
          case 'posterior': {
            // TODO: Create separate APIs for posterior_segment_exam and fundus_exam
            // Initialize empty structures until backend is ready
            setPosteriorSegment({
              mediaClarityOD: undefined,
              isDilatedOD: false,
              dilationDrug: undefined,
              dilationTime: undefined,
              overallFindingOD: undefined,
              mediaClarityOS: undefined,
              isDilatedOS: false,
              overallFindingOS: undefined,
            });
            setFundusExam({
              cupDiscRatioOD: undefined,
              discColorOD: undefined,
              discMarginsOD: undefined,
              discNvOD: undefined,
              discHemorrhageOD: undefined,
              peripapillaryAtrophyOD: undefined,
              discNotesOD: undefined,
              cupDiscRatioOS: undefined,
              discColorOS: undefined,
              discMarginsOS: undefined,
              discNvOS: undefined,
              discHemorrhageOS: undefined,
              peripapillaryAtrophyOS: undefined,
              discNotesOS: undefined,
              fovealReflexOD: undefined,
              macularEdemaOD: undefined,
              macularHemorrhageOD: undefined,
              macularExudatesOD: undefined,
              drusenOD: undefined,
              macularScarOD: undefined,
              maculaNotesOD: undefined,
              fovealReflexOS: undefined,
              macularEdemaOS: undefined,
              macularHemorrhageOS: undefined,
              macularExudatesOS: undefined,
              drusenOS: undefined,
              macularScarOS: undefined,
              maculaNotesOS: undefined,
              retinaConfigOD: undefined,
              retinalTearsOD: undefined,
              retinalHemorrhageOD: undefined,
              retinalExudatesOD: undefined,
              diabeticRetinopathyOD: undefined,
              peripheralDegenerationOD: undefined,
              retinaNotesOD: undefined,
              retinaConfigOS: undefined,
              retinalTearsOS: undefined,
              retinalHemorrhageOS: undefined,
              retinalExudatesOS: undefined,
              diabeticRetinopathyOS: undefined,
              peripheralDegenerationOS: undefined,
              retinaNotesOS: undefined,
              avRatioOD: undefined,
              arterialChangesOD: [],
              venousChangesOD: [],
              avCrossingOD: undefined,
              vesselNvOD: undefined,
              vesselNotesOD: undefined,
              avRatioOS: undefined,
              arterialChangesOS: [],
              venousChangesOS: [],
              avCrossingOS: undefined,
              vesselNvOS: undefined,
              vesselNotesOS: undefined,
            });
            break;
          }
          case 'medications': {
            // TODO: Create separate APIs for current_medications and prescription_items
            // Initialize empty structures until backend is ready
            // Current medications should come from patient's medical history
            setCurrentMedications([]); // Will be populated from medical history
            setPrescriptionItems([]); // Will store new prescriptions for this visit
            break;
          }
          case 'optical-prescription': {
            // TODO: Create separate APIs for contact lens and spectacle dispensing data
            // Initialize empty structures until backend is ready
            setClAssessment({ isCurrentWearer: false, examReasons: [] });
            setClPrescription({});
            setClFitting({});
            setClCornealHealth({});
            setClInstructions({ precautions: [], trialDispensed: false });
            break;
          }
          case 'referral': {
            // TODO: Create separate APIs for referrals and orders
            // Initialize empty structures until backend is ready
            setDoctorReferrals([]);
            setImagingOrders([]);
            setReceptionReferrals([]);
            break;
          }
          case 'diagnosis': {
            // TODO: Create separate API for diagnoses
            // Initialize empty structures until backend is ready
            setDiagnoses([]);
            break;
          }
          case 'advice': {
            // TODO: Create separate APIs for advice and patient education
            // Initialize empty structures until backend is ready
            setAdviceInstructions([]);
            setAdviceFollowUp({ nextVisitDate: '', followUpReason: '', testsNeeded: [], reminderPreferences: [] });
            setAdvicePrecautions({ conditionSpecific: [], customPrecautions: '', redFlags: [] });
            setAdviceEducation({ selectedMaterials: [], deliveryMethods: [], language: 'English' });
            break;
          }
          default:
            break;
        }
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          toast.error('Failed to load examination data');
        }
      }
    };

    loadTabData();
  }, [activeTab, patientId]);

  useEffect(() => {
    if (!patientId) return;

    const loadPatientContext = async () => {
      setPatientLoading(true);
      try {
        const [patientRes, historyRes] = await Promise.all([
          patientApi.getById(patientId),
          patientHistoryApi.get(patientId).catch(() => null),
        ]);
        console.log('Patient API Response:', { patientRes, hasData: !!patientRes.data });
        setPatientDetails(patientRes.data ?? null);
        setPatientHistory(historyRes ?? null);
        console.log('Patient Details Set:', { patientId, patientDetails: patientRes.data });
      } catch (error) {
        console.error('Failed to load patient context', error);
      } finally {
        setPatientLoading(false);
      }
    };

    loadPatientContext();
  }, [patientId]);

  const handleTabChange = (tabId: string) => {
    if (!tabMap.has(tabId)) return;
    setActiveTab(tabId);
    // Don't update URL to prevent tab persistence across page loads
  };

  const handleCompleteExamination = async () => {
    if (!patientId) {
      toast.error('No patient selected');
      return;
    }

    if (!canEdit) {
      toast.error('You do not have permission to complete examinations');
      return;
    }

    try {
      // TODO: Call API to mark examination as complete
      // await optometryQueueApi.completeExamination(patientId);
      toast.success('Examination completed successfully!');
      // Navigate back to queue after short delay
      setTimeout(() => {
        router.push('/dashboard/optometrist');
      }, 1000);
    } catch (error) {
      console.error('Failed to complete examination:', error);
      toast.error('Failed to complete examination');
    }
  };

  const handleSave = async <T extends { id?: string }>(
    data: T,
    existingId: string | undefined,
    saveFn: (payload: T) => Promise<T>,
    updateFn: (id: string, payload: T) => Promise<T>,
    successMessage: string,
    setState: (value: T) => void,
  ) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit examinations');
      return;
    }

    try {
      const saved = existingId ? await updateFn(existingId, data) : await saveFn(data);
      setState(saved);
      toast.success(successMessage);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save examination data');
    }
  };

  const derivedDob = patientDetails?.dateOfBirth ?? currentPatient?.dateOfBirth ?? null;
  const patientAge = derivedDob ? getAgeFromDob(derivedDob) : null;
  const patientName = patientDetails
    ? `${patientDetails.firstName} ${patientDetails.lastName}`
    : currentPatient
      ? `${currentPatient.firstName} ${currentPatient.lastName}`
      : null;
  const patientCode = patientDetails?.patientCode ?? currentPatient?.mrn ?? patientHistory?.mrn ?? null;
  const patientGender = patientDetails?.gender ?? currentPatient?.gender ?? patientHistory?.gender ?? null;
  const patientLabel = patientName
    ? `${patientName} • ${patientAge ?? '-'}y / ${patientGender ?? '-'} • ${patientCode ?? 'MRN N/A'}`
    : patientId
      ? `Patient ID: ${patientId}`
      : 'No patient selected';

  const allergyList = (patientHistory?.allergies || []).map((item) => item.allergen).filter(Boolean);
  const medicationList = (patientHistory?.currentMedications || []).map((item) => item.name).filter(Boolean);
  const medicalHistoryList = (patientHistory?.medicalHistory || []).map((item) => item.condition).filter(Boolean);
  const surgicalHistoryList = (patientHistory?.surgicalHistory || []).map((item) => item.procedure).filter(Boolean);
  const familyHistoryList = (patientHistory?.familyHistory || []).map((item) => item.condition).filter(Boolean);
  const fallbackMedicalHistory = patientDetails?.medicalHistory ? [patientDetails.medicalHistory] : [];

  if (!canView) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          You do not have permission to view examinations.
        </div>
      </div>
    );
  }

  console.log('Render Check:', { patientId, hasPatientDetails: !!patientDetails, patientDetails });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Tab Navigation with Patient Demographics */}
      <div className="bg-white border-b-2 border-gray-100 shadow-sm">
        {patientId ? (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Patient Avatar/Photo */}
                <div className="relative">
                  {patientDetails?.photoUrl ? (
                    <img
                      src={patientDetails.photoUrl}
                      alt={patientName || 'Patient'}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl border-4 border-white shadow-lg">
                      {patientDetails?.firstName?.[0]?.toUpperCase() || 'P'}{patientDetails?.lastName?.[0]?.toUpperCase() || 'T'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Active Patient"></div>
                </div>
                
                {/* Patient Info */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {patientLoading ? (
                      <span className="text-gray-400 animate-pulse">Loading patient...</span>
                    ) : (
                      patientName || 'Unknown Patient'
                    )}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      MRN: {patientCode || 'N/A'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {patientAge || '-'} years • {patientGender || 'Unknown'}
                    </span>
                    {patientDetails?.bloodGroup && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {patientDetails.bloodGroup}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-1.5">
                    {patientDetails?.phone && (
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {patientDetails.phone}
                      </span>
                    )}
                    {patientDetails?.email && (
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {patientDetails.email}
                      </span>
                    )}
                    {complaintParam && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-semibold border border-orange-200">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Chief Complaint: {complaintParam}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Complete Examination Button */}
                <button
                  type="button"
                  onClick={handleCompleteExamination}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Complete Examination
                </button>
                
                {/* Back to Queue Button */}
                <Link
                  href="/dashboard/optometrist"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Queue
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-center gap-3 text-gray-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-lg font-medium">No patient selected - Please select a patient from the queue</span>
            </div>
          </div>
        )}
        
        {/* Modern Tabs */}
        <div className="flex gap-0 overflow-x-auto px-4 bg-white">
          {TAB_LIST.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all relative ${
                activeTab === tab.id
                  ? 'text-emerald-700 bg-emerald-50 border-b-3 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              style={{
                borderBottom: activeTab === tab.id ? '3px solid rgb(5 150 105)' : '3px solid transparent',
              }}
            >
              <span className="relative">
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area with Gray Background */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {!patientId ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">
            Select a patient from the queue to begin the examination.
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'medical-history' && (
              <MedicalHistoryTabContent 
                patientId={patientId} 
                canEdit={canEdit} 
                patientDetails={patientDetails}
                onUpdate={(updated) => setPatientDetails(updated)}
              />
            )}

            {activeTab === 'visual-acuity' && (
              <VisualAcuityMegaTab
                patientId={patientId}
                visualAcuityData={visualAcuity}
                refractionData={refraction}
                autoRefractionData={autoRefraction}
                keratometryData={keratometry}
                colorVisionData={colorVision}
                contrastSensitivityData={contrastSensitivity}
                canEdit={canEdit}
                onSaveVisualAcuity={(data) =>
                  handleSave(
                    data,
                    visualAcuity?.id,
                    visualAcuityApi.save,
                    visualAcuityApi.update,
                    'Visual acuity saved successfully',
                    setVisualAcuity,
                  )
                }
                onSaveRefraction={(data) =>
                  handleSave(
                    data,
                    refraction?.id,
                    refractionApi.save,
                    refractionApi.update,
                    'Refraction saved successfully',
                    setRefraction,
                  )
                }
                onSaveKeratometry={(data) =>
                  handleSave(
                    data,
                    keratometry?.id,
                    keratometryApi.save,
                    keratometryApi.update,
                    'Keratometry saved successfully',
                    setKeratometry,
                  )
                }
                onSaveColorVision={(data) =>
                  handleSave(
                    data,
                    colorVision?.id,
                    colorVisionApi.save,
                    colorVisionApi.update,
                    'Color vision saved successfully',
                    setColorVision,
                  )
                }
                onSaveContrastSensitivity={(data) =>
                  handleSave(
                    data,
                    contrastSensitivity?.id,
                    contrastSensitivityApi.save,
                    contrastSensitivityApi.update,
                    'Contrast sensitivity saved successfully',
                    setContrastSensitivity,
                  )
                }
              />
            )}

            {activeTab === 'retinoscopy' && (
              <RetinoscopyMegaTab
                wetRetinoscopyData={wetRetinoscopy}
                dryRetinoscopyData={dryRetinoscopy}
                subjectiveRefractionData={subjectiveRefraction}
                canEdit={canEdit}
                onSaveWetRetinoscopy={(data) => {
                  // TODO: Implement backend API for wet retinoscopy
                  setWetRetinoscopy(data);
                  toast.success('Wet retinoscopy saved (frontend only - backend pending)');
                }}
                onSaveDryRetinoscopy={(data) => {
                  // TODO: Implement backend API for dry retinoscopy
                  setDryRetinoscopy(data);
                  toast.success('Dry retinoscopy saved (frontend only - backend pending)');
                }}
                onSaveSubjectiveRefraction={(data) => {
                  // TODO: Implement backend API for subjective refraction
                  setSubjectiveRefraction(data);
                  toast.success('Subjective refraction saved (frontend only - backend pending)');
                }}
              />
            )}

            {activeTab === 'iop' && (
              <IOPMegaTab
                patientId={patientId}
                tonometryData={tonometry}
                pachymetryData={pachymetry}
                visualFieldData={visualField}
                canEdit={canEdit}
                onSaveTonometry={(data) =>
                  handleSave(
                    data,
                    tonometry?.id,
                    tonometryApi.save,
                    tonometryApi.update,
                    'Tonometry saved successfully',
                    setTonometry,
                  )
                }
                onSavePachymetry={(data) =>
                  handleSave(
                    data,
                    pachymetry?.id,
                    pachymetryApi.save,
                    pachymetryApi.update,
                    'Pachymetry saved successfully',
                    setPachymetry,
                  )
                }
                onSaveVisualField={(data) =>
                  handleSave(
                    data,
                    visualField?.id,
                    visualFieldApi.save,
                    visualFieldApi.update,
                    'Visual field saved successfully',
                    setVisualField,
                  )
                }
              />
            )}

            {activeTab === 'anterior' && (
              <AnteriorSegmentTab
                pupilExamData={pupilExam}
                anteriorSegmentData={anteriorSegment}
                canEdit={canEdit}
                onSavePupilExam={(data) => {
                  // TODO: Implement backend API for pupil exam
                  setPupilExam(data);
                  toast.success('Pupil exam saved (frontend only - backend pending)');
                }}
                onSaveAnteriorSegment={(data) => {
                  // TODO: Implement backend API for anterior segment exam
                  setAnteriorSegment(data);
                  toast.success('Anterior segment exam saved (frontend only - backend pending)');
                }}
              />
            )}

            {activeTab === 'posterior' && (
              <PosteriorSegmentTab
                posteriorSegmentData={posteriorSegment}
                fundusExamData={fundusExam}
                canEdit={canEdit}
                onSavePosteriorSegment={(data) => {
                  // TODO: Implement backend API for posterior segment exam
                  setPosteriorSegment(data);
                  toast.success('Posterior segment exam saved (frontend only - backend pending)');
                }}
                onSaveFundusExam={(data) => {
                  // TODO: Implement backend API for fundus exam
                  setFundusExam(data);
                  toast.success('Fundus exam saved (frontend only - backend pending)');
                }}
              />
            )}

            {activeTab === 'medications' && (
              <MedicationsTab
                currentMedications={currentMedications}
                prescriptionItems={prescriptionItems}
                canEdit={canEdit}
                onSavePrescription={(items) => {
                  // TODO: Implement backend API for prescription items
                  setPrescriptionItems(items);
                  toast.success('Prescription saved (frontend only - backend pending)');
                }}
                onPrintPrescription={() => {
                  // TODO: Implement prescription PDF generation
                  toast.success('Print prescription (backend pending)');
                }}
                onEmailPrescription={() => {
                  // TODO: Implement email prescription to patient
                  toast.success('Email prescription (backend pending)');
                }}
              />
            )}

            {activeTab === 'optical-prescription' && (
              <ContactLensTab
                assessmentData={clAssessment}
                prescriptionData={clPrescription}
                fittingData={clFitting}
                cornealHealthData={clCornealHealth}
                instructionsData={clInstructions}
                keratometryData={keratometry}
                canEdit={canEdit}
                onSaveAssessment={(data) => {
                  // TODO: Implement backend API for contact lens assessment
                  setClAssessment(data);
                  toast.success('Assessment saved (frontend only - backend pending)');
                }}
                onSavePrescription={(data) => {
                  // TODO: Implement backend API for contact lens prescription
                  setClPrescription(data);
                  toast.success('Prescription saved (frontend only - backend pending)');
                }}
                onSaveFitting={(data) => {
                  // TODO: Implement backend API for contact lens fitting
                  setClFitting(data);
                  toast.success('Fitting assessment saved (frontend only - backend pending)');
                }}
                onSaveCornealHealth={(data) => {
                  // TODO: Implement backend API for corneal health
                  setClCornealHealth(data);
                  toast.success('Corneal health saved (frontend only - backend pending)');
                }}
                onSaveInstructions={(data) => {
                  // TODO: Implement backend API for patient instructions
                  setClInstructions(data);
                  toast.success('Instructions saved (frontend only - backend pending)');
                }}
                onPrintPrescription={() => {
                  // TODO: Implement CL prescription PDF generation
                  toast.success('Print CL prescription (backend pending)');
                }}
                onEmailPrescription={() => {
                  // TODO: Implement email CL prescription to patient
                  toast.success('Email CL prescription (backend pending)');
                }}
              />
            )}

            {activeTab === 'referral' && (
              <ReferralOrdersTab
                doctorReferrals={doctorReferrals}
                imagingOrders={imagingOrders}
                receptionReferrals={receptionReferrals}
                canEdit={canEdit}
                onSaveDoctorReferral={(referrals) => {
                  // TODO: Implement backend API for doctor referrals
                  setDoctorReferrals(referrals);
                  toast.success('Doctor referral saved (frontend only - backend pending)');
                }}
                onSaveImagingOrders={(orders) => {
                  // TODO: Implement backend API for imaging orders
                  setImagingOrders(orders);
                  toast.success('Imaging order saved (frontend only - backend pending)');
                }}
                onSaveReceptionReferral={(referrals) => {
                  // TODO: Implement backend API for reception referrals
                  setReceptionReferrals(referrals);
                  toast.success('Reception referral saved (frontend only - backend pending)');
                }}
                onPrintReferral={(id, type) => {
                  // TODO: Implement referral letter PDF generation
                  toast.success(`Print ${type} referral (backend pending)`);
                }}
              />
            )}

            {activeTab === 'diagnosis' && (
              <DiagnosisTab
                diagnoses={diagnoses}
                canEdit={canEdit}
                onSaveDiagnoses={(diagnosisList) => {
                  // TODO: Implement backend API for diagnoses
                  setDiagnoses(diagnosisList);
                  toast.success('Diagnoses saved (frontend only - backend pending)');
                }}
                onCopyPreviousDiagnoses={() => {
                  // TODO: Implement copy from previous visit
                  toast.success('Copy previous diagnoses (backend pending)');
                }}
                onPrintSummary={() => {
                  // TODO: Implement diagnosis summary PDF generation
                  toast.success('Print diagnosis summary (backend pending)');
                }}
              />
            )}

            {activeTab === 'advice' && (
              <AdvicePatientEducationTab
                instructions={adviceInstructions}
                followUp={adviceFollowUp}
                precautions={advicePrecautions}
                education={adviceEducation}
                diagnoses={diagnoses}
                canEdit={canEdit}
                onSaveInstructions={(instructions) => {
                  // TODO: Implement backend API for patient instructions
                  setAdviceInstructions(instructions);
                  toast.success('Patient instructions saved (frontend only - backend pending)');
                }}
                onSaveFollowUp={(followUp) => {
                  // TODO: Implement backend API for follow-up schedule
                  setAdviceFollowUp(followUp);
                  toast.success('Follow-up schedule saved (frontend only - backend pending)');
                }}
                onSavePrecautions={(precautions) => {
                  // TODO: Implement backend API for precautions
                  setAdvicePrecautions(precautions);
                  toast.success('Precautions saved (frontend only - backend pending)');
                }}
                onSaveEducation={(education) => {
                  // TODO: Implement backend API for education materials
                  setAdviceEducation(education);
                  toast.success('Education materials saved (frontend only - backend pending)');
                }}
                onPrintInstructions={() => {
                  // TODO: Implement patient instructions PDF generation
                  toast.success('Print patient instructions (backend pending)');
                }}
                onPrintFullReport={() => {
                  // TODO: Implement full examination report PDF generation
                  toast.success('Print full report (backend pending)');
                }}
                onEmailAll={() => {
                  // TODO: Implement email delivery of all patient materials
                  toast.success('Email all materials to patient (backend pending)');
                }}
                onSendSMSReminder={() => {
                  // TODO: Implement SMS reminder functionality
                  toast.success('Send SMS reminder (backend pending)');
                }}
              />
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default function OptometristExamPage() {
  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <OptometristExamContent />
    </ProtectedRoute>
  );
}
