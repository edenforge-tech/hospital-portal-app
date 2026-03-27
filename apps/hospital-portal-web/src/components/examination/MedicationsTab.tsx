'use client';

import { useState, useEffect } from 'react';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, ActionButton } from './ExamCard';
import { Pill, Plus, Edit2, Trash2, Printer, Mail, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { RadioGroup } from '@headlessui/react';
import PrescriptionValidationModal from '@/components/clinical/PrescriptionValidationModal';
import { validatePrescription } from '@/lib/api/prescription-validation.api';
import type { PrescriptionValidationResult, ValidatePrescriptionMedication } from '@/types/prescription';

// Type definitions for Medications
interface CurrentMedication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: Date | string;
}

interface PrescriptionItem {
  id: string;
  drugName: string;
  drugType: string;
  dosage: string;
  frequency: string;
  route: string;
  eyeSpecificity: 'OD' | 'OS' | 'OU' | 'Systemic';
  odInstructions?: string;
  osInstructions?: string;
  ouInstructions?: string;
  durationValue: number;
  durationUnit: string;
  instructions?: string;
  startDate: Date | string;
  refillsAllowed: number;
}

interface MedicationsTabProps {
  currentMedications: CurrentMedication[] | null;
  prescriptionItems: PrescriptionItem[] | null;
  canEdit: boolean;
  onSavePrescription: (items: PrescriptionItem[]) => void;
  onPrintPrescription: () => void;
  onEmailPrescription: () => void;
  patientId?: string;
}

