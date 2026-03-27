'use client';

import { useState, useEffect } from 'react';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, ActionButton } from './ExamCard';
import { Eye, CircleDot, Users, Sparkles } from 'lucide-react';

// Type definitions for Anterior Segment examination
interface PupilExamData {
  // OD (Right Eye)
  sizeLightOD?: number; // mm
  sizeDarkOD?: number; // mm
  shapeOD?: string;
  directReactionOD?: string;
  consensualReactionOD?: string;
  
  // OS (Left Eye)
  sizeLightOS?: number;
  sizeDarkOS?: number;
  shapeOS?: string;
  directReactionOS?: string;
  consensualReactionOS?: string;
  
  // RAPD (bilateral)
  rapdPresent?: boolean;
  rapdEye?: 'OD' | 'OS' | null;
}

interface AnteriorSegmentExamData {
  // External Eye - OD
  lidsOD?: string;
  conjunctivaOD?: string;
  scleraOD?: string;
  lacrimalOD?: string;
  
  // External Eye - OS
  lidsOS?: string;
  conjunctivaOS?: string;
  scleraOS?: string;
  lacrimalOS?: string;
  
  // Cornea & AC - OD
  corneaOD?: string;
  acOD?: string;
  acDepthOD?: string;
  
  // Cornea & AC - OS
  corneaOS?: string;
  acOS?: string;
  acDepthOS?: string;
  
  // Iris & Lens - OD
  irisOD?: string;
  lensOD?: string;
  lensOpacityGradeOD?: string;
  
  // Iris & Lens - OS
  irisOS?: string;
  lensOS?: string;
  lensOpacityGradeOS?: string;
}

interface AnteriorSegmentTabProps {
  pupilExamData: PupilExamData | null;
  anteriorSegmentData: AnteriorSegmentExamData | null;
  canEdit: boolean;
  onSavePupilExam: (data: PupilExamData) => void;
  onSaveAnteriorSegment: (data: AnteriorSegmentExamData) => void;
}

