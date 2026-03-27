'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Edit2, Trash2 } from 'lucide-react';
import { patientApi, type Patient } from '@/lib/api/patients.api';

interface MedicalHistoryTabContentProps {
  patientId: string;
  canEdit?: boolean;
  patientDetails?: Patient | null;
  onUpdate?: (updatedPatient: Patient) => void;
}

// Predefined options for dropdowns
const CHRONIC_CONDITIONS_LIST = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Asthma', 'COPD',
  'Heart Disease', 'Coronary Artery Disease', 'Arthritis', 'Osteoarthritis', 'Rheumatoid Arthritis',
  'Thyroid Disorder', 'Hypothyroidism', 'Hyperthyroidism', 'Kidney Disease', 'Liver Disease',
  'Cancer', 'Epilepsy', 'Migraine', 'Depression', 'Anxiety Disorder', 'Bipolar Disorder',
  'Glaucoma', 'Cataracts', 'Macular Degeneration', 'Diabetic Retinopathy', 'Other'
];

const MEDICATIONS_LIST = [
  'Metformin', 'Lisinopril', 'Atorvastatin', 'Levothyroxine', 'Amlodipine',
  'Metoprolol', 'Omeprazole', 'Losartan', 'Gabapentin', 'Hydrochlorothiazide',
  'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Insulin', 'Warfarin',
  'Prednisone', 'Albuterol', 'Simvastatin', 'Furosemide', 'Other'
];

const ALLERGIES_LIST = [
  'Penicillin', 'Amoxicillin', 'Sulfa Drugs', 'Aspirin', 'NSAIDs', 'Latex',
  'Peanuts', 'Tree Nuts', 'Shellfish', 'Eggs', 'Dairy', 'Wheat', 'Soy',
  'Pollen', 'Dust Mites', 'Pet Dander', 'Mold', 'Bee Stings', 'Other'
];

const SURGERIES_LIST = [
  'Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'Cesarean Section', 'Hysterectomy',
  'Knee Replacement', 'Hip Replacement', 'Cataract Surgery', 'LASIK', 'Bypass Surgery',
  'Angioplasty', 'Tonsillectomy', 'Gallbladder Removal', 'Spinal Fusion', 'Other'
];

const FAMILY_CONDITIONS_LIST = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Stroke', 'Cancer',
  'Alzheimer\'s Disease', 'Glaucoma', 'Macular Degeneration', 'Asthma',
  'Kidney Disease', 'Mental Health Disorders', 'Other'
];

const IMMUNIZATIONS_LIST = [
  'COVID-19', 'Influenza', 'Tetanus', 'Hepatitis A', 'Hepatitis B',
  'MMR', 'Varicella', 'Pneumococcal', 'HPV', 'Shingles',
  'Meningococcal', 'Polio', 'Other'
];

const FAMILY_RELATIONSHIPS = ['Mother', 'Father', 'Sister', 'Brother', 'Maternal Grandmother', 'Maternal Grandfather', 'Paternal Grandmother', 'Paternal Grandfather', 'Aunt', 'Uncle'];
const SEVERITY_LEVELS = ['Mild', 'Moderate', 'Severe', 'Life-threatening'];
const CONDITION_STATUS = ['Active', 'Controlled', 'In Remission', 'Resolved'];
const ALLERGY_TYPES = ['Drug', 'Food', 'Environmental', 'Other'];
const MEDICATION_ROUTES = ['Oral', 'Injection', 'Topical', 'Inhalation', 'Eye Drops', 'Other'];
const SMOKING_STATUS_OPTIONS = ['Never', 'Former', 'Current - Light (<10/day)', 'Current - Moderate (10-20/day)', 'Current - Heavy (>20/day)'];
const ALCOHOL_USE_OPTIONS = ['None', 'Occasional (1-2 drinks/week)', 'Moderate (3-7 drinks/week)', 'Heavy (>7 drinks/week)'];

type ChronicCondition = {
  id: string;
  name: string;
  diagnosedYear?: string;
  severity?: string;
  status?: string;
  notes?: string;
};