// Comprehensive medication database with common ophthalmic medications
const MEDICATION_DATABASE = {
  // Glaucoma Medications (Antiglaucoma Agents)
  'Timolol': { type: 'Eye Drops', dosages: ['0.25%', '0.5%'], category: 'Antiglaucoma' },
  'Latanoprost': { type: 'Eye Drops', dosages: ['0.005%'], category: 'Antiglaucoma' },
  'Travoprost': { type: 'Eye Drops', dosages: ['0.004%'], category: 'Antiglaucoma' },
  'Bimatoprost': { type: 'Eye Drops', dosages: ['0.01%', '0.03%'], category: 'Antiglaucoma' },
  'Brimonidine': { type: 'Eye Drops', dosages: ['0.1%', '0.15%', '0.2%'], category: 'Antiglaucoma' },
  'Dorzolamide': { type: 'Eye Drops', dosages: ['2%'], category: 'Antiglaucoma' },
  'Brinzolamide': { type: 'Eye Drops', dosages: ['1%'], category: 'Antiglaucoma' },
  'Pilocarpine': { type: 'Eye Drops', dosages: ['1%', '2%', '4%'], category: 'Antiglaucoma' },
  
  // Antibiotics (Ophthalmic)
  'Moxifloxacin': { type: 'Eye Drops', dosages: ['0.5%'], category: 'Antibiotic' },
  'Gatifloxacin': { type: 'Eye Drops', dosages: ['0.3%', '0.5%'], category: 'Antibiotic' },
  'Ofloxacin': { type: 'Eye Drops', dosages: ['0.3%'], category: 'Antibiotic' },
  'Ciprofloxacin': { type: 'Eye Drops', dosages: ['0.3%'], category: 'Antibiotic' },
  'Tobramycin': { type: 'Eye Drops', dosages: ['0.3%'], category: 'Antibiotic' },
  'Gentamicin': { type: 'Eye Drops', dosages: ['0.3%'], category: 'Antibiotic' },
  'Azithromycin': { type: 'Eye Drops', dosages: ['1%'], category: 'Antibiotic' },
  'Chloramphenicol': { type: 'Eye Drops', dosages: ['0.5%', '1%'], category: 'Antibiotic' },
  'Erythromycin': { type: 'Ointment', dosages: ['0.5%'], category: 'Antibiotic' },
  'Bacitracin': { type: 'Ointment', dosages: ['500 units/g'], category: 'Antibiotic' },
  'Polymyxin B': { type: 'Eye Drops', dosages: ['10,000 units/mL'], category: 'Antibiotic' },
  
  // Corticosteroids (Ophthalmic)
  'Prednisolone Acetate': { type: 'Eye Drops', dosages: ['0.12%', '1%'], category: 'Steroid' },
  'Dexamethasone': { type: 'Eye Drops', dosages: ['0.1%'], category: 'Steroid' },
  'Fluorometholone': { type: 'Eye Drops', dosages: ['0.1%', '0.25%'], category: 'Steroid' },
  'Loteprednol': { type: 'Eye Drops', dosages: ['0.2%', '0.5%'], category: 'Steroid' },
  'Difluprednate': { type: 'Eye Drops', dosages: ['0.05%'], category: 'Steroid' },
  
  // NSAIDs (Ophthalmic)
  'Ketorolac': { type: 'Eye Drops', dosages: ['0.4%', '0.5%'], category: 'NSAID' },
  'Bromfenac': { type: 'Eye Drops', dosages: ['0.07%', '0.09%'], category: 'NSAID' },
  'Nepafenac': { type: 'Eye Drops', dosages: ['0.1%', '0.3%'], category: 'NSAID' },
  'Flurbiprofen': { type: 'Eye Drops', dosages: ['0.03%'], category: 'NSAID' },
  'Diclofenac': { type: 'Eye Drops', dosages: ['0.1%'], category: 'NSAID' },
  
  // Cycloplegics & Mydriatics (Ophthalmic)
  'Tropicamide': { type: 'Eye Drops', dosages: ['0.5%', '1%'], category: 'Cycloplegic' },
  'Cyclopentolate': { type: 'Eye Drops', dosages: ['0.5%', '1%', '2%'], category: 'Cycloplegic' },
  'Atropine': { type: 'Eye Drops', dosages: ['0.01%', '0.5%', '1%'], category: 'Cycloplegic' },
  'Homatropine': { type: 'Eye Drops', dosages: ['2%', '5%'], category: 'Cycloplegic' },
  'Phenylephrine': { type: 'Eye Drops', dosages: ['2.5%', '10%'], category: 'Mydriatic' },
  
  // Antiallergics / Antihistamines (Ophthalmic)
  'Olopatadine': { type: 'Eye Drops', dosages: ['0.1%', '0.2%'], category: 'Antiallergic' },
  'Ketotifen': { type: 'Eye Drops', dosages: ['0.025%', '0.035%'], category: 'Antiallergic' },
  'Azelastine': { type: 'Eye Drops', dosages: ['0.05%'], category: 'Antiallergic' },
  'Emedastine': { type: 'Eye Drops', dosages: ['0.05%'], category: 'Antiallergic' },
  'Alcaftadine': { type: 'Eye Drops', dosages: ['0.25%'], category: 'Antiallergic' },
  'Bepotastine': { type: 'Eye Drops', dosages: ['1.5%'], category: 'Antiallergic' },
  
  // Lubricants / Artificial Tears (Ophthalmic)
  'Carboxymethylcellulose': { type: 'Eye Drops', dosages: ['0.5%', '1%'], category: 'Lubricant' },
  'Hypromellose': { type: 'Eye Drops', dosages: ['0.3%', '0.5%'], category: 'Lubricant' },
  'Polyvinyl Alcohol': { type: 'Eye Drops', dosages: ['1.4%'], category: 'Lubricant' },
  'Sodium Hyaluronate': { type: 'Eye Drops', dosages: ['0.1%', '0.18%', '0.3%'], category: 'Lubricant' },
  'Hydroxypropyl Methylcellulose': { type: 'Eye Drops', dosages: ['0.3%', '0.5%'], category: 'Lubricant' },
  
  // Antivirals (Ophthalmic)
  'Acyclovir': { type: 'Ointment', dosages: ['3%'], category: 'Antiviral' },
  'Ganciclovir': { type: 'Gel', dosages: ['0.15%'], category: 'Antiviral' },
  'Trifluridine': { type: 'Eye Drops', dosages: ['1%'], category: 'Antiviral' },
  
  // Combination Medications (Ophthalmic)
  'Tobramycin + Dexamethasone': { type: 'Eye Drops', dosages: ['0.3% + 0.1%'], category: 'Combination' },
  'Neomycin + Polymyxin + Dexamethasone': { type: 'Eye Drops', dosages: ['Standard'], category: 'Combination' },
  'Dorzolamide + Timolol': { type: 'Eye Drops', dosages: ['2% + 0.5%'], category: 'Combination' },
  'Brinzolamide + Brimonidine': { type: 'Eye Drops', dosages: ['1% + 0.2%'], category: 'Combination' },
  'Brimonidine + Timolol': { type: 'Eye Drops', dosages: ['0.2% + 0.5%'], category: 'Combination' },
  
  // Antifungal (Ophthalmic)
  'Natamycin': { type: 'Eye Drops', dosages: ['5%'], category: 'Antifungal' },
  
  // Anti-VEGF (Intravitreal Injections)
  'Ranibizumab': { type: 'Injection', dosages: ['0.5mg/0.05mL'], category: 'Anti-VEGF' },
  'Aflibercept': { type: 'Injection', dosages: ['2mg/0.05mL'], category: 'Anti-VEGF' },
  'Bevacizumab': { type: 'Injection', dosages: ['1.25mg/0.05mL'], category: 'Anti-VEGF' },
  
  // Other Ophthalmic Medications
  'Carbachol': { type: 'Eye Drops', dosages: ['0.01%', '3%'], category: 'Miotic' },
  'Apraclonidine': { type: 'Eye Drops', dosages: ['0.5%', '1%'], category: 'Antiglaucoma' },
};