export default function AnteriorSegmentTab({
  pupilExamData,
  anteriorSegmentData,
  canEdit,
  onSavePupilExam,
  onSaveAnteriorSegment,
}: AnteriorSegmentTabProps) {
  // ========== PUPIL EXAM STATE ==========
  const [pupilData, setPupilData] = useState<PupilExamData>({
    sizeLightOD: 3,
    sizeDarkOD: 5,
    shapeOD: 'Round',
    directReactionOD: 'Brisk',
    consensualReactionOD: 'Brisk',
    sizeLightOS: 3,
    sizeDarkOS: 5,
    shapeOS: 'Round',
    directReactionOS: 'Brisk',
    consensualReactionOS: 'Brisk',
    rapdPresent: false,
    rapdEye: null,
  });
  const [pupilHasChanges, setPupilHasChanges] = useState(false);
  const [pupilSaving, setPupilSaving] = useState(false);

  // ========== ANTERIOR SEGMENT STATE ==========
  const [anteriorData, setAnteriorData] = useState<AnteriorSegmentExamData>({
    lidsOD: 'Normal',
    conjunctivaOD: 'Normal',
    scleraOD: 'Normal',
    lacrimalOD: 'Normal',
    lidsOS: 'Normal',
    conjunctivaOS: 'Normal',
    scleraOS: 'Normal',
    lacrimalOS: 'Normal',
    corneaOD: 'Clear',
    acOD: 'Normal Depth',
    acDepthOD: 'Grade 4/Wide',
    corneaOS: 'Clear',
    acOS: 'Normal Depth',
    acDepthOS: 'Grade 4/Wide',
    irisOD: 'Normal',
    lensOD: 'Clear',
    lensOpacityGradeOD: undefined,
    irisOS: 'Normal',
    lensOS: 'Clear',
    lensOpacityGradeOS: undefined,
  });
  const [anteriorHasChanges, setAnteriorHasChanges] = useState(false);
  const [anteriorSaving, setAnteriorSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    if (pupilExamData) {
      setPupilData(pupilExamData);
    }
    if (anteriorSegmentData) {
      setAnteriorData(anteriorSegmentData);
    }
  }, [pupilExamData, anteriorSegmentData]);

  // ========== PUPIL EXAM HANDLERS ==========
  const handlePupilChange = (field: keyof PupilExamData, value: any) => {
    setPupilData({ ...pupilData, [field]: value });
    setPupilHasChanges(true);
  };

  const handleSavePupil = async () => {
    setPupilSaving(true);
    await onSavePupilExam(pupilData);
    setPupilHasChanges(false);
    setPupilSaving(false);
  };

  // ========== ANTERIOR SEGMENT HANDLERS ==========
  const handleAnteriorChange = (field: keyof AnteriorSegmentExamData, value: any) => {
    setAnteriorData({ ...anteriorData, [field]: value });
    setAnteriorHasChanges(true);
  };

  const handleSaveAnterior = async () => {
    setAnteriorSaving(true);
    await onSaveAnteriorSegment(anteriorData);
    setAnteriorHasChanges(false);
    setAnteriorSaving(false);
  };

  // ========== HELPER FUNCTIONS ==========
  const getPupilStatus = () => {
    const hasODData = pupilData.sizeLightOD || pupilData.directReactionOD;
    const hasOSData = pupilData.sizeLightOS || pupilData.directReactionOS;
    if (hasODData && hasOSData) return { text: 'Completed', variant: 'success' as const };
    if (hasODData || hasOSData) return { text: 'Partial', variant: 'info' as const };
    return { text: 'Pending', variant: 'pending' as const };
  };

  const getAnteriorStatus = () => {
    const hasODData = anteriorData.lidsOD || anteriorData.corneaOD || anteriorData.irisOD;
    const hasOSData = anteriorData.lidsOS || anteriorData.corneaOS || anteriorData.irisOS;
    if (hasODData && hasOSData) return { text: 'Completed', variant: 'success' as const };
    if (hasODData || hasOSData) return { text: 'Partial', variant: 'info' as const };
    return { text: 'Pending', variant: 'pending' as const };
  };

  const pupilSizeOptions = Array.from({ length: 8 }, (_, i) => i + 1).map((size) => (
    <option key={size} value={size}>
      {size}mm
    </option>
  ));

  // ========== RENDER ==========
  return (
    <ExamCard
      title="Anterior Segment Examination"
      icon={<Eye className="w-5 h-5" />}
      badge={getAnteriorStatus()}
    >
      <div className="space-y-4">
        {/* Compact 3-Column Grid: Label | OD | OS */}
        <div className="grid grid-cols-[200px_1fr_1fr] gap-x-4 gap-y-3 text-sm">
          {/* Column Headers */}
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide"></div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide text-center py-2 border-b border-blue-300">
            Right / OD
          </div>
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide text-center py-2 border-b border-emerald-300">
            Left / OS
          </div>

          {/* ========== PUPIL EXAMINATION ========== */}
          <div className="col-span-3 pt-2 pb-1 border-b-2 border-blue-200 bg-blue-50 px-3 -mx-1">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <CircleDot className="w-4 h-4" />
              Pupil Examination
            </h4>
          </div>

          <label className="text-gray-600 font-medium py-2">Size in Light (mm)</label>
          <ExamSelect
            value={pupilData.sizeLightOD || ''}
            onChange={(value) => handlePupilChange('sizeLightOD', value ? parseFloat(value) : undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((size) => (
              <option key={size} value={size}>{size}mm</option>
            ))}
          </ExamSelect>
          <ExamSelect
            value={pupilData.sizeLightOS || ''}
            onChange={(value) => handlePupilChange('sizeLightOS', value ? parseFloat(value) : undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((size) => (
              <option key={size} value={size}>{size}mm</option>
            ))}
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Size in Dark (mm)</label>
          <ExamSelect
            value={pupilData.sizeDarkOD || ''}
            onChange={(value) => handlePupilChange('sizeDarkOD', value ? parseFloat(value) : undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((size) => (
              <option key={size} value={size}>{size}mm</option>
            ))}
          </ExamSelect>
          <ExamSelect
            value={pupilData.sizeDarkOS || ''}
            onChange={(value) => handlePupilChange('sizeDarkOS', value ? parseFloat(value) : undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((size) => (
              <option key={size} value={size}>{size}mm</option>
            ))}
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Shape</label>
          <ExamSelect
            value={pupilData.shapeOD || ''}
            onChange={(value) => handlePupilChange('shapeOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Round">Round</option>
            <option value="Irregular">Irregular</option>
            <option value="Fixed dilated">Fixed dilated</option>
            <option value="Fixed constricted">Fixed constricted</option>
          </ExamSelect>
          <ExamSelect
            value={pupilData.shapeOS || ''}
            onChange={(value) => handlePupilChange('shapeOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Round">Round</option>
            <option value="Irregular">Irregular</option>
            <option value="Fixed dilated">Fixed dilated</option>
            <option value="Fixed constricted">Fixed constricted</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Direct Light Reaction</label>
          <ExamSelect
            value={pupilData.directReactionOD || ''}
            onChange={(value) => handlePupilChange('directReactionOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Brisk">Brisk (Normal)</option>
            <option value="Sluggish">Sluggish</option>
            <option value="Absent">Absent</option>
            <option value="Fixed">Fixed</option>
          </ExamSelect>
          <ExamSelect
            value={pupilData.directReactionOS || ''}
            onChange={(value) => handlePupilChange('directReactionOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Brisk">Brisk (Normal)</option>
            <option value="Sluggish">Sluggish</option>
            <option value="Absent">Absent</option>
            <option value="Fixed">Fixed</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Consensual Reaction</label>
          <ExamSelect
            value={pupilData.consensualReactionOD || ''}
            onChange={(value) => handlePupilChange('consensualReactionOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Brisk">Brisk (Normal)</option>
            <option value="Sluggish">Sluggish</option>
            <option value="Absent">Absent</option>
          </ExamSelect>
          <ExamSelect
            value={pupilData.consensualReactionOS || ''}
            onChange={(value) => handlePupilChange('consensualReactionOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Brisk">Brisk (Normal)</option>
            <option value="Sluggish">Sluggish</option>
            <option value="Absent">Absent</option>
          </ExamSelect>

          {/* RAPD */}
          <label className="text-gray-600 font-medium py-2">RAPD Present?</label>
          <div className="col-span-2">
            <ExamSelect
              value={pupilData.rapdPresent ? 'true' : 'false'}
              onChange={(value) => {
                const isPresent = value === 'true';
                handlePupilChange('rapdPresent', isPresent);
                if (!isPresent) handlePupilChange('rapdEye', null);
              }}
              disabled={!canEdit}
              className="text-sm py-1"
            >
              <option value="false">Absent</option>
              <option value="true">Present</option>
            </ExamSelect>
            {pupilData.rapdPresent && (
              <ExamSelect
                value={pupilData.rapdEye || ''}
                onChange={(value) => handlePupilChange('rapdEye', value || null)}
                disabled={!canEdit}
                className="text-sm py-1 mt-2"
              >
                <option value="">Which eye?</option>
                <option value="OD">Right Eye (OD)</option>
                <option value="OS">Left Eye (OS)</option>
              </ExamSelect>
            )}
          </div>

          {/* ========== EXTERNAL EYE & ADNEXA ========== */}
          <div className="col-span-3 pt-2 pb-1 border-b-2 border-emerald-200 bg-emerald-50 px-3 -mx-1 mt-2">
            <h4 className="text-sm font-semibold text-emerald-900">External Eye & Adnexa</h4>
          </div>

          <label className="text-gray-600 font-medium py-2">Lids</label>
          <ExamSelect
            value={anteriorData.lidsOD || ''}
            onChange={(value) => handleAnteriorChange('lidsOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Ptosis">Ptosis</option>
            <option value="Blepharitis">Blepharitis</option>
            <option value="Chalazion">Chalazion</option>
            <option value="Stye">Stye</option>
            <option value="Ectropion">Ectropion</option>
            <option value="Entropion">Entropion</option>
            <option value="Trichiasis">Trichiasis</option>
            <option value="Other">Other</option>
          </ExamSelect>
          <ExamSelect
            value={anteriorData.lidsOS || ''}
            onChange={(value) => handleAnteriorChange('lidsOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Ptosis">Ptosis</option>
            <option value="Blepharitis">Blepharitis</option>
            <option value="Chalazion">Chalazion</option>
            <option value="Stye">Stye</option>
            <option value="Ectropion">Ectropion</option>
            <option value="Entropion">Entropion</option>
            <option value="Trichiasis">Trichiasis</option>
            <option value="Other">Other</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Conjunctiva</label>
          <ExamSelect
            value={anteriorData.conjunctivaOD || ''}
            onChange={(value) => handleAnteriorChange('conjunctivaOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Hyperemia">Hyperemia</option>
            <option value="Chemosis">Chemosis</option>
            <option value="Pterygium">Pterygium</option>
            <option value="Pinguecula">Pinguecula</option>
            <option value="Subconjunctival Hemorrhage">Subconj Hemorrhage</option>
            <option value="Follicles">Follicles</option>
            <option value="Papillae">Papillae</option>
            <option value="Other">Other</option>
          </ExamSelect>
          <ExamSelect
            value={anteriorData.conjunctivaOS || ''}
            onChange={(value) => handleAnteriorChange('conjunctivaOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Hyperemia">Hyperemia</option>
            <option value="Chemosis">Chemosis</option>
            <option value="Pterygium">Pterygium</option>
            <option value="Pinguecula">Pinguecula</option>
            <option value="Subconjunctival Hemorrhage">Subconj Hemorrhage</option>
            <option value="Follicles">Follicles</option>
            <option value="Papillae">Papillae</option>
            <option value="Other">Other</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Sclera</label>
          <ExamSelect
            value={anteriorData.scleraOD || ''}
            onChange={(value) => handleAnteriorChange('scleraOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Icterus">Icterus</option>
            <option value="Inflammation">Inflammation</option>
            <option value="Blue Sclera">Blue Sclera</option>
            <option value="Nodule">Nodule</option>
            <option value="Other">Other</option>
          </ExamSelect>
          <ExamSelect
            value={anteriorData.scleraOS || ''}
            onChange={(value) => handleAnteriorChange('scleraOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Icterus">Icterus</option>
            <option value="Inflammation">Inflammation</option>
            <option value="Blue Sclera">Blue Sclera</option>
            <option value="Nodule">Nodule</option>
            <option value="Other">Other</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Lacrimal System</label>
          <ExamSelect
            value={anteriorData.lacrimalOD || ''}
            onChange={(value) => handleAnteriorChange('lacrimalOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Epiphora (watering)">Epiphora (watering)</option>
            <option value="Dacryocystitis">Dacryocystitis</option>
            <option value="Blocked duct">Blocked duct</option>
          </ExamSelect>
          <ExamSelect
            value={anteriorData.lacrimalOS || ''}
            onChange={(value) => handleAnteriorChange('lacrimalOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Epiphora (watering)">Epiphora (watering)</option>
            <option value="Dacryocystitis">Dacryocystitis</option>
            <option value="Blocked duct">Blocked duct</option>
          </ExamSelect>

          {/* ========== CORNEA & ANTERIOR CHAMBER ========== */}
          <div className="col-span-3 pt-2 pb-1 border-b-2 border-purple-200 bg-purple-50 px-3 -mx-1 mt-2">
            <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Cornea & Anterior Chamber
            </h4>
          </div>

          <label className="text-gray-600 font-medium py-2">Cornea</label>
          <ExamSelect
            value={anteriorData.corneaOD || ''}
            onChange={(value) => handleAnteriorChange('corneaOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Clear">Clear</option>
            <option value="Opaque">Opaque</option>
            <option value="Edema">Edema</option>
            <option value="Abrasion">Abrasion</option>
            <option value="Ulcer">Ulcer</option>
            <option value="Foreign Body">Foreign Body</option>
            <option value="Scar">Scar</option>
            <option value="KP (Keratic Precipitates)">KP</option>
            <option value="Vascularization">Vascularization</option>
            <option value="Other">Other</option>
          </ExamSelect>
          <ExamSelect
            value={anteriorData.corneaOS || ''}
            onChange={(value) => handleAnteriorChange('corneaOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Clear">Clear</option>
            <option value="Opaque">Opaque</option>
            <option value="Edema">Edema</option>
            <option value="Abrasion">Abrasion</option>
            <option value="Ulcer">Ulcer</option>
            <option value="Foreign Body">Foreign Body</option>
            <option value="Scar">Scar</option>
            <option value="KP (Keratic Precipitates)">KP</option>
            <option value="Vascularization">Vascularization</option>
            <option value="Other">Other</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Anterior Chamber</label>
          <ExamSelect
            value={anteriorData.acOD || ''}
            onChange={(value) => handleAnteriorChange('acOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal Depth">Normal Depth</option>
            <option value="Shallow">Shallow</option>
            <option value="Deep">Deep</option>
            <option value="Cells">Cells</option>
            <option value="Flare">Flare</option>
            <option value="Hyphema">Hyphema</option>
            <option value="Hypopyon">Hypopyon</option>
            <option value="Other">Other</option>
          </ExamSelect>
          <ExamSelect
            value={anteriorData.acOS || ''}
            onChange={(value) => handleAnteriorChange('acOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal Depth">Normal Depth</option>
            <option value="Shallow">Shallow</option>
            <option value="Deep">Deep</option>
            <option value="Cells">Cells</option>
            <option value="Flare">Flare</option>
            <option value="Hyphema">Hyphema</option>
            <option value="Hypopyon">Hypopyon</option>
            <option value="Other">Other</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">AC Depth (Van Herick)</label>
          <ExamSelect
            value={anteriorData.acDepthOD || ''}
            onChange={(value) => handleAnteriorChange('acDepthOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Grade 4/Wide">Grade 4 / Wide</option>
            <option value="Grade 3/Moderate">Grade 3 / Moderate</option>
            <option value="Grade 2/Narrow">Grade 2 / Narrow</option>
            <option value="Grade 1/Very Narrow">Grade 1 / Very Narrow</option>
            <option value="Closed">Closed</option>
          </ExamSelect>
          <ExamSelect
            value={anteriorData.acDepthOS || ''}
            onChange={(value) => handleAnteriorChange('acDepthOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Grade 4/Wide">Grade 4 / Wide</option>
            <option value="Grade 3/Moderate">Grade 3 / Moderate</option>
            <option value="Grade 2/Narrow">Grade 2 / Narrow</option>
            <option value="Grade 1/Very Narrow">Grade 1 / Very Narrow</option>
            <option value="Closed">Closed</option>
          </ExamSelect>

          {/* ========== IRIS & LENS ========== */}
          <div className="col-span-3 pt-2 pb-1 border-b-2 border-amber-200 bg-amber-50 px-3 -mx-1 mt-2">
            <h4 className="text-sm font-semibold text-amber-900">Iris & Lens</h4>
          </div>

          <label className="text-gray-600 font-medium py-2">Iris</label>
          <ExamSelect
            value={anteriorData.irisOD || ''}
            onChange={(value) => handleAnteriorChange('irisOD', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Neovascularization">Neovascularization</option>
            <option value="Atrophy">Atrophy</option>
            <option value="Posterior Synechiae">Post Synechiae</option>
            <option value="Anterior Synechiae">Ant Synechiae</option>
            <option value="Iridodialysis">Iridodialysis</option>
            <option value="Other">Other</option>
          </ExamSelect>
          <ExamSelect
            value={anteriorData.irisOS || ''}
            onChange={(value) => handleAnteriorChange('irisOS', value || undefined)}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Normal">Normal</option>
            <option value="Neovascularization">Neovascularization</option>
            <option value="Atrophy">Atrophy</option>
            <option value="Posterior Synechiae">Post Synechiae</option>
            <option value="Anterior Synechiae">Ant Synechiae</option>
            <option value="Iridodialysis">Iridodialysis</option>
            <option value="Other">Other</option>
          </ExamSelect>

          <label className="text-gray-600 font-medium py-2">Lens</label>
          <ExamSelect
            value={anteriorData.lensOD || ''}
            onChange={(value) => {
              const val = value || undefined;
              handleAnteriorChange('lensOD', val);
              if (val === 'Clear' || val === 'Pseudophakia' || val === 'Aphakia') {
                handleAnteriorChange('lensOpacityGradeOD', undefined);
              }
            }}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Clear">Clear</option>
            <option value="Cortical Cataract">Cortical Cataract</option>
            <option value="Nuclear Cataract">Nuclear Cataract</option>
            <option value="PSC (Posterior Subcapsular Cataract)">PSC</option>
            <option value="Anterior Subcapsular">Ant Subcapsular</option>
            <option value="Pseudophakia">Pseudophakia (IOL)</option>
            <option value="Aphakia">Aphakia</option>
            <option value="Other">Other</option>
          </ExamSelect>
          <ExamSelect
            value={anteriorData.lensOS || ''}
            onChange={(value) => {
              const val = value || undefined;
              handleAnteriorChange('lensOS', val);
              if (val === 'Clear' || val === 'Pseudophakia' || val === 'Aphakia') {
                handleAnteriorChange('lensOpacityGradeOS', undefined);
              }
            }}
            disabled={!canEdit}
            className="text-sm py-1"
          >
            <option value="Clear">Clear</option>
            <option value="Cortical Cataract">Cortical Cataract</option>
            <option value="Nuclear Cataract">Nuclear Cataract</option>
            <option value="PSC (Posterior Subcapsular Cataract)">PSC</option>
            <option value="Anterior Subcapsular">Ant Subcapsular</option>
            <option value="Pseudophakia">Pseudophakia (IOL)</option>
            <option value="Aphakia">Aphakia</option>
            <option value="Other">Other</option>
          </ExamSelect>

          {(anteriorData.lensOD && !['Clear', 'Pseudophakia', 'Aphakia'].includes(anteriorData.lensOD)) && (
            <>
              <label className="text-gray-600 font-medium py-2">Lens Opacity Grade (OD)</label>
              <ExamSelect
                value={anteriorData.lensOpacityGradeOD || ''}
                onChange={(value) => handleAnteriorChange('lensOpacityGradeOD', value || undefined)}
                disabled={!canEdit}
                className="text-sm py-1"
              >
                <option value="">Select grade...</option>
                <option value="Grade 1 (Mild)">Grade 1 (Mild)</option>
                <option value="Grade 2 (Moderate)">Grade 2 (Moderate)</option>
                <option value="Grade 3 (Moderate-Severe)">Grade 3 (Mod-Severe)</option>
                <option value="Grade 4 (Severe)">Grade 4 (Severe)</option>
              </ExamSelect>
              <div></div>
            </>
          )}

          {(anteriorData.lensOS && !['Clear', 'Pseudophakia', 'Aphakia'].includes(anteriorData.lensOS)) && (
            <>
              <label className="text-gray-600 font-medium py-2">Lens Opacity Grade (OS)</label>
              <div></div>
              <ExamSelect
                value={anteriorData.lensOpacityGradeOS || ''}
                onChange={(value) => handleAnteriorChange('lensOpacityGradeOS', value || undefined)}
                disabled={!canEdit}
                className="text-sm py-1"
              >
                <option value="">Select grade...</option>
                <option value="Grade 1 (Mild)">Grade 1 (Mild)</option>
                <option value="Grade 2 (Moderate)">Grade 2 (Moderate)</option>
                <option value="Grade 3 (Moderate-Severe)">Grade 3 (Mod-Severe)</option>
                <option value="Grade 4 (Severe)">Grade 4 (Severe)</option>
              </ExamSelect>
            </>
          )}
        </div>

        {/* Save Buttons - Always visible */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
          {(pupilHasChanges || anteriorHasChanges) && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Unsaved changes
            </p>
          )}
          <div className="flex gap-2 ml-auto">
            <ActionButton 
              variant="secondary" 
              onClick={handleSavePupil} 
              disabled={!canEdit || pupilSaving || !pupilHasChanges}
            >
              {pupilSaving ? 'Saving...' : 'Save Pupil'}
            </ActionButton>
            <ActionButton 
              variant="primary" 
              onClick={handleSaveAnterior} 
              disabled={!canEdit || anteriorSaving || !anteriorHasChanges}
            >
              {anteriorSaving ? 'Saving...' : 'Save Anterior Segment'}
            </ActionButton>
          </div>
        </div>
      </div>
    </ExamCard>
  );
}
