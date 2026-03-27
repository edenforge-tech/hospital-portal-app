'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, FileText, AlertCircle, User } from 'lucide-react';
import { useCreateCounselingSession, useUpdateCounselingSession } from '@/hooks/use-counseling-sessions';
import { useAuthStore } from '@/lib/auth-store';
import DoctorSearchCombobox from './DoctorSearchCombobox';
import ProcedureSelector from './ProcedureSelector';
import { PatientSearchCombobox } from '@/components/shared/PatientSearchCombobox';
import type { RecommendedProcedureItem } from '@/lib/api/master-data.api';
import type { DoctorSearchResult } from '@/lib/api/master-data.api';
import type { Patient } from '@/lib/api/patients.api';
import { useSurgeryTypesWithPricing } from '@/hooks/use-master-data';
import { toast } from 'sonner';
import { AttenderPanel, type AttenderInfo } from './AttenderPanel';

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  session?: any; // Existing session for edit mode
  onSuccess?: () => void;
}

interface SessionFormData {
  patientId: string;
  sessionType: string;
  patientType: string;
  sessionDate?: string;
  urgency: string;
  clinicalSummary?: string;
  addToQueue: boolean;
}

export default function SessionForm({ isOpen, onClose, session, onSuccess }: SessionFormProps) {
  const { user, tenantId } = useAuthStore();
  
  // State for selected items from new components
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSearchResult | null>(null);
  const [selectedProcedures, setSelectedProcedures] = useState<RecommendedProcedureItem[]>([]);
  const [attenderInfo, setAttenderInfo] = useState<AttenderInfo>({
    patientPresent: true,
    attenderIsDecisionMaker: false,
  });

  // Session outcome fields are now captured in the Patient Decision workflow step (Step 6), not at session creation.
  const branchId = selectedPatient?.branchId || user?.branchId;
  
  const createMutation = useCreateCounselingSession();
  const updateMutation = useUpdateCounselingSession();
  const isEditMode = !!session;

  // Fetch surgery types with pricing
  const { data: surgeryData, isLoading: surgeryLoading, error: surgeryError } = useSurgeryTypesWithPricing({ branchId });

  // Log surgery data for debugging
  useEffect(() => {
    if (surgeryData) {
      console.log('✅ Surgery data loaded:', surgeryData);
    }
    if (surgeryError) {
      console.error('❌ Surgery data error:', surgeryError);
    }
  }, [surgeryData, surgeryError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SessionFormData>({
    defaultValues: {
      sessionType: 'Initial',
      patientType: 'Cash',
      urgency: 'Routine',
      addToQueue: true,
    },
  });

  // Load existing session data in edit mode
  useEffect(() => {
    if (isEditMode && session) {
      setValue('patientId', session.patientId);
      setValue('sessionType', session.sessionType);
      setValue('patientType', session.patientType);
      setValue('urgency', session.urgency || 'Routine');
      setValue('clinicalSummary', session.clinicalSummary || '');
      // Restore attender info from existing session
      setAttenderInfo({
        patientPresent: session.patientPresent ?? true,
        attenderName: session.attenderName ?? '',
        attenderPhone: session.attenderPhone ?? '',
        attenderRelation: session.attenderRelation ?? '',
        attenderIsDecisionMaker: session.attenderIsDecisionMaker ?? false,
        attenderNotes: session.attenderNotes ?? '',
      });
      setAttenderInfo({ patientPresent: true, attenderIsDecisionMaker: false });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: SessionFormData) => {
    try {
      if (isEditMode) {
        // Update existing session
        await updateMutation.mutateAsync({
          id: session.id,
          data: {
            recommendedSurgery: selectedProcedures.length > 0
              ? selectedProcedures.map(p => `${p.eye}: ${p.surgeryName}`).join(', ')
              : session.recommendedSurgery,
            recommendedProcedures: selectedProcedures.length > 0
              ? JSON.stringify(selectedProcedures)
              : undefined,
            urgency: data.urgency,
            clinicalSummary: data.clinicalSummary,
            patientPresent: attenderInfo.patientPresent,
            attenderName: attenderInfo.attenderName,
            attenderPhone: attenderInfo.attenderPhone,
            attenderRelation: attenderInfo.attenderRelation,
            attenderIsDecisionMaker: attenderInfo.attenderIsDecisionMaker,
            attenderNotes: attenderInfo.attenderNotes,
          },
        });
      } else {
        // Validate required selections for create mode
        if (!selectedPatient) {
          alert('Please select a patient');
          return;
        }
        if (!selectedDoctor) {
          alert('Please select a referring doctor');
          return;
        }

        // Create new session
        await createMutation.mutateAsync({
          tenantId,
          branchId,
          patientId: selectedPatient.id,
          referredByDoctorId: selectedDoctor.id,
          sessionType: data.sessionType,
          patientType: data.patientType,
          sessionDate: data.sessionDate,
          // Derive legacy field from first procedure for backward compatibility
          recommendedSurgery: selectedProcedures.length > 0
            ? selectedProcedures.map(p => `${p.eye}: ${p.surgeryName}`).join(', ')
            : undefined,
          recommendedProcedures: selectedProcedures.length > 0
            ? JSON.stringify(selectedProcedures)
            : undefined,
          urgency: data.urgency,
          clinicalSummary: data.clinicalSummary,
          addToQueue: data.addToQueue,
          patientPresent: attenderInfo.patientPresent,
          attenderName: attenderInfo.attenderName,
          attenderPhone: attenderInfo.attenderPhone,
          attenderRelation: attenderInfo.attenderRelation,
          attenderIsDecisionMaker: attenderInfo.attenderIsDecisionMaker,
          attenderNotes: attenderInfo.attenderNotes,
        });
      }

      // Call onSuccess first to trigger parent actions (refetch, toast)
      if (onSuccess) onSuccess();
      
      // Then reset form and close modal
      reset();
      setSelectedPatient(null);
      setSelectedDoctor(null);
      setSelectedProcedures([]);
      onClose();
    } catch (error) {
      console.error('Failed to save session:', error);
      toast.error(isEditMode ? 'Failed to update session' : 'Failed to create session');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Counseling Session' : 'New Counseling Session'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditMode
                  ? 'Update session details and clinical information'
                  : 'Create a new patient counseling session'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Patient & Doctor Info */}
          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient <span className="text-red-500">*</span>
                </label>
                <PatientSearchCombobox
                  value={selectedPatient}
                  onChange={setSelectedPatient}
                  placeholder="Search patient by name, MR number, or phone"
                  className="w-full"
                />
                {!selectedPatient && errors.patientId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Patient is required
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referred By Doctor <span className="text-red-500">*</span>
                </label>
                <DoctorSearchCombobox
                  onSelect={setSelectedDoctor}
                  branchId={branchId}
                  value={selectedDoctor}
                  placeholder="Search for referring doctor..."
                  errorMessage={!selectedDoctor && errors.patientId ? 'Referring doctor is required' : undefined}
                />
              </div>
            </div>
          )}

          {/* Session Type & Patient Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('sessionType', { required: true })}
                disabled={isEditMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="Initial">Initial</option>
                <option value="Followup">Followup</option>
                <option value="Recheck">Recheck</option>
                <option value="Urgent">Urgent</option>
                <option value="AttenderCounseling">Attender Counseling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('patientType', { required: true })}
                disabled={isEditMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="Cash">Cash</option>
                <option value="Insurance">Insurance</option>
                <option value="CoPay">CoPay</option>
                <option value="ESH">ESH</option>
                <option value="CGHS">CGHS</option>
                <option value="Arograshree">Arograshree</option>
                <option value="SGHS">SGHS</option>
                <option value="Camp">Camp</option>
              </select>
            </div>
          </div>

          {/* Session Date & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    {...register('sessionDate')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency <span className="text-red-500">*</span>
              </label>
              <select
                {...register('urgency', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Attender Panel */}
          <AttenderPanel
            value={attenderInfo}
            onChange={setAttenderInfo}
            readOnly={false}
          />

          {/* Clinical Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Clinical Information
            </h3>

            {/* Surgery / Procedure Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedures
              </label>
              <ProcedureSelector
                surgeryTypes={surgeryData?.data ?? []}
                isLoading={surgeryLoading}
                value={selectedProcedures}
                onChange={setSelectedProcedures}
              />
              {surgeryError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Failed to load surgery types
                </p>
              )}
            </div>

            {/* Clinical Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinical Summary
              </label>
              <textarea
                {...register('clinicalSummary')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter clinical summary, diagnosis, recommendations..."
              />
            </div>
          </div>

          {/* Add to Queue (only for create mode) */}
          {!isEditMode && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                {...register('addToQueue')}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-900">
                Add to counselor queue immediately
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>{isEditMode ? 'Update Session' : 'Create Session'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