type Medication = {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  route?: string;
  notes?: string;
};

type Allergy = {
  id: string;
  name: string;
  severity?: string;
  reactions?: string;
  type?: string;
  notes?: string;
};

type Surgery = {
  id: string;
  name: string;
  date?: string;
  outcome?: string;
  notes?: string;
};

type FamilyCondition = {
  id: string;
  condition: string;
  relationship?: string;
  ageOfOnset?: string;
  notes?: string;
};

type Immunization = {
  id: string;
  vaccine: string;
  date?: string;
  doseNumber?: string;
  notes?: string;
};

// Inline Form Components - Single Line Horizontal
function ConditionInlineForm({ 
  condition, 
  onSave, 
  onCancel 
}: { 
  condition: ChronicCondition | null; 
  onSave: (data: Omit<ChronicCondition, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: condition?.name || '',
    diagnosedYear: condition?.diagnosedYear || '',
    severity: condition?.severity || '',
    status: condition?.status || '',
    notes: condition?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please select a condition');
      return;
    }
    onSave(formData);
    // Reset form after save
    setFormData({ name: '', diagnosedYear: '', severity: '', status: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap hover:border-gray-300 transition-colors">
      <select
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        required
      >
        <option value="">Condition *</option>
        {CHRONIC_CONDITIONS_LIST.map(cond => (
          <option key={cond} value={cond}>{cond}</option>
        ))}
      </select>
      <input
        type="number"
        value={formData.diagnosedYear}
        onChange={(e) => setFormData({ ...formData, diagnosedYear: e.target.value })}
        className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        min="1900"
        max={new Date().getFullYear()}
      />
      <select
        value={formData.severity}
        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
        className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      >
        <option value="">Severity</option>
        {SEVERITY_LEVELS.map(level => (
          <option key={level} value={level}>{level}</option>
        ))}
      </select>
      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      >
        <option value="">Status</option>
        {CONDITION_STATUS.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
      <input
        type="text"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      {condition && (
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
      >
        {condition ? 'Update' : 'Add'}
      </button>
    </form>
  );
}

function MedicationInlineForm({ 
  medication, 
  onSave, 
  onCancel 
}: { 
  medication: Medication | null; 
  onSave: (data: Omit<Medication, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: medication?.name || '',
    dosage: medication?.dosage || '',
    frequency: medication?.frequency || '',
    startDate: medication?.startDate || '',
    route: medication?.route || '',
    notes: medication?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please select a medication');
      return;
    }
    onSave(formData);
    setFormData({ name: '', dosage: '', frequency: '', startDate: '', route: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap hover:border-gray-300 transition-colors">
      <select
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        required
      >
        <option value="">Medication *</option>
        {MEDICATIONS_LIST.map(med => (
          <option key={med} value={med}>{med}</option>
        ))}
      </select>
      <input
        type="text"
        value={formData.dosage}
        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
        className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      <input
        type="text"
        value={formData.frequency}
        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
        className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      <select
        value={formData.route}
        onChange={(e) => setFormData({ ...formData, route: e.target.value })}
        className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      >
        <option value="">Route</option>
        {MEDICATION_ROUTES.map(route => (
          <option key={route} value={route}>{route}</option>
        ))}
      </select>
      <input
        type="date"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        className="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      <input
        type="text"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      {medication && (
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
      >
        {medication ? 'Update' : 'Add'}
      </button>
    </form>
  );
}

function AllergyInlineForm({ 
  allergy, 
  onSave, 
  onCancel 
}: { 
  allergy: Allergy | null; 
  onSave: (data: Omit<Allergy, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: allergy?.name || '',
    type: allergy?.type || '',
    severity: allergy?.severity || '',
    reactions: allergy?.reactions || '',
    notes: allergy?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please select an allergen');
      return;
    }
    onSave(formData);
    setFormData({ name: '', type: '', severity: '', reactions: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap hover:border-gray-300 transition-colors">
      <select
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        required
      >
        <option value="">Allergen *</option>
        {ALLERGIES_LIST.map(allergen => (
          <option key={allergen} value={allergen}>{allergen}</option>
        ))}
      </select>
      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      >
        <option value="">Type</option>
        {ALLERGY_TYPES.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <select
        value={formData.severity}
        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
        className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      >
        <option value="">Severity</option>
        {SEVERITY_LEVELS.map(level => (
          <option key={level} value={level}>{level}</option>
        ))}
      </select>
      <input
        type="text"
        value={formData.reactions}
        onChange={(e) => setFormData({ ...formData, reactions: e.target.value })}
        className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      <input
        type="text"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      {allergy && (
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
      >
        {allergy ? 'Update' : 'Add'}
      </button>
    </form>
  );
}

function SurgeryInlineForm({ 
  surgery, 
  onSave, 
  onCancel 
}: { 
  surgery: Surgery | null; 
  onSave: (data: Omit<Surgery, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: surgery?.name || '',
    date: surgery?.date || '',
    outcome: surgery?.outcome || '',
    notes: surgery?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please select a surgery');
      return;
    }
    onSave(formData);
    setFormData({ name: '', date: '', outcome: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap hover:border-gray-300 transition-colors">
      <select
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        required
      >
        <option value="">Surgery *</option>
        {SURGERIES_LIST.map(surg => (
          <option key={surg} value={surg}>{surg}</option>
        ))}
      </select>
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      <input
        type="text"
        value={formData.outcome}
        onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
        className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      <input
        type="text"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      {surgery && (
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
      >
        {surgery ? 'Update' : 'Add'}
      </button>
    </form>
  );
}

function FamilyInlineForm({ 
  family, 
  onSave, 
  onCancel 
}: { 
  family: FamilyCondition | null; 
  onSave: (data: Omit<FamilyCondition, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    condition: family?.condition || '',
    relationship: family?.relationship || '',
    ageOfOnset: family?.ageOfOnset || '',
    notes: family?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.condition.trim()) {
      toast.error('Please select a condition');
      return;
    }
    onSave(formData);
    setFormData({ condition: '', relationship: '', ageOfOnset: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap hover:border-gray-300 transition-colors">
      <select
        value={formData.condition}
        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
        className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        required
      >
        <option value="">Condition *</option>
        {FAMILY_CONDITIONS_LIST.map(cond => (
          <option key={cond} value={cond}>{cond}</option>
        ))}
      </select>
      <select
        value={formData.relationship}
        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
        className="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      >
        <option value="">Relationship</option>
        {FAMILY_RELATIONSHIPS.map(rel => (
          <option key={rel} value={rel}>{rel}</option>
        ))}
      </select>
      <input
        type="text"
        value={formData.ageOfOnset}
        onChange={(e) => setFormData({ ...formData, ageOfOnset: e.target.value })}
        className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      <input
        type="text"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      {family && (
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
      >
        {family ? 'Update' : 'Add'}
      </button>
    </form>
  );
}

function ImmunizationInlineForm({ 
  immunization, 
  onSave, 
  onCancel 
}: { 
  immunization: Immunization | null; 
  onSave: (data: Omit<Immunization, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    vaccine: immunization?.vaccine || '',
    date: immunization?.date || '',
    doseNumber: immunization?.doseNumber || '',
    notes: immunization?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vaccine.trim()) {
      toast.error('Please select a vaccine');
      return;
    }
    onSave(formData);
    setFormData({ vaccine: '', date: '', doseNumber: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap hover:border-gray-300 transition-colors">
      <select
        value={formData.vaccine}
        onChange={(e) => setFormData({ ...formData, vaccine: e.target.value })}
        className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        required
      >
        <option value="">Vaccine *</option>
        {IMMUNIZATIONS_LIST.map(vac => (
          <option key={vac} value={vac}>{vac}</option>
        ))}
      </select>
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      <input
        type="text"
        value={formData.doseNumber}
        onChange={(e) => setFormData({ ...formData, doseNumber: e.target.value })}
        className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      <input
        type="text"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
      />
      {immunization && (
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
      >
        {immunization ? 'Update' : 'Add'}
      </button>
    </form>
  );
}

export function MedicalHistoryTabContent({ patientId, canEdit = true, patientDetails, onUpdate }: MedicalHistoryTabContentProps) {
  const [chronicConditions, setChronicConditions] = useState<ChronicCondition[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [familyHistory, setFamilyHistory] = useState<FamilyCondition[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  
  const [smokingStatus, setSmokingStatus] = useState('');
  const [smokingQuitDate, setSmokingQuitDate] = useState('');
  const [smokingPackYears, setSmokingPackYears] = useState('');
  const [alcoholUse, setAlcoholUse] = useState('');
  const [exerciseHabits, setExerciseHabits] = useState('');
  const [dietType, setDietType] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');
  const [disabilityStatus, setDisabilityStatus] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [localPatient, setLocalPatient] = useState<Patient | null>(null);

  // Editing states
  const [editingCondition, setEditingCondition] = useState<ChronicCondition | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
  const [editingFamily, setEditingFamily] = useState<FamilyCondition | null>(null);
  const [editingImmunization, setEditingImmunization] = useState<Immunization | null>(null);

  // Load patient data
  useEffect(() => {
    const loadPatientData = async () => {
      if (patientDetails) {
        setLocalPatient(patientDetails);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await patientApi.getById(patientId);
        setLocalPatient(response.data);
      } catch (error) {
        console.error('Failed to load patient:', error);
        toast.error('Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientId, patientDetails]);

  // Parse JSON data from patient record
  useEffect(() => {
    if (localPatient) {
      try {
        const parseJSON = (field: any) => {
          if (!field) return [];
          try {
            return typeof field === 'string' ? JSON.parse(field) : Array.isArray(field) ? field : [];
          } catch {
            return [];
          }
        };

        setChronicConditions(parseJSON((localPatient as any).chronicConditions));
        setMedications(parseJSON((localPatient as any).currentMedications));
        setAllergies(parseJSON((localPatient as any).knownAllergiesDetails));
        setSurgeries(parseJSON((localPatient as any).pastSurgeries));
        setFamilyHistory(parseJSON((localPatient as any).familyMedicalHistory));
        setImmunizations(parseJSON((localPatient as any).immunizationRecords));
        
        setSmokingStatus((localPatient as any).smokingStatus || '');
        setAlcoholUse((localPatient as any).alcoholUse || '');
        setExerciseHabits((localPatient as any).exerciseHabits || '');
        setDietType((localPatient as any).dietType || '');
        setLifestyleNotes((localPatient as any).lifestyleNotes || '');
        setDisabilityStatus((localPatient as any).disabilityStatus || '');
        setSpecialNeeds((localPatient as any).specialNeeds || '');
        
        setHasChanges(false);
      } catch (error) {
        console.error('Error parsing medical history:', error);
      }
    }
  }, [localPatient]);

  const markChanged = () => setHasChanges(true);

  const handleSave = async () => {
    if (!canEdit) {
      toast.error('You do not have permission to edit patient records');
      return;
    }

    setSaving(true);
    try {
      const updatePayload = {
        ...localPatient,
        chronicConditions: JSON.stringify(chronicConditions),
        currentMedications: JSON.stringify(medications),
        knownAllergiesDetails: JSON.stringify(allergies),
        pastSurgeries: JSON.stringify(surgeries),
        familyMedicalHistory: JSON.stringify(familyHistory),
        immunizationRecords: JSON.stringify(immunizations),
        smokingStatus,
        alcoholUse,
        exerciseHabits,
        dietType,
        lifestyleNotes,
        disabilityStatus,
        specialNeeds,
      };

      const response = await patientApi.update(patientId, updatePayload as any);
      toast.success('Medical history updated successfully');
      setHasChanges(false);
      setLocalPatient(response.data);
      
      if (onUpdate && response.data) {
        onUpdate(response.data);
      }
    } catch (error: any) {
      console.error('Failed to update medical history:', error);
      toast.error(error?.response?.data?.message || 'Failed to update medical history');
    } finally {
      setSaving(false);
    }
  };

  // Add/Edit/Delete handlers for Chronic Conditions
  const handleAddCondition = (condition: Omit<ChronicCondition, 'id'>) => {
    const newCondition = { ...condition, id: Date.now().toString() };
    setChronicConditions([...chronicConditions, newCondition]);
    setEditingCondition(null);
    markChanged();
  };

  const handleEditCondition = (condition: ChronicCondition) => {
    setChronicConditions(chronicConditions.map(c => c.id === condition.id ? condition : c));
    setEditingCondition(null);
    markChanged();
  };

  const handleDeleteCondition = (id: string) => {
    setChronicConditions(chronicConditions.filter(c => c.id !== id));
    markChanged();
  };

  // Medication handlers
  const handleAddMedication = (medication: Omit<Medication, 'id'>) => {
    const newMedication = { ...medication, id: Date.now().toString() };
    setMedications([...medications, newMedication]);
    setEditingMedication(null);
    markChanged();
  };

  const handleEditMedication = (medication: Medication) => {
    setMedications(medications.map(m => m.id === medication.id ? medication : m));
    setEditingMedication(null);
    markChanged();
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
    markChanged();
  };

  // Allergy handlers
  const handleAddAllergy = (allergy: Omit<Allergy, 'id'>) => {
    const newAllergy = { ...allergy, id: Date.now().toString() };
    setAllergies([...allergies, newAllergy]);
    setEditingAllergy(null);
    markChanged();
  };

  const handleEditAllergy = (allergy: Allergy) => {
    setAllergies(allergies.map(a => a.id === allergy.id ? allergy : a));
    setEditingAllergy(null);
    markChanged();
  };

  const handleDeleteAllergy = (id: string) => {
    setAllergies(allergies.filter(a => a.id !== id));
    markChanged();
  };

  // Surgery handlers
  const handleAddSurgery = (surgery: Omit<Surgery, 'id'>) => {
    const newSurgery = { ...surgery, id: Date.now().toString() };
    setSurgeries([...surgeries, newSurgery]);
    setEditingSurgery(null);
    markChanged();
  };

  const handleEditSurgery = (surgery: Surgery) => {
    setSurgeries(surgeries.map(s => s.id === surgery.id ? surgery : s));
    setEditingSurgery(null);
    markChanged();
  };

  const handleDeleteSurgery = (id: string) => {
    setSurgeries(surgeries.filter(s => s.id !== id));
    markChanged();
  };

  // Family history handlers
  const handleAddFamily = (family: Omit<FamilyCondition, 'id'>) => {
    const newFamily = { ...family, id: Date.now().toString() };
    setFamilyHistory([...familyHistory, newFamily]);
    setEditingFamily(null);
    markChanged();
  };

  const handleEditFamily = (family: FamilyCondition) => {
    setFamilyHistory(familyHistory.map(f => f.id === family.id ? family : f));
    setEditingFamily(null);
    markChanged();
  };

  const handleDeleteFamily = (id: string) => {
    setFamilyHistory(familyHistory.filter(f => f.id !== id));
    markChanged();
  };

  // Immunization handlers
  const handleAddImmunization = (immunization: Omit<Immunization, 'id'>) => {
    const newImmunization = { ...immunization, id: Date.now().toString() };
    setImmunizations([...immunizations, newImmunization]);
    setEditingImmunization(null);
    markChanged();
  };

  const handleEditImmunization = (immunization: Immunization) => {
    setImmunizations(immunizations.map(i => i.id === immunization.id ? immunization : i));
    setEditingImmunization(null);
    markChanged();
  };

  const handleDeleteImmunization = (id: string) => {
    setImmunizations(immunizations.filter(i => i.id !== id));
    markChanged();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading medical history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chronic Medical Conditions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Chronic Medical Conditions</h3>
        </div>
        
        <div>
          {/* Items List */}
          {chronicConditions.length > 0 && (
            <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
              {chronicConditions.map((condition, index) => (
                <div key={condition.id} className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors flex items-start justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 text-sm">{condition.name}</span>
                      {condition.diagnosedYear && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Year: {condition.diagnosedYear}</span>
                      )}
                      {condition.severity && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{condition.severity}</span>
                      )}
                      {condition.status && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{condition.status}</span>
                      )}
                    </div>
                    {condition.notes && <p className="text-xs text-gray-500 mt-1 ml-0">{condition.notes}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingCondition(condition)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCondition(condition.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Add/Edit Form - Always Visible */}
          {canEdit && (
            <ConditionInlineForm
              condition={editingCondition}
              onSave={(data) => editingCondition ? handleEditCondition({...editingCondition, ...data}) : handleAddCondition(data)}
              onCancel={() => setEditingCondition(null)}
            />
          )}
        </div>
      </div>

      {/* Current Medications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
        </div>
        
        <div>
          {/* Items List */}
          {medications.length > 0 && (
            <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
              {medications.map((medication) => (
                <div key={medication.id} className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors flex items-start justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 text-sm">{medication.name}</span>
                      {medication.dosage && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Dosage: {medication.dosage}</span>
                      )}
                      {medication.frequency && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{medication.frequency}</span>
                      )}
                      {medication.route && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{medication.route}</span>
                      )}
                      {medication.startDate && (
                        <span className="text-xs text-gray-500">Started: {medication.startDate}</span>
                      )}
                    </div>
                    {medication.notes && <p className="text-xs text-gray-500 mt-1">{medication.notes}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingMedication(medication)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedication(medication.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Add/Edit Form - Always Visible */}
          {canEdit && (
            <MedicationInlineForm
              medication={editingMedication}
              onSave={(data) => editingMedication ? handleEditMedication({...editingMedication, ...data}) : handleAddMedication(data)}
              onCancel={() => setEditingMedication(null)}
            />
          )}
        </div>
      </div>

      {/* Known Allergies */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Known Allergies</h3>
        </div>
        
        <div>
          {/* Items List */}
          {allergies.length > 0 && (
            <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
              {allergies.map((allergy) => (
                <div key={allergy.id} className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors flex items-start justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 text-sm">{allergy.name}</span>
                      {allergy.type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Type: {allergy.type}</span>
                      )}
                      {allergy.severity && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{allergy.severity}</span>
                      )}
                      {allergy.reactions && (
                        <span className="text-xs text-gray-500">Reactions: {allergy.reactions}</span>
                      )}
                    </div>
                    {allergy.notes && <p className="text-xs text-gray-500 mt-1">{allergy.notes}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingAllergy(allergy)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAllergy(allergy.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Add/Edit Form - Always Visible */}
          {canEdit && (
            <AllergyInlineForm
              allergy={editingAllergy}
              onSave={(data) => editingAllergy ? handleEditAllergy({...editingAllergy, ...data}) : handleAddAllergy(data)}
              onCancel={() => setEditingAllergy(null)}
            />
          )}
        </div>
      </div>

      {/* Past Surgeries */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Past Surgeries</h3>
        </div>
        
        <div>
          {/* Items List */}
          {surgeries.length > 0 && (
            <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
              {surgeries.map((surgery) => (
                <div key={surgery.id} className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors flex items-start justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 text-sm">{surgery.name}</span>
                      {surgery.date && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Date: {surgery.date}</span>
                      )}
                      {surgery.outcome && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{surgery.outcome}</span>
                      )}
                    </div>
                    {surgery.notes && <p className="text-xs text-gray-500 mt-1">{surgery.notes}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingSurgery(surgery)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSurgery(surgery.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Add/Edit Form - Always Visible */}
          {canEdit && (
            <SurgeryInlineForm
              surgery={editingSurgery}
              onSave={(data) => editingSurgery ? handleEditSurgery({...editingSurgery, ...data}) : handleAddSurgery(data)}
              onCancel={() => setEditingSurgery(null)}
            />
          )}
        </div>
      </div>

      {/* Family Medical History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Family Medical History</h3>
        </div>
        
        <div>
          {/* Items List */}
          {familyHistory.length > 0 && (
            <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
              {familyHistory.map((family) => (
                <div key={family.id} className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors flex items-start justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 text-sm">{family.condition}</span>
                      {family.relationship && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Relation: {family.relationship}</span>
                      )}
                      {family.ageOfOnset && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Age: {family.ageOfOnset}</span>
                      )}
                    </div>
                    {family.notes && <p className="text-xs text-gray-500 mt-1">{family.notes}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingFamily(family)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFamily(family.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Add/Edit Form - Always Visible */}
          {canEdit && (
            <FamilyInlineForm
              family={editingFamily}
              onSave={(data) => editingFamily ? handleEditFamily({...editingFamily, ...data}) : handleAddFamily(data)}
              onCancel={() => setEditingFamily(null)}
            />
          )}
        </div>
      </div>

      {/* Immunization Records */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Immunization Records</h3>
        </div>
        
        <div>
          {/* Items List */}
          {immunizations.length > 0 && (
            <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
              {immunizations.map((immunization) => (
                <div key={immunization.id} className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors flex items-start justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 text-sm">{immunization.vaccine}</span>
                      {immunization.date && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Date: {immunization.date}</span>
                      )}
                      {immunization.doseNumber && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Dose: {immunization.doseNumber}</span>
                      )}
                    </div>
                    {immunization.notes && <p className="text-xs text-gray-500 mt-1">{immunization.notes}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingImmunization(immunization)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteImmunization(immunization.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Add/Edit Form - Always Visible */}
          {canEdit && (
            <ImmunizationInlineForm
              immunization={editingImmunization}
              onSave={(data) => editingImmunization ? handleEditImmunization({...editingImmunization, ...data}) : handleAddImmunization(data)}
              onCancel={() => setEditingImmunization(null)}
            />
          )}
        </div>
      </div>

      {/* Lifestyle Factors */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Lifestyle Factors</h3>
        </div>
        <div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
            <select
              value={smokingStatus}
              onChange={(e) => { setSmokingStatus(e.target.value); markChanged(); }}
              disabled={!canEdit}
              className="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">Smoking Status</option>
              {SMOKING_STATUS_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={alcoholUse}
              onChange={(e) => { setAlcoholUse(e.target.value); markChanged(); }}
              disabled={!canEdit}
              className="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">Alcohol Use</option>
              {ALCOHOL_USE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              type="text"
              value={exerciseHabits}
              onChange={(e) => { setExerciseHabits(e.target.value); markChanged(); }}
              disabled={!canEdit}
              className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
            <input
              type="text"
              value={dietType}
              onChange={(e) => { setDietType(e.target.value); markChanged(); }}
              disabled={!canEdit}
              className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
            <input
              type="text"
              value={lifestyleNotes}
              onChange={(e) => { setLifestyleNotes(e.target.value); markChanged(); }}
              disabled={!canEdit}
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Disability & Special Needs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Disability & Special Needs</h3>
        </div>
        <div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={disabilityStatus}
              onChange={(e) => { setDisabilityStatus(e.target.value); markChanged(); }}
              disabled={!canEdit}
              className="flex-1 min-w-[250px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
            <input
              type="text"
              value={specialNeeds}
              onChange={(e) => { setSpecialNeeds(e.target.value); markChanged(); }}
              disabled={!canEdit}
              className="flex-1 min-w-[250px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-2 shadow-sm">
          <div className="flex items-center justify-end gap-4 px-4">
            <p className="text-sm text-gray-600">
              {hasChanges ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  All changes saved
                </span>
              )}
            </p>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Medical History'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