export default function MedicationsTab({
  currentMedications,
  prescriptionItems,
  canEdit,
  onSavePrescription,
  onPrintPrescription,
  onEmailPrescription,
  patientId,
}: MedicationsTabProps) {
  // ========== STATE ==========
  const [prescribedMeds, setPrescribedMeds] = useState<PrescriptionItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState<PrescriptionValidationResult | null>(null);
  const [pendingMedication, setPendingMedication] = useState<PrescriptionItem | null>(null);

  // New medication form state (ALWAYS VISIBLE)
  const [editingMed, setEditingMed] = useState<PrescriptionItem | null>(null);
  const [newMed, setNewMed] = useState<Partial<PrescriptionItem>>({
    drugName: '',
    drugType: 'Eye Drops',
    dosage: '',
    frequency: 'Twice daily (BD)',
    route: 'Both Eyes (OU)',
    eyeSpecificity: 'OU',
    odInstructions: '',
    osInstructions: '',
    ouInstructions: '',
    durationValue: 7,
    durationUnit: 'Days',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    refillsAllowed: 0,
  });

  // Available dosages based on selected medication
  const [availableDosages, setAvailableDosages] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    if (prescriptionItems) {
      setPrescribedMeds(prescriptionItems);
    }
  }, [prescriptionItems]);

  // Update available dosages when medication name changes
  useEffect(() => {
    if (newMed.drugName) {
      const medData = MEDICATION_DATABASE[newMed.drugName as keyof typeof MEDICATION_DATABASE];
      if (medData) {
        setAvailableDosages(medData.dosages);
        setNewMed(prev => ({ ...prev, drugType: medData.type }));
      } else {
        setAvailableDosages([]);
      }
    } else {
      setAvailableDosages([]);
    }
  }, [newMed.drugName]);

  // ========== HANDLERS ==========
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleAddMedication = async () => {
    if (!newMed.drugName || !newMed.dosage) {
      alert('Please fill in medication name and dosage');
      return;
    }

    // Validate prescription if patientId is available
    if (patientId && canEdit) {
      await handleValidateBeforeAdding();
      return;
    }

    // Skip validation and add directly
    addMedicationDirectly();
  };

  const handleValidateBeforeAdding = async () => {
    if (!patientId) return;

    setValidating(true);
    try {
      const medication: PrescriptionItem = {
        id: editingMed?.id || generateId(),
        drugName: newMed.drugName!,
        drugType: newMed.drugType!,
        dosage: newMed.dosage!,
        frequency: newMed.frequency!,
        route: newMed.route!,
        eyeSpecificity: newMed.eyeSpecificity!,
        odInstructions: newMed.odInstructions,
        osInstructions: newMed.osInstructions,
        ouInstructions: newMed.ouInstructions,
        durationValue: newMed.durationValue || 7,
        durationUnit: newMed.durationUnit || 'Days',
        instructions: newMed.instructions || '',
        startDate: newMed.startDate || new Date().toISOString().split('T')[0],
        refillsAllowed: newMed.refillsAllowed || 0,
      };

      // Prepare medications for validation (include existing + new)
      const allMedications: ValidatePrescriptionMedication[] = [
        ...prescribedMeds.map(m => ({
          medicationName: m.drugName,
          eyeSpecificity: m.eyeSpecificity,
          dosage: m.dosage,
          frequency: m.frequency,
          durationDays: m.durationUnit === 'Days' ? m.durationValue : m.durationValue * 7,
        })),
        {
          medicationName: medication.drugName,
          eyeSpecificity: medication.eyeSpecificity,
          dosage: medication.dosage,
          frequency: medication.frequency,
          durationDays: medication.durationUnit === 'Days' ? medication.durationValue : medication.durationValue * 7,
        },
      ];

      const result = await validatePrescription({
        patientId,
        medications: allMedications,
        checkAllergies: true,
        checkInteractions: true,
        checkContraindications: true,
        checkDuplicates: true,
      });

      setPendingMedication(medication);
      setValidationResult(result);
      setShowValidationModal(true);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Failed to validate prescription. Add without validation?');
      addMedicationDirectly();
    } finally {
      setValidating(false);
    }
  };

  const addMedicationDirectly = () => {

    const medication: PrescriptionItem = pendingMedication || {
      id: editingMed?.id || generateId(),
      drugName: newMed.drugName!,
      drugType: newMed.drugType!,
      dosage: newMed.dosage!,
      frequency: newMed.frequency!,
      route: newMed.route!,
      eyeSpecificity: newMed.eyeSpecificity!,
      odInstructions: newMed.odInstructions,
      osInstructions: newMed.osInstructions,
      ouInstructions: newMed.ouInstructions,
      durationValue: newMed.durationValue || 7,
      durationUnit: newMed.durationUnit || 'Days',
      instructions: newMed.instructions || '',
      startDate: newMed.startDate || new Date().toISOString().split('T')[0],
      refillsAllowed: newMed.refillsAllowed || 0,
    };

    if (editingMed) {
      // Update existing
      const updated = prescribedMeds.map((m) => (m.id === editingMed.id ? medication : m));
      setPrescribedMeds(updated);
      setEditingMed(null);
    } else {
      // Add new
      setPrescribedMeds([...prescribedMeds, medication]);
    }

    // Reset form
    resetForm();
    setPendingMedication(null);
    setHasChanges(true);
  };

  const handleValidationProceed = (overrideReason?: string) => {
    if (overrideReason) {
      console.log('Override reason:', overrideReason);
      // In production, save override reason to audit log
    }
    setShowValidationModal(false);
    addMedicationDirectly();
  };

  const handleValidationCancel = () => {
    setShowValidationModal(false);
    setPendingMedication(null);
    setValidationResult(null);
  };

  const resetForm = () => {
    setNewMed({
      drugName: '',
      drugType: 'Eye Drops',
      dosage: '',
      frequency: 'Twice daily (BD)',
      route: 'Both Eyes (OU)',
      eyeSpecificity: 'OU',
      odInstructions: '',
      osInstructions: '',
      ouInstructions: '',
      durationValue: 7,
      durationUnit: 'Days',
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
      refillsAllowed: 0,
    });
    setEditingMed(null);
    setAvailableDosages([]);
  };

  const handleEditMedication = (med: PrescriptionItem) => {
    setEditingMed(med);
    setNewMed(med);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMedication = (id: string) => {
    if (confirm('Are you sure you want to remove this medication?')) {
      setPrescribedMeds(prescribedMeds.filter((m) => m.id !== id));
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSavePrescription(prescribedMeds);
    setHasChanges(false);
    setSaving(false);
  };

  const formatDuration = (value: number, unit: string) => {
    return `${value} ${unit}`;
  };

  // Get medication names grouped by category
  const getMedicationsByCategory = () => {
    const grouped: Record<string, string[]> = {};
    Object.entries(MEDICATION_DATABASE).forEach(([name, data]) => {
      if (!grouped[data.category]) {
        grouped[data.category] = [];
      }
      grouped[data.category].push(name);
    });
    return grouped;
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-4">
      {/* ========== SECTION 1: CURRENT MEDICATIONS REVIEW ========== */}
      <ExamCard
        title="Current Medications Review"
        icon={<Pill className="w-5 h-5" />}
        badge={
          currentMedications && currentMedications.length > 0
            ? { text: `${currentMedications.length} Medication(s)`, variant: 'info' }
            : { text: 'None', variant: 'neutral' }
        }
      >
        {!currentMedications || currentMedications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Pill className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No current medications on record</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMedications.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-sm text-gray-900">{med.name}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {med.dosage || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {med.frequency || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {med.startDate
                        ? new Date(med.startDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ExamCard>

      {/* ========== SECTION 2: NEW PRESCRIPTION ========== */}
      <ExamCard
        title="New Prescription"
        icon={<Plus className="w-5 h-5" />}
        badge={editingMed ? { text: 'Editing', variant: 'info' } : undefined}
      >
        <div className="space-y-4">
          {/* Header with clear/cancel button */}
          {editingMed && (
            <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Editing: {editingMed.drugName}
                </span>
              </div>
              <button
                onClick={resetForm}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Medication Name */}
            <ExamSelect
              label="Medication Name *"
              value={newMed.drugName || ''}
              onChange={(value) => setNewMed({ ...newMed, drugName: value, dosage: '' })}
              disabled={!canEdit}
              className="md:col-span-3"
            >
              <option value="">Select medication</option>
              {Object.keys(MEDICATION_DATABASE).sort().map((med) => (
                <option key={med} value={med}>
                  {med}
                </option>
              ))}
            </ExamSelect>

            {/* Type (Auto-filled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Type
              </label>
              <input
                type="text"
                value={newMed.drugType || 'Eye Drops'}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                disabled={true}
              />
            </div>

            {/* Dosage - Dropdown or Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Dosage *
              </label>
              {availableDosages.length > 0 ? (
                <select
                  value={newMed.dosage || ''}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {availableDosages.map((dosage) => (
                    <option key={dosage} value={dosage}>
                      {dosage}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newMed.dosage || ''}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={!canEdit || !newMed.drugName}
                />
              )}
            </div>

            {/* Frequency */}
            <ExamSelect
              label="Frequency"
              value={newMed.frequency || ''}
              onChange={(value) => setNewMed({ ...newMed, frequency: value })}
              disabled={!canEdit}
            >
              <option value="Once daily (OD)">Once daily (OD)</option>
              <option value="Twice daily (BD)">Twice daily (BD)</option>
              <option value="Thrice daily (TDS)">Thrice daily (TDS)</option>
              <option value="Four times daily (QID)">Four times daily (QID)</option>
              <option value="Every 2 hours">Every 2 hours</option>
              <option value="Every hour">Every hour</option>
              <option value="At bedtime (HS)">At bedtime (HS)</option>
              <option value="PRN (as needed)">PRN (as needed)</option>
            </ExamSelect>

            {/* Eye Specificity - Radio Group */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eye Specificity *
              </label>
              <RadioGroup 
                value={newMed.eyeSpecificity} 
                onChange={(value: 'OD' | 'OS' | 'OU' | 'Systemic') => 
                  setNewMed({ ...newMed, eyeSpecificity: value })
                }
                disabled={!canEdit}
              >
                <div className="grid grid-cols-4 gap-3">
                  <RadioGroup.Option value="OD">
                    {({ checked }) => (
                      <div
                        className={`cursor-pointer rounded-lg px-4 py-3 text-center font-medium border-2 transition-all ${
                          checked
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-sm font-semibold">OD</div>
                        <div className="text-xs text-gray-500">Right Eye</div>
                      </div>
                    )}
                  </RadioGroup.Option>
                  <RadioGroup.Option value="OS">
                    {({ checked }) => (
                      <div
                        className={`cursor-pointer rounded-lg px-4 py-3 text-center font-medium border-2 transition-all ${
                          checked
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-sm font-semibold">OS</div>
                        <div className="text-xs text-gray-500">Left Eye</div>
                      </div>
                    )}
                  </RadioGroup.Option>
                  <RadioGroup.Option value="OU">
                    {({ checked }) => (
                      <div
                        className={`cursor-pointer rounded-lg px-4 py-3 text-center font-medium border-2 transition-all ${
                          checked
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-sm font-semibold">OU</div>
                        <div className="text-xs text-gray-500">Both Eyes</div>
                      </div>
                    )}
                  </RadioGroup.Option>
                  <RadioGroup.Option value="Systemic">
                    {({ checked }) => (
                      <div
                        className={`cursor-pointer rounded-lg px-4 py-3 text-center font-medium border-2 transition-all ${
                          checked
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-sm font-semibold">Systemic</div>
                        <div className="text-xs text-gray-500">Oral/IV</div>
                      </div>
                    )}
                  </RadioGroup.Option>
                </div>
              </RadioGroup>
            </div>

            {/* Eye-Specific Instructions (conditional) */}
            {newMed.eyeSpecificity === 'OD' && (
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Right Eye (OD) Instructions
                </label>
                <input
                  type="text"
                  value={newMed.odInstructions || ''}
                  onChange={(e) => setNewMed({ ...newMed, odInstructions: e.target.value })}
                  placeholder="Specific instructions for right eye..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!canEdit}
                />
              </div>
            )}

            {newMed.eyeSpecificity === 'OS' && (
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Left Eye (OS) Instructions
                </label>
                <input
                  type="text"
                  value={newMed.osInstructions || ''}
                  onChange={(e) => setNewMed({ ...newMed, osInstructions: e.target.value })}
                  placeholder="Specific instructions for left eye..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!canEdit}
                />
              </div>
            )}

            {newMed.eyeSpecificity === 'OU' && (
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Both Eyes (OU) Instructions
                </label>
                <input
                  type="text"
                  value={newMed.ouInstructions || ''}
                  onChange={(e) => setNewMed({ ...newMed, ouInstructions: e.target.value })}
                  placeholder="Instructions for both eyes..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!canEdit}
                />
              </div>
            )}

            {/* Route - Keep for backwards compatibility but hidden by default */}
            <input type="hidden" value={newMed.route || 'Both Eyes (OU)'} />

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={newMed.durationValue || 7}
                  onChange={(e) =>
                    setNewMed({ ...newMed, durationValue: parseInt(e.target.value) || 7 })
                  }
                  className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={!canEdit}
                />
                <select
                  value={newMed.durationUnit || 'Days'}
                  onChange={(e) => setNewMed({ ...newMed, durationUnit: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  disabled={!canEdit}
                >
                  <option value="Days">Days</option>
                  <option value="Weeks">Weeks</option>
                  <option value="Months">Months</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>
            </div>

            {/* Start Date */}
            <ExamInput
              label="Start Date"
              type="date"
              value={typeof newMed.startDate === 'string' ? newMed.startDate : new Date().toISOString().split('T')[0]}
              onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })}
              disabled={!canEdit}
            />

            {/* Refills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Refills
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={newMed.refillsAllowed || 0}
                onChange={(e) =>
                  setNewMed({ ...newMed, refillsAllowed: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={!canEdit}
              />
            </div>

            {/* Instructions */}
            <ExamInput
              label="Instructions"
              value={newMed.instructions || ''}
              onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
              disabled={!canEdit}
              className="md:col-span-3"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
            {!editingMed && (
              <ActionButton
                variant="secondary"
                onClick={resetForm}
                disabled={!newMed.drugName && !newMed.dosage}
              >
                Clear
              </ActionButton>
            )}
            <ActionButton
              variant="primary"
              onClick={handleAddMedication}
              disabled={!canEdit || !newMed.drugName || !newMed.dosage || validating}
              icon={
                validating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : editingMed ? (
                  <Edit2 className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )
              }
            >
              {validating
                ? 'Validating...'
                : editingMed
                ? 'Update'
                : patientId
                ? 'Validate & Add'
                : 'Add to Prescription'}
            </ActionButton>
            {patientId && !validating && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <ShieldCheck className="w-3 h-3" />
                <span>Safety checks enabled</span>
              </div>
            )}
          </div>
        </div>
      </ExamCard>

      {/* ==​========== SECTION 3: PRESCRIBED MEDICATIONS (THIS VISIT) ========== */}
      <ExamCard
        title="Prescribed Medications (This Visit)"
        icon={<Pill className="w-5 h-5" />}
        badge={
          prescribedMeds.length > 0
            ? { text: `${prescribedMeds.length} Prescribed`, variant: 'success' }
            : { text: 'None', variant: 'neutral' }
        }
      >
        {prescribedMeds.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Pill className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium">No medications prescribed yet</p>
            <p className="text-xs mt-1">Add medications using the form above</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {prescribedMeds.map((med) => (
                <div
                  key={med.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{med.drugName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{med.dosage}</span> •{' '}
                        <span>{med.frequency}</span> •{' '}
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {med.eyeSpecificity}
                        </span>
                      </p>
                      {med.eyeSpecificity === 'OD' && med.odInstructions && (
                        <p className="text-xs text-blue-700 mt-2 italic bg-blue-50 p-2 rounded">
                          OD: {med.odInstructions}
                        </p>
                      )}
                      {med.eyeSpecificity === 'OS' && med.osInstructions && (
                        <p className="text-xs text-blue-700 mt-2 italic bg-blue-50 p-2 rounded">
                          OS: {med.osInstructions}
                        </p>
                      )}
                      {med.eyeSpecificity === 'OU' && med.ouInstructions && (
                        <p className="text-xs text-blue-700 mt-2 italic bg-blue-50 p-2 rounded">
                          OU: {med.ouInstructions}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {formatDuration(med.durationValue, med.durationUnit)} •
                        Start: {new Date(med.startDate).toLocaleDateString()} •
                        Refills: {med.refillsAllowed}
                      </p>
                      {med.instructions && (
                        <p className="text-xs text-gray-700 mt-2 italic bg-gray-50 p-2 rounded">
                          General: {med.instructions}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditMedication(med)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit medication"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(med.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Remove medication"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <ActionButton
                  variant="primary"
                  size="lg"
                  onClick={onPrintPrescription}
                  icon={<Printer className="w-4 h-4" />}
                  disabled={prescribedMeds.length === 0}
                >
                  Print Prescription
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  onClick={onEmailPrescription}
                  icon={<Mail className="w-4 h-4" />}
                  disabled={prescribedMeds.length === 0}
                >
                  Email to Patient
                </ActionButton>
              </div>

              {hasChanges && (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Unsaved changes
                  </p>
                  <ActionButton variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Draft'}
                  </ActionButton>
                </div>
              )}
            </div>
          </>
        )}
      </ExamCard>

      {/* Prescription Validation Modal */}
      <PrescriptionValidationModal
        isOpen={showValidationModal}
        onClose={handleValidationCancel}
        onProceed={handleValidationProceed}
        validationResult={validationResult}
      />
    </div>
  );
}
