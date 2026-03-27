'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ExamCard, ExamInput, ExamSelect, ActionButton } from './ExamCard';
import { 
  FileText, Plus, Trash2, Printer, Send, MessageSquare, 
  Calendar, AlertCircle, BookOpen, CheckCircle2, Circle, FileCheck
} from 'lucide-react';
import SmartFollowUpScheduler from '../clinical/SmartFollowUpScheduler';
import { appointmentsApi } from '@/lib/api/appointments-enhanced.api';

// ============================================================================
// TYPES
// ============================================================================

interface PatientInstruction {
  id: string;
  text: string;
  isTemplate: boolean;
  templateName?: string;
}

interface FollowUpSchedule {
  nextVisitDate: string;
  followUpReason: string;
  testsNeeded: string[];
  reminderPreferences: string[];
}

interface PrecautionsData {
  conditionSpecific: string[];
  customPrecautions: string;
  redFlags: string[];
}

interface EducationMaterial {
  id: string;
  name: string;
  category: 'condition' | 'procedure' | 'general' | 'pediatric';
  type: 'pdf' | 'video';
  autoRecommended?: boolean;
}

interface EducationSelection {
  selectedMaterials: string[];
  deliveryMethods: string[];
  language: string;
}

interface AdvicePatientEducationTabProps {
  patientId: string; // Added for creating appointments
  instructions: PatientInstruction[];
  followUp: FollowUpSchedule | null;
  precautions: PrecautionsData | null;
  education: EducationSelection | null;
  diagnoses?: any[]; // For auto-suggesting precautions and materials
  procedures?: string[]; // Added for smart follow-up suggestions
  canEdit: boolean;
  onSaveInstructions: (instructions: PatientInstruction[]) => void;
  onSaveFollowUp: (followUp: FollowUpSchedule) => void;
  onSavePrecautions: (precautions: PrecautionsData) => void;
  onSaveEducation: (education: EducationSelection) => void;
  onPrintInstructions: () => void;
  onPrintFullReport: () => void;
  onEmailAll: () => void;
  onSendSMSReminder: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Section 1: Instruction Templates
const INSTRUCTION_TEMPLATES = [
  { id: 'water', text: 'Avoid water contact for 24 hours' },
  { id: 'sunglasses', text: 'Use sunglasses when outdoors' },
  { id: 'rubbing', text: 'Avoid rubbing eyes' },
  { id: 'medication', text: 'Complete full medication course' },
  { id: 'warm-compress', text: 'Apply warm compress 3x daily' },
  { id: 'cold-compress', text: 'Apply cold compress for 10 mins 4x daily' },
  { id: 'return', text: 'Return if symptoms worsen' },
  { id: 'no-cl', text: 'Avoid contact lenses for [X] days' },
  { id: 'no-lifting', text: 'No heavy lifting for 1 week' },
  { id: 'head-elevated', text: 'Sleep with head elevated' },
  { id: 'protective', text: 'Use protective eyewear' },
];

// Section 2: Follow-up data
const FOLLOW_UP_REASONS = [
  'Routine check-up',
  'Treatment review (medication effectiveness)',
  'Test results review',
  'Pre-operative assessment',
  'Post-operative check',
  'Emergency / As needed'
];

const TESTS_NEEDED = [
  'Visual Field test',
  'OCT scan',
  'Fundus Photography',
  'IOP check',
  'Refraction',
  'Contact Lens follow-up',
  'Blood tests (HbA1c for diabetics, etc.)',
  'Other (specify)'
];

const REMINDER_OPTIONS = [
  'SMS reminder (1 day before)',
  'Email reminder (1 day before)',
  'WhatsApp reminder (if applicable)'
];

// Section 3: Precaution Templates
const CONDITION_PRECAUTIONS = [
  { 
    id: 'glaucoma',
    condition: 'Glaucoma',
    text: 'Regular IOP monitoring essential - vision loss is permanent if untreated',
    icdCodes: ['H40.11', 'H40.1', 'H40.2', 'H40.3', 'H40']
  },
  { 
    id: 'diabetic',
    condition: 'Diabetes',
    text: 'Annual dilated eye exam required - report any sudden vision changes immediately',
    icdCodes: ['E10.3', 'E11.3', 'E13.3', 'E14.3']
  },
  { 
    id: 'cataract',
    condition: 'Cataract',
    text: 'Surgery may be needed when vision affects daily activities',
    icdCodes: ['H25', 'H26', 'H25.9', 'H26.9']
  },
  { 
    id: 'cl-user',
    condition: 'Contact Lens User',
    text: 'Proper hygiene essential - never sleep in lenses unless approved',
    icdCodes: [] // Based on patient history
  },
  { 
    id: 'dry-eye',
    condition: 'Dry Eye',
    text: 'Avoid smoke, wind, AC - use lubricating drops frequently',
    icdCodes: ['H04.12', 'H04.1']
  },
  { 
    id: 'retinal',
    condition: 'Retinal Issue',
    text: 'Avoid vigorous exercise - report flashes/floaters immediately',
    icdCodes: ['H35', 'H43.1', 'H33']
  },
  { 
    id: 'post-surgery',
    condition: 'Post-surgery',
    text: 'Avoid swimming, eye makeup, rubbing eyes as per surgeon\'s advice',
    icdCodes: [] // Based on visit status
  }
];

const RED_FLAGS = [
  'Sudden vision loss',
  'Severe eye pain',
  'Flashes of light or new floaters',
  'Eye injury',
  'Discharge with redness',
  'Headache with blurred vision',
  'Seeing halos around lights'
];

// Section 4: Education Materials
const EDUCATION_MATERIALS: EducationMaterial[] = [
  // Condition-Specific
  { id: 'glaucoma-pdf', name: 'Understanding Glaucoma', category: 'condition', type: 'pdf' },
  { id: 'glaucoma-video', name: 'Understanding Glaucoma', category: 'condition', type: 'video' },
  { id: 'cataract-pdf', name: 'Cataract: Causes and Treatment', category: 'condition', type: 'pdf' },
  { id: 'cataract-video', name: 'Cataract: Causes and Treatment', category: 'condition', type: 'video' },
  { id: 'diabetic-pdf', name: 'Diabetic Retinopathy Explained', category: 'condition', type: 'pdf' },
  { id: 'diabetic-video', name: 'Diabetic Retinopathy Explained', category: 'condition', type: 'video' },
  { id: 'amd-pdf', name: 'Age-Related Macular Degeneration', category: 'condition', type: 'pdf' },
  { id: 'amd-video', name: 'Age-Related Macular Degeneration', category: 'condition', type: 'video' },
  { id: 'refractive-pdf', name: 'Refractive Errors: Myopia, Hyperopia, Astigmatism', category: 'condition', type: 'pdf' },
  { id: 'dry-eye-pdf', name: 'Dry Eye Syndrome Management', category: 'condition', type: 'pdf' },
  { id: 'conjunctivitis-pdf', name: 'Conjunctivitis (Pink Eye) Care', category: 'condition', type: 'pdf' },
  
  // Procedure-Specific
  { id: 'cataract-surgery-pdf', name: 'Preparing for Cataract Surgery', category: 'procedure', type: 'pdf' },
  { id: 'cataract-surgery-video', name: 'Preparing for Cataract Surgery', category: 'procedure', type: 'video' },
  { id: 'lasik-pdf', name: 'Post-LASIK Care Instructions', category: 'procedure', type: 'pdf' },
  { id: 'injection-pdf', name: 'Intravitreal Injection: What to Expect', category: 'procedure', type: 'pdf' },
  { id: 'injection-video', name: 'Intravitreal Injection: What to Expect', category: 'procedure', type: 'video' },
  
  // General Eye Health
  { id: 'vision-protection-pdf', name: 'Protecting Your Vision', category: 'general', type: 'pdf' },
  { id: 'nutrition-pdf', name: 'Nutrition for Eye Health', category: 'general', type: 'pdf' },
  { id: 'computer-strain-pdf', name: 'Computer Eye Strain Prevention', category: 'general', type: 'pdf' },
  { id: 'uv-protection-pdf', name: 'UV Protection and Sunglasses', category: 'general', type: 'pdf' },
  { id: 'when-see-doctor-pdf', name: 'When to See an Eye Doctor', category: 'general', type: 'pdf' },
  
  // Pediatric
  { id: 'amblyopia-pdf', name: 'Amblyopia (Lazy Eye) in Children', category: 'pediatric', type: 'pdf' },
  { id: 'screening-pdf', name: 'Vision Screening for Children', category: 'pediatric', type: 'pdf' },
  { id: 'child-protection-pdf', name: 'Protect Your Child\'s Eyes', category: 'pediatric', type: 'pdf' }
];

const DELIVERY_METHODS = [
  'Print and give physical handout',
  'Email PDF to patient',
  'Send download link via SMS',
  'Add to patient portal for download'
];

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Telugu',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Marathi'
];

// ============================================================================
// COMPONENT
// ============================================================================

const AdvicePatientEducationTab: React.FC<AdvicePatientEducationTabProps> = ({
  patientId,
  instructions: initialInstructions,
  followUp: initialFollowUp,
  precautions: initialPrecautions,
  education: initialEducation,
  diagnoses = [],
  procedures = [],
  canEdit,
  onSaveInstructions,
  onSaveFollowUp,
  onSavePrecautions,
  onSaveEducation,
  onPrintInstructions,
  onPrintFullReport,
  onEmailAll,
  onSendSMSReminder
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  // Section 1: Instructions
  const [instructions, setInstructions] = useState<PatientInstruction[]>(initialInstructions || []);
  const [customInstruction, setCustomInstruction] = useState('');
  const [hasInstructionsChanges, setHasInstructionsChanges] = useState(false);

  // Section 2: Follow-up
  const [followUp, setFollowUp] = useState<FollowUpSchedule>(initialFollowUp || {
    nextVisitDate: '',
    followUpReason: '',
    testsNeeded: [],
    reminderPreferences: []
  });
  const [hasFollowUpChanges, setHasFollowUpChanges] = useState(false);

  // Section 3: Precautions
  const [precautions, setPrecautions] = useState<PrecautionsData>(initialPrecautions || {
    conditionSpecific: [],
    customPrecautions: '',
    redFlags: []
  });
  const [hasPrecautionsChanges, setHasPrecautionsChanges] = useState(false);

  // Section 4: Education
  const [education, setEducation] = useState<EducationSelection>(initialEducation || {
    selectedMaterials: [],
    deliveryMethods: [],
    language: 'English'
  });
  const [hasEducationChanges, setHasEducationChanges] = useState(false);

  // ============================================================================
  // AUTO-SUGGEST LOGIC
  // ============================================================================

  // Auto-suggest precautions based on diagnoses
  useEffect(() => {
    if (diagnoses && diagnoses.length > 0 && precautions.conditionSpecific.length === 0) {
      const suggested: string[] = [];
      
      diagnoses.forEach((diagnosis: any) => {
        const icd10Code = diagnosis.icd10Code || diagnosis.code || '';
        CONDITION_PRECAUTIONS.forEach((precaution) => {
          if (precaution.icdCodes.some(code => icd10Code.startsWith(code))) {
            if (!suggested.includes(precaution.id)) {
              suggested.push(precaution.id);
            }
          }
        });
      });

      if (suggested.length > 0) {
        setPrecautions(prev => ({ ...prev, conditionSpecific: suggested }));
      }
    }
  }, [diagnoses]);

  // Auto-recommend education materials based on diagnoses
  useEffect(() => {
    if (diagnoses && diagnoses.length > 0 && education.selectedMaterials.length === 0) {
      const recommended: string[] = [];
      
      diagnoses.forEach((diagnosis: any) => {
        const icd10Code = diagnosis.icd10Code || diagnosis.code || '';
        
        // Glaucoma
        if (icd10Code.startsWith('H40')) {
          if (!recommended.includes('glaucoma-pdf')) recommended.push('glaucoma-pdf');
        }
        // Cataract
        if (icd10Code.startsWith('H25') || icd10Code.startsWith('H26')) {
          if (!recommended.includes('cataract-pdf')) recommended.push('cataract-pdf');
        }
        // Diabetic Retinopathy
        if (icd10Code.includes('E10.3') || icd10Code.includes('E11.3')) {
          if (!recommended.includes('diabetic-pdf')) recommended.push('diabetic-pdf');
        }
        // Dry Eye
        if (icd10Code.startsWith('H04.12') || icd10Code.startsWith('H04.1')) {
          if (!recommended.includes('dry-eye-pdf')) recommended.push('dry-eye-pdf');
        }
        // AMD
        if (icd10Code.startsWith('H35.3')) {
          if (!recommended.includes('amd-pdf')) recommended.push('amd-pdf');
        }
        // Refractive errors
        if (icd10Code.startsWith('H52')) {
          if (!recommended.includes('refractive-pdf')) recommended.push('refractive-pdf');
        }
        // Conjunctivitis
        if (icd10Code.startsWith('H10')) {
          if (!recommended.includes('conjunctivitis-pdf')) recommended.push('conjunctivitis-pdf');
        }
      });

      if (recommended.length > 0) {
        setEducation(prev => ({ ...prev, selectedMaterials: recommended }));
      }
    }
  }, [diagnoses]);

  // ============================================================================
  // HANDLERS - Section 1: Instructions
  // ============================================================================

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddTemplateInstruction = (template: typeof INSTRUCTION_TEMPLATES[0]) => {
    const newInstruction: PatientInstruction = {
      id: generateId(),
      text: template.text,
      isTemplate: true,
      templateName: template.id
    };
    
    const updated = [...instructions, newInstruction];
    setInstructions(updated);
    setHasInstructionsChanges(true);
  };

  const handleAddCustomInstruction = () => {
    if (!customInstruction.trim()) return;
    
    const newInstruction: PatientInstruction = {
      id: generateId(),
      text: customInstruction,
      isTemplate: false
    };
    
    const updated = [...instructions, newInstruction];
    setInstructions(updated);
    setCustomInstruction('');
    setHasInstructionsChanges(true);
  };

  const handleDeleteInstruction = (id: string) => {
    if (!confirm('Delete this instruction?')) return;
    const updated = instructions.filter(i => i.id !== id);
    setInstructions(updated);
    setHasInstructionsChanges(true);
  };

  const handleSaveInstructions = () => {
    onSaveInstructions(instructions);
    setHasInstructionsChanges(false);
  };

  // ============================================================================
  // HANDLERS - Section 2: Follow-up
  // ============================================================================

  const handleQuickDateSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const formatted = date.toISOString().split('T')[0];
    setFollowUp(prev => ({ ...prev, nextVisitDate: formatted }));
    setHasFollowUpChanges(true);
  };

  const handleFollowUpChange = (field: keyof FollowUpSchedule, value: any) => {
    setFollowUp(prev => ({ ...prev, [field]: value }));
    setHasFollowUpChanges(true);
  };

  const handleTestNeededToggle = (test: string) => {
    const updated = followUp.testsNeeded.includes(test)
      ? followUp.testsNeeded.filter(t => t !== test)
      : [...followUp.testsNeeded, test];
    setFollowUp(prev => ({ ...prev, testsNeeded: updated }));
    setHasFollowUpChanges(true);
  };

  const handleReminderToggle = (reminder: string) => {
    const updated = followUp.reminderPreferences.includes(reminder)
      ? followUp.reminderPreferences.filter(r => r !== reminder)
      : [...followUp.reminderPreferences, reminder];
    setFollowUp(prev => ({ ...prev, reminderPreferences: updated }));
    setHasFollowUpChanges(true);
  };

  const handleSaveFollowUp = () => {
    onSaveFollowUp(followUp);
    setHasFollowUpChanges(false);
  };

  // Handler for SmartFollowUpScheduler to create appointments
  const handleScheduleSmartFollowUp = async (schedule: any) => {
    try {
      const appointmentDate = new Date(schedule.date);
      
      // Create appointment via API
      const response = await appointmentsApi.create({
        patientId: patientId,
        appointmentDate: appointmentDate.toISOString(),
        appointmentType: schedule.type || 'Follow-up',
        reason: schedule.reason || 'Follow-up appointment',
        status: 'Scheduled',
        notes: `Auto-scheduled follow-up: ${schedule.reason}`,
      });

      // Also update the manual follow-up field
      setFollowUp(prev => ({
        ...prev,
        nextVisitDate: schedule.date,
        followUpReason: schedule.reason,
      }));
      setHasFollowUpChanges(true);

      // toast.success(`Follow-up appointment scheduled for ${schedule.date}`);
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      // toast.error('Failed to schedule follow-up appointment');
    }
  };

  // ============================================================================
  // HANDLERS - Section 3: Precautions
  // ============================================================================

  const handleConditionPrecautionToggle = (precautionId: string) => {
    const updated = precautions.conditionSpecific.includes(precautionId)
      ? precautions.conditionSpecific.filter(p => p !== precautionId)
      : [...precautions.conditionSpecific, precautionId];
    setPrecautions(prev => ({ ...prev, conditionSpecific: updated }));
    setHasPrecautionsChanges(true);
  };

  const handleRedFlagToggle = (flag: string) => {
    const updated = precautions.redFlags.includes(flag)
      ? precautions.redFlags.filter(f => f !== flag)
      : [...precautions.redFlags, flag];
    setPrecautions(prev => ({ ...prev, redFlags: updated }));
    setHasPrecautionsChanges(true);
  };

  const handleSavePrecautions = () => {
    onSavePrecautions(precautions);
    setHasPrecautionsChanges(false);
  };

  // ============================================================================
  // HANDLERS - Section 4: Education
  // ============================================================================

  const handleMaterialToggle = (materialId: string) => {
    const updated = education.selectedMaterials.includes(materialId)
      ? education.selectedMaterials.filter(m => m !== materialId)
      : [...education.selectedMaterials, materialId];
    setEducation(prev => ({ ...prev, selectedMaterials: updated }));
    setHasEducationChanges(true);
  };

  const handleDeliveryMethodToggle = (method: string) => {
    const updated = education.deliveryMethods.includes(method)
      ? education.deliveryMethods.filter(m => m !== method)
      : [...education.deliveryMethods, method];
    setEducation(prev => ({ ...prev, deliveryMethods: updated }));
    setHasEducationChanges(true);
  };

  const handleSaveEducation = () => {
    onSaveEducation(education);
    setHasEducationChanges(false);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getMaterialsByCategory = (category: string) => {
    return EDUCATION_MATERIALS.filter(m => m.category === category);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* ====================================================================== */}
      {/* SECTION 1: PATIENT INSTRUCTIONS */}
      {/* ====================================================================== */}
      <ExamCard
        title="Patient Instructions"
        icon={<FileText className="w-5 h-5" />}
      >
        <div className="space-y-2">
          {/* Quick Template Chips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Quick Templates:
            </label>
            <div className="flex flex-wrap gap-2">
              {INSTRUCTION_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleAddTemplateInstruction(template)}
                  disabled={!canEdit}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3" />
                  {template.text}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Custom Instruction:
            </label>
            <div className="flex gap-2">
              <ExamInput
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Type specific instruction"
                disabled={!canEdit}
                className="flex-1"
              />
              <ActionButton
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddCustomInstruction}
                disabled={!canEdit || !customInstruction.trim()}
              >
                Add
              </ActionButton>
            </div>
          </div>

          {/* Added Instructions List */}
          {instructions.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-gray-900">Patient Will Receive:</h5>
              <ul className="space-y-2">
                {instructions.map((instruction) => (
                  <li
                    key={instruction.id}
                    className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <Circle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-900">{instruction.text}</span>
                    {instruction.isTemplate && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Template
                      </span>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteInstruction(instruction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Save Button */}
          {canEdit && hasInstructionsChanges && (
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <ActionButton
                variant="primary"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleSaveInstructions}
              >
                Save
              </ActionButton>
            </div>
          )}
        </div>
      </ExamCard>

      {/* ====================================================================== */}
      {/* SMART FOLLOW-UP SUGGESTER (NEW) */}
      {/* ====================================================================== */}
      {diagnoses && diagnoses.length > 0 && (
        <SmartFollowUpScheduler
          diagnoses={diagnoses}
          procedures={procedures}
          onScheduleFollowUp={handleScheduleSmartFollowUp}
          canEdit={canEdit}
        />
      )}

      {/* ====================================================================== */}
      {/* SECTION 2: FOLLOW-UP SCHEDULE (Manual Entry) */}
      {/* ====================================================================== */}
      <ExamCard
        title="Follow-up Schedule (Manual Entry)"
        icon={<Calendar className="w-5 h-5" />}
      >
        <div className="space-y-2">
          {/* Next Visit Date with Quick Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Next Visit Date:
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={() => handleQuickDateSelect(7)}
                disabled={!canEdit}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                1 week
              </button>
              <button
                onClick={() => handleQuickDateSelect(14)}
                disabled={!canEdit}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                2 weeks
              </button>
              <button
                onClick={() => handleQuickDateSelect(30)}
                disabled={!canEdit}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                1 month
              </button>
              <button
                onClick={() => handleQuickDateSelect(90)}
                disabled={!canEdit}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                3 months
              </button>
              <button
                onClick={() => handleQuickDateSelect(180)}
                disabled={!canEdit}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                6 months
              </button>
              <button
                onClick={() => handleQuickDateSelect(365)}
                disabled={!canEdit}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                1 year
              </button>
            </div>
            <input
              type="date"
              value={followUp.nextVisitDate}
              onChange={(e) => handleFollowUpChange('nextVisitDate', e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm disabled:bg-gray-50"
            />
          </div>

          {/* Follow-up Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason:
            </label>
            <select
              value={followUp.followUpReason}
              onChange={(e) => handleFollowUpChange('followUpReason', e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm disabled:bg-gray-50"
            >
              <option value="">Select reason...</option>
              {FOLLOW_UP_REASONS.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* Specific Tests Needed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tests Needed:
            </label>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {TESTS_NEEDED.map((test) => (
                <label key={test} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={followUp.testsNeeded.includes(test)}
                    onChange={() => handleTestNeededToggle(test)}
                    disabled={!canEdit}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-700">{test}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Remind Patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Remind Patient:
            </label>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {REMINDER_OPTIONS.map((reminder) => (
                <label key={reminder} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={followUp.reminderPreferences.includes(reminder)}
                    onChange={() => handleReminderToggle(reminder)}
                    disabled={!canEdit}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-700">{reminder}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          {canEdit && hasFollowUpChanges && (
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <ActionButton
                variant="primary"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleSaveFollowUp}
              >
                Save
              </ActionButton>
            </div>
          )}
        </div>
      </ExamCard>

      {/* ====================================================================== */}
      {/* SECTION 3: PRECAUTIONS & WARNINGS */}
      {/* ====================================================================== */}
      <ExamCard
        title="Precautions & Warnings"
        icon={<AlertCircle className="w-5 h-5" />}
      >
        <div className="space-y-2">
          {/* Condition-Specific Precautions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Condition Precautions:
            </label>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {CONDITION_PRECAUTIONS.map((precaution) => (
                <label key={precaution.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={precautions.conditionSpecific.includes(precaution.id)}
                    onChange={() => handleConditionPrecautionToggle(precaution.id)}
                    disabled={!canEdit}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-amber-600">{precaution.condition}:</span>
                    <span className="text-xs text-gray-700 ml-1">{precaution.text}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Precautions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Custom Notes:
            </label>
            <ExamInput
              value={precautions.customPrecautions}
              onChange={(e) => {
                setPrecautions(prev => ({ ...prev, customPrecautions: e.target.value }));
                setHasPrecautionsChanges(true);
              }}
              disabled={!canEdit}
              placeholder="Additional precautions"
            />
          </div>

          {/* Red Flags - Return Immediately If */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <label className="block text-sm font-semibold text-red-900 mb-1.5">
              🚨 Return If:
            </label>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {RED_FLAGS.map((flag) => (
                <label key={flag} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={precautions.redFlags.includes(flag)}
                    onChange={() => handleRedFlagToggle(flag)}
                    disabled={!canEdit}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-red-900 font-medium">{flag}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          {canEdit && hasPrecautionsChanges && (
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <ActionButton
                variant="primary"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleSavePrecautions}
              >
                Save
              </ActionButton>
            </div>
          )}
        </div>
      </ExamCard>

      {/* ====================================================================== */}
      {/* SECTION 4: PATIENT EDUCATION MATERIALS */}
      {/* ====================================================================== */}
      <ExamCard
        title="Patient Education Materials"
        icon={<BookOpen className="w-5 h-5" />}
      >
        <div className="space-y-2">
          {/* Auto-recommended notice */}
          {education.selectedMaterials.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Auto-recommended</strong> materials are pre-selected based on the patient's diagnosis. You can deselect or add more.
              </p>
            </div>
          )}

          {/* Condition-Specific Materials */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-1.5">Condition-Specific:</h5>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {getMaterialsByCategory('condition').map((material) => (
                <label key={material.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={education.selectedMaterials.includes(material.id)}
                    onChange={() => handleMaterialToggle(material.id)}
                    disabled={!canEdit}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-700">{material.name}</span>
                  <span className="text-xs text-gray-500 uppercase">({material.type})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Procedure-Specific Materials */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-1.5">Procedure-Specific:</h5>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {getMaterialsByCategory('procedure').map((material) => (
                <label key={material.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={education.selectedMaterials.includes(material.id)}
                    onChange={() => handleMaterialToggle(material.id)}
                    disabled={!canEdit}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-700">{material.name}</span>
                  <span className="text-xs text-gray-500 uppercase">({material.type})</span>
                </label>
              ))}
            </div>
          </div>

          {/* General Eye Health Materials */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-1.5">General Eye Health:</h5>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {getMaterialsByCategory('general').map((material) => (
                <label key={material.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={education.selectedMaterials.includes(material.id)}
                    onChange={() => handleMaterialToggle(material.id)}
                    disabled={!canEdit}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-700">{material.name}</span>
                  <span className="text-xs text-gray-500 uppercase">({material.type})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pediatric Materials */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-1.5">Pediatric:</h5>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {getMaterialsByCategory('pediatric').map((material) => (
                <label key={material.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={education.selectedMaterials.includes(material.id)}
                    onChange={() => handleMaterialToggle(material.id)}
                    disabled={!canEdit}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-700">{material.name}</span>
                  <span className="text-xs text-gray-500 uppercase">({material.type})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Methods */}
          <div className="pt-2 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Delivery Method:
            </label>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {DELIVERY_METHODS.map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={education.deliveryMethods.includes(method)}
                    onChange={() => handleDeliveryMethodToggle(method)}
                    disabled={!canEdit}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Language Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Language:
            </label>
            <select
              value={education.language}
              onChange={(e) => {
                setEducation(prev => ({ ...prev, language: e.target.value }));
                setHasEducationChanges(true);
              }}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm disabled:bg-gray-50"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          {canEdit && hasEducationChanges && (
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <ActionButton
                variant="primary"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleSaveEducation}
              >
                Save
              </ActionButton>
            </div>
          )}
        </div>
      </ExamCard>

      {/* ====================================================================== */}
      {/* SECTION 5: PRINT SUMMARY & ACTIONS */}
      {/* ====================================================================== */}
      <ExamCard
        title="Print Summary & Actions"
        icon={<Printer className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <ActionButton
            variant="primary"
            size="lg"
            icon={<Printer className="w-5 h-5" />}
            onClick={onPrintInstructions}
          >
            Print Patient Instructions
          </ActionButton>
          
          <ActionButton
            variant="secondary"
            size="lg"
            icon={<FileCheck className="w-5 h-5" />}
            onClick={onPrintFullReport}
          >
            Print Full Report
          </ActionButton>
          
          <ActionButton
            variant="secondary"
            size="lg"
            icon={<Send className="w-5 h-5" />}
            onClick={onEmailAll}
          >
            Email All to Patient
          </ActionButton>
          
          <ActionButton
            variant="ghost"
            size="lg"
            icon={<MessageSquare className="w-5 h-5" />}
            onClick={onSendSMSReminder}
          >
            Send SMS Reminder
          </ActionButton>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="text-sm font-semibold text-gray-900 mb-2">What will be sent:</h5>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {instructions.length} patient instruction(s)
            </li>
            {followUp.nextVisitDate && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Follow-up appointment on {new Date(followUp.nextVisitDate).toLocaleDateString()}
              </li>
            )}
            {precautions.conditionSpecific.length > 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {precautions.conditionSpecific.length} condition-specific precaution(s)
              </li>
            )}
            {precautions.redFlags.length > 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                {precautions.redFlags.length} red flag warning(s)
              </li>
            )}
            {education.selectedMaterials.length > 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {education.selectedMaterials.length} educational material(s) in {education.language}
              </li>
            )}
          </ul>
        </div>
      </ExamCard>
    </div>
  );
};

export default AdvicePatientEducationTab;
