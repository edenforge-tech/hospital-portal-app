'use client';

import { useState, useEffect } from 'react';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, ActionButton } from './ExamCard';
import { Lightbulb, Plus, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';

// Type definitions for multi-entry retinoscopy
interface RetinoscopyReading {
  id: string;
  sphere: number;
  cylinder?: number;
  axis?: number;
  workingDistance: number;
}

interface WetRetinoscopyData {
  drug?: string;
  duration?: number; // minutes
  timeAdministered?: string;
  odReadings: RetinoscopyReading[];
  osReadings: RetinoscopyReading[];
}

interface DryRetinoscopyData {
  odReadings: RetinoscopyReading[];
  osReadings: RetinoscopyReading[];
}

interface SubjectiveRefractionReading {
  id: string;
  entryNumber: number;
  odSphere: number;
  odCylinder?: number;
  odAxis?: number;
  osSphere: number;
  osCylinder?: number;
  osAxis?: number;
  vaAchievedOD: string;
  vaAchievedOS: string;
  isFinal: boolean;
}

interface SubjectiveRefractionData {
  readings: SubjectiveRefractionReading[];
}

interface RetinoscopyMegaTabProps {
  wetRetinoscopyData: WetRetinoscopyData | null;
  dryRetinoscopyData: DryRetinoscopyData | null;
  subjectiveRefractionData: SubjectiveRefractionData | null;
  canEdit: boolean;
  onSaveWetRetinoscopy: (data: WetRetinoscopyData) => void;
  onSaveDryRetinoscopy: (data: DryRetinoscopyData) => void;
  onSaveSubjectiveRefraction: (data: SubjectiveRefractionData) => void;
}

export default function RetinoscopyMegaTab({
  wetRetinoscopyData,
  dryRetinoscopyData,
  subjectiveRefractionData,
  canEdit,
  onSaveWetRetinoscopy,
  onSaveDryRetinoscopy,
  onSaveSubjectiveRefraction,
}: RetinoscopyMegaTabProps) {
  // ========== WET RETINOSCOPY STATE ==========
  const [wetData, setWetData] = useState<WetRetinoscopyData>({
    drug: undefined,
    duration: undefined,
    timeAdministered: undefined,
    odReadings: [],
    osReadings: [],
  });
  const [wetHasChanges, setWetHasChanges] = useState(false);
  const [wetSaving, setWetSaving] = useState(false);

  // ========== DRY RETINOSCOPY STATE ==========
  const [dryData, setDryData] = useState<DryRetinoscopyData>({
    odReadings: [],
    osReadings: [],
  });
  const [dryHasChanges, setDryHasChanges] = useState(false);
  const [drySaving, setDrySaving] = useState(false);

  // ========== SUBJECTIVE REFRACTION STATE ==========
  const [subjectiveData, setSubjectiveData] = useState<SubjectiveRefractionData>({
    readings: [],
  });
  const [subjectiveHasChanges, setSubjectiveHasChanges] = useState(false);
  const [subjectiveSaving, setSubjectiveSaving] = useState(false);

  // ========== EDITING MODALS STATE ==========
  const [editingWetOD, setEditingWetOD] = useState<RetinoscopyReading | null>(null);
  const [editingWetOS, setEditingWetOS] = useState<RetinoscopyReading | null>(null);
  const [editingDryOD, setEditingDryOD] = useState<RetinoscopyReading | null>(null);
  const [editingDryOS, setEditingDryOS] = useState<RetinoscopyReading | null>(null);
  const [editingSubjective, setEditingSubjective] = useState<SubjectiveRefractionReading | null>(null);
  const [isAddingSubjective, setIsAddingSubjective] = useState(false);

  // ========== HELPER FUNCTIONS (Must be before state that uses them) ==========
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const createEmptyReading = (): RetinoscopyReading => ({
    id: generateId(),
    sphere: 0,
    cylinder: undefined,
    axis: undefined,
    workingDistance: 67, // default 67cm
  });

  const createEmptySubjectiveReading = (entryNumber: number): SubjectiveRefractionReading => ({
    id: generateId(),
    entryNumber,
    odSphere: 0,
    odCylinder: undefined,
    odAxis: undefined,
    osSphere: 0,
    osCylinder: undefined,
    osAxis: undefined,
    vaAchievedOD: '',
    vaAchievedOS: '',
    isFinal: false,
  });

  // ========== NEW READING FORMS STATE (Always visible) ==========
  const [newWetOD, setNewWetOD] = useState<RetinoscopyReading>(createEmptyReading());
  const [newWetOS, setNewWetOS] = useState<RetinoscopyReading>(createEmptyReading());
  const [newDryOD, setNewDryOD] = useState<RetinoscopyReading>(createEmptyReading());
  const [newDryOS, setNewDryOS] = useState<RetinoscopyReading>(createEmptyReading());
  const [newSubjReading, setNewSubjReading] = useState<SubjectiveRefractionReading>(
    createEmptySubjectiveReading(1)
  );

  // Load initial data
  useEffect(() => {
    if (wetRetinoscopyData) {
      setWetData(wetRetinoscopyData);
    }
    if (dryRetinoscopyData) {
      setDryData(dryRetinoscopyData);
    }
    if (subjectiveRefractionData) {
      setSubjectiveData(subjectiveRefractionData);
    }
  }, [wetRetinoscopyData, dryRetinoscopyData, subjectiveRefractionData]);

  // ========== MORE HELPER FUNCTIONS ==========
  const calculateNeutralizingPower = (grossPower: number, workingDistance: number) => {
    const workingDistanceDiopters = 100 / workingDistance;
    return grossPower - workingDistanceDiopters;
  };

  const formatPrescription = (sphere: number, cylinder?: number, axis?: number) => {
    let result = `${sphere >= 0 ? '+' : ''}${sphere.toFixed(2)}`;
    if (cylinder && axis !== undefined) {
      result += ` / ${cylinder >= 0 ? '+' : ''}${cylinder.toFixed(2)} × ${axis}°`;
    }
    return result;
  };

  // Generate dropdown options for sphere, cylinder, axis
  const generateSphereOptions = () => {
    const options = [];
    for (let i = -20; i <= 20; i += 0.25) {
      const value = i.toFixed(2);
      options.push({ value, label: `${i >= 0 ? '+' : ''}${value}D` });
    }
    return options;
  };

  const generateCylinderOptions = () => {
    const options = [{ value: '', label: 'None' }];
    for (let i = 0; i >= -6; i -= 0.25) {
      const value = i.toFixed(2);
      options.push({ value, label: `${value}D` });
    }
    return options;
  };

  const generateAxisOptions = () => {
    const options = [];
    for (let i = 0; i <= 180; i += 5) {
      options.push({ value: i.toString(), label: `${i}°` });
    }
    return options;
  };

  // ========== WET RETINOSCOPY HANDLERS ==========
  const handleWetDrugChange = (drug: string) => {
    setWetData({ ...wetData, drug });
    setWetHasChanges(true);
  };

  const handleWetDurationChange = (duration: number) => {
    setWetData({ ...wetData, duration });
    setWetHasChanges(true);
  };

  const handleWetTimeChange = (time: string) => {
    setWetData({ ...wetData, timeAdministered: time });
    setWetHasChanges(true);
  };

  const addWetODReading = () => {
    setWetData({ ...wetData, odReadings: [...wetData.odReadings, newWetOD] });
    setNewWetOD(createEmptyReading()); // Reset form
    setWetHasChanges(true);
  };

  const addWetOSReading = () => {
    setWetData({ ...wetData, osReadings: [...wetData.osReadings, newWetOS] });
    setNewWetOS(createEmptyReading()); // Reset form
    setWetHasChanges(true);
  };

  const saveWetODReading = (reading: RetinoscopyReading) => {
    const existingIndex = wetData.odReadings.findIndex((r) => r.id === reading.id);
    if (existingIndex >= 0) {
      const updated = [...wetData.odReadings];
      updated[existingIndex] = reading;
      setWetData({ ...wetData, odReadings: updated });
    } else {
      setWetData({ ...wetData, odReadings: [...wetData.odReadings, reading] });
    }
    setWetHasChanges(true);
    setEditingWetOD(null);
  };

  const saveWetOSReading = (reading: RetinoscopyReading) => {
    const existingIndex = wetData.osReadings.findIndex((r) => r.id === reading.id);
    if (existingIndex >= 0) {
      const updated = [...wetData.osReadings];
      updated[existingIndex] = reading;
      setWetData({ ...wetData, osReadings: updated });
    } else {
      setWetData({ ...wetData, osReadings: [...wetData.osReadings, reading] });
    }
    setWetHasChanges(true);
    setEditingWetOS(null);
  };

  const deleteWetODReading = (id: string) => {
    setWetData({
      ...wetData,
      odReadings: wetData.odReadings.filter((r) => r.id !== id),
    });
    setWetHasChanges(true);
  };

  const deleteWetOSReading = (id: string) => {
    setWetData({
      ...wetData,
      osReadings: wetData.osReadings.filter((r) => r.id !== id),
    });
    setWetHasChanges(true);
  };

  const handleSaveWet = async () => {
    setWetSaving(true);
    await onSaveWetRetinoscopy(wetData);
    setWetHasChanges(false);
    setWetSaving(false);
  };

  // ========== DRY RETINOSCOPY HANDLERS ==========
  const addDryODReading = () => {
    setDryData({ ...dryData, odReadings: [...dryData.odReadings, newDryOD] });
    setNewDryOD(createEmptyReading()); // Reset form
    setDryHasChanges(true);
  };

  const addDryOSReading = () => {
    setDryData({ ...dryData, osReadings: [...dryData.osReadings, newDryOS] });
    setNewDryOS(createEmptyReading()); // Reset form
    setDryHasChanges(true);
  };

  const saveDryODReading = (reading: RetinoscopyReading) => {
    const existingIndex = dryData.odReadings.findIndex((r) => r.id === reading.id);
    if (existingIndex >= 0) {
      const updated = [...dryData.odReadings];
      updated[existingIndex] = reading;
      setDryData({ ...dryData, odReadings: updated });
    } else {
      setDryData({ ...dryData, odReadings: [...dryData.odReadings, reading] });
    }
    setDryHasChanges(true);
    setEditingDryOD(null);
  };

  const saveDryOSReading = (reading: RetinoscopyReading) => {
    const existingIndex = dryData.osReadings.findIndex((r) => r.id === reading.id);
    if (existingIndex >= 0) {
      const updated = [...dryData.osReadings];
      updated[existingIndex] = reading;
      setDryData({ ...dryData, osReadings: updated });
    } else {
      setDryData({ ...dryData, osReadings: [...dryData.osReadings, reading] });
    }
    setDryHasChanges(true);
    setEditingDryOS(null);
  };

  const deleteDryODReading = (id: string) => {
    setDryData({
      ...dryData,
      odReadings: dryData.odReadings.filter((r) => r.id !== id),
    });
    setDryHasChanges(true);
  };

  const deleteDryOSReading = (id: string) => {
    setDryData({
      ...dryData,
      osReadings: dryData.osReadings.filter((r) => r.id !== id),
    });
    setDryHasChanges(true);
  };

  const handleSaveDry = async () => {
    setDrySaving(true);
    await onSaveDryRetinoscopy(dryData);
    setDryHasChanges(false);
    setDrySaving(false);
  };

  // ========== SUBJECTIVE REFRACTION HANDLERS ==========
  const addSubjectiveReading = () => {
    setSubjectiveData({ readings: [...subjectiveData.readings, newSubjReading] });
    const nextEntryNumber = subjectiveData.readings.length + 2;
    setNewSubjReading(createEmptySubjectiveReading(nextEntryNumber));
    setSubjectiveHasChanges(true);
  };

  const editSubjectiveReading = (reading: SubjectiveRefractionReading) => {
    setEditingSubjective({ ...reading });
    setIsAddingSubjective(false);
  };

  const saveSubjectiveReading = (reading: SubjectiveRefractionReading) => {
    const existingIndex = subjectiveData.readings.findIndex((r) => r.id === reading.id);
    if (existingIndex >= 0) {
      const updated = [...subjectiveData.readings];
      updated[existingIndex] = reading;
      setSubjectiveData({ readings: updated });
    } else {
      setSubjectiveData({ readings: [...subjectiveData.readings, reading] });
    }
    setSubjectiveHasChanges(true);
    setEditingSubjective(null);
    setIsAddingSubjective(false);
  };

  const deleteSubjectiveReading = (id: string) => {
    const updated = subjectiveData.readings.filter((r) => r.id !== id);
    // Renumber entries
    const renumbered = updated.map((r, idx) => ({ ...r, entryNumber: idx + 1 }));
    setSubjectiveData({ readings: renumbered });
    setSubjectiveHasChanges(true);
  };

  const markSubjectiveAsFinal = (id: string) => {
    const updated = subjectiveData.readings.map((r) => ({
      ...r,
      isFinal: r.id === id,
    }));
    setSubjectiveData({ readings: updated });
    setSubjectiveHasChanges(true);
  };

  const handleSaveSubjective = async () => {
    setSubjectiveSaving(true);
    await onSaveSubjectiveRefraction(subjectiveData);
    setSubjectiveHasChanges(false);
    setSubjectiveSaving(false);
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-4">
      {/* ========== SECTION 1: WET RETINOSCOPY ========== */}
      <ExamCard
        title="Wet Retinoscopy (with Cycloplegic Drug)"
        icon={<Lightbulb className="w-5 h-5" />}
        badge={
          wetData.drug && wetData.odReadings.length > 0 && wetData.osReadings.length > 0
            ? { text: 'Completed', variant: 'success' }
            : { text: 'Pending', variant: 'pending' }
        }
        infoTooltip="Cycloplegic retinoscopy to relax accommodation. Essential for children and latent hyperopia detection. Common drugs: Tropicamide, Cyclopentolate, Atropine."
      >
        {/* Drug Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <ExamSelect
            label="Cycloplegic Drug"
            value={wetData.drug || ''}
            onChange={(e) => handleWetDrugChange(e.target.value)}
            disabled={!canEdit}
          >
            <option value="">Select drug</option>
            <option value="Tropicamide 1%">Tropicamide 1%</option>
            <option value="Cyclopentolate 1%">Cyclopentolate 1%</option>
            <option value="Atropine 1%">Atropine 1%</option>
            <option value="Homatropine 2%">Homatropine 2%</option>
          </ExamSelect>

          <ExamSelect
            label="Duration (minutes)"
            value={wetData.duration || ''}
            onChange={(e) => handleWetDurationChange(parseInt(e.target.value))}
            disabled={!canEdit}
          >
            <option value="">Select duration</option>
            <option value="15">15 min</option>
            <option value="20">20 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
          </ExamSelect>

          <ExamInput
            label="Time Administered"
            type="time"
            value={wetData.timeAdministered || ''}
            onChange={(e) => handleWetTimeChange(e.target.value)}
            disabled={!canEdit}
          />
        </div>

        {/* OD | OS Readings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OD Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Right Eye (OD)</h4>
            </div>

            {/* New Reading Form (Always Visible) */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">New Reading</p>
              <div className="space-y-2">
                <ExamSelect
                  label="Working Distance"
                  value={newWetOD.workingDistance.toString()}
                  onChange={(value) => setNewWetOD({ ...newWetOD, workingDistance: parseInt(value) })}
                  options={[
                    { value: '33', label: '33cm (3.00D)' },
                    { value: '50', label: '50cm (2.00D)' },
                    { value: '67', label: '67cm (1.50D)' },
                  ]}
                  disabled={!canEdit}
                  infoTooltip="Distance from patient to retinoscope. Common: 67cm (1.50D), 50cm (2.00D), 33cm (3.00D). Subtract from final result."
                />

                <ExamSelect
                  label="Sphere (D)"
                  value={newWetOD.sphere.toFixed(2)}
                  onChange={(value) => setNewWetOD({ ...newWetOD, sphere: parseFloat(value) })}
                  options={generateSphereOptions()}
                  disabled={!canEdit}
                  infoTooltip="Spherical power. Range: -20.00 to +20.00D in 0.25D steps. Negative = myopia, Positive = hyperopia."
                />

                <ExamSelect
                  label="Cylinder (D)"
                  value={newWetOD.cylinder?.toFixed(2) ?? ''}
                  onChange={(value) =>
                    setNewWetOD({
                      ...newWetOD,
                      cylinder: value ? parseFloat(value) : undefined,
                      axis: value ? newWetOD.axis : undefined,
                    })
                  }
                  options={generateCylinderOptions()}
                  disabled={!canEdit}
                  infoTooltip="Astigmatic correction. Range: 0.00 to -6.00D (minus cylinder notation). Leave blank if no astigmatism."
                />

                <ExamSelect
                  label="Axis (°)"
                  value={newWetOD.axis?.toString() ?? ''}
                  onChange={(value) =>
                    setNewWetOD({
                      ...newWetOD,
                      axis: value ? parseInt(value) : undefined,
                    })
                  }
                  options={generateAxisOptions()}
                  disabled={!canEdit || !newWetOD.cylinder}
                  infoTooltip="Axis of astigmatism. Range: 1-180°. Only required if cylinder is present. Horizontal: 180°, Vertical: 90°."
                />

                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={addWetODReading}
                  disabled={!canEdit}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Reading
                </ActionButton>
              </div>
            </div>

            {/* Saved Readings */}
            {wetData.odReadings.length > 0 && (
              <div className="space-y-2">
                {wetData.odReadings.map((reading, idx) => (
                  <div
                    key={reading.id}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">#{idx + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingWetOD(reading)}
                          disabled={!canEdit}
                          className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteWetODReading(reading.id)}
                          disabled={!canEdit}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-900">
                      {formatPrescription(reading.sphere, reading.cylinder, reading.axis)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reading.workingDistance}cm • {calculateNeutralizingPower(reading.sphere, reading.workingDistance).toFixed(2)}D
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OS Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Left Eye (OS)</h4>
            </div>

            {/* New Reading Form (Always Visible) */}
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">New Reading</p>
              <div className="space-y-2">
                <ExamSelect
                  label="Working Distance"
                  value={newWetOS.workingDistance.toString()}
                  onChange={(value) => setNewWetOS({ ...newWetOS, workingDistance: parseInt(value) })}
                  options={[
                    { value: '33', label: '33cm (3.00D)' },
                    { value: '50', label: '50cm (2.00D)' },
                    { value: '67', label: '67cm (1.50D)' },
                  ]}
                  disabled={!canEdit}
                  infoTooltip="Distance from patient to retinoscope. Common: 67cm (1.50D), 50cm (2.00D), 33cm (3.00D). Subtract from final result."
                />

                <ExamSelect
                  label="Sphere (D)"
                  value={newWetOS.sphere.toFixed(2)}
                  onChange={(value) => setNewWetOS({ ...newWetOS, sphere: parseFloat(value) })}
                  options={generateSphereOptions()}
                  disabled={!canEdit}
                  infoTooltip="Spherical power. Range: -20.00 to +20.00D in 0.25D steps. Negative = myopia, Positive = hyperopia."
                />

                <ExamSelect
                  label="Cylinder (D)"
                  value={newWetOS.cylinder?.toFixed(2) ?? ''}
                  onChange={(value) =>
                    setNewWetOS({
                      ...newWetOS,
                      cylinder: value ? parseFloat(value) : undefined,
                      axis: value ? newWetOS.axis : undefined,
                    })
                  }
                  options={generateCylinderOptions()}
                  disabled={!canEdit}
                  infoTooltip="Astigmatic correction. Range: 0.00 to -6.00D (minus cylinder notation). Leave blank if no astigmatism."
                />

                <ExamSelect
                  label="Axis (°)"
                  value={newWetOS.axis?.toString() ?? ''}
                  onChange={(value) =>
                    setNewWetOS({
                      ...newWetOS,
                      axis: value ? parseInt(value) : undefined,
                    })
                  }
                  options={generateAxisOptions()}
                  disabled={!canEdit || !newWetOS.cylinder}
                  infoTooltip="Axis of astigmatism. Range: 1-180°. Only required if cylinder is present. Horizontal: 180°, Vertical: 90°."
                />

                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={addWetOSReading}
                  disabled={!canEdit}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Reading
                </ActionButton>
              </div>
            </div>

            {/* Saved Readings */}
            {wetData.osReadings.length > 0 && (
              <div className="space-y-2">
                {wetData.osReadings.map((reading, idx) => (
                  <div
                    key={reading.id}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">#{idx + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingWetOS(reading)}
                          disabled={!canEdit}
                          className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteWetOSReading(reading.id)}
                          disabled={!canEdit}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-900">
                      {formatPrescription(reading.sphere, reading.cylinder, reading.axis)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reading.workingDistance}cm • {calculateNeutralizingPower(reading.sphere, reading.workingDistance).toFixed(2)}D
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button for Wet */}
        {wetHasChanges && (
          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Unsaved changes
            </p>
            <ActionButton variant="primary" onClick={handleSaveWet} disabled={!canEdit || wetSaving}>
              {wetSaving ? 'Saving...' : 'Save Wet Retinoscopy'}
            </ActionButton>
          </div>
        )}
      </ExamCard>

      {/* ========== SECTION 2: DRY RETINOSCOPY ========== */}
      <ExamCard
        title="Dry Retinoscopy (without Cycloplegic)"
        icon={<Lightbulb className="w-5 h-5" />}
        badge={
          dryData.odReadings.length > 0 && dryData.osReadings.length > 0
            ? { text: 'Completed', variant: 'success' }
            : { text: 'Pending', variant: 'pending' }
        }
        infoTooltip="Non-cycloplegic retinoscopy without accommodation paralysis. Standard for adults. Compare with wet to assess accommodation lag."
      >
        {/* OD | OS Readings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OD Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Right Eye (OD)</h4>

            {/* Inline Form for New Reading */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="text-xs font-semibold text-blue-900 mb-2">New Reading</h5>
              <div className="space-y-2">
                <ExamSelect
                  label="Working Distance"
                  value={newDryOD.workingDistance.toString()}
                  onChange={(value) => setNewDryOD({ ...newDryOD, workingDistance: parseInt(value) })}
                  options={[
                    { value: '33', label: '33cm (3.00D)' },
                    { value: '50', label: '50cm (2.00D)' },
                    { value: '67', label: '67cm (1.50D)' },
                  ]}
                  disabled={!canEdit}
                  infoTooltip="Distance from patient to retinoscope. Common: 67cm (1.50D), 50cm (2.00D), 33cm (3.00D). Subtract from final result."
                />

                <ExamSelect
                  label="Sphere (D)"
                  value={newDryOD.sphere.toFixed(2)}
                  onChange={(value) => setNewDryOD({ ...newDryOD, sphere: parseFloat(value) })}
                  options={generateSphereOptions()}
                  disabled={!canEdit}
                  infoTooltip="Spherical power. Range: -20.00 to +20.00D in 0.25D steps. Negative = myopia, Positive = hyperopia."
                />

                <ExamSelect
                  label="Cylinder (D)"
                  value={newDryOD.cylinder?.toFixed(2) ?? ''}
                  onChange={(value) =>
                    setNewDryOD({
                      ...newDryOD,
                      cylinder: value ? parseFloat(value) : undefined,
                      axis: value ? newDryOD.axis : undefined,
                    })
                  }
                  options={generateCylinderOptions()}
                  disabled={!canEdit}
                  infoTooltip="Astigmatic correction. Range: 0.00 to -6.00D (minus cylinder notation). Leave blank if no astigmatism."
                />

                <ExamSelect
                  label="Axis (°)"
                  value={newDryOD.axis?.toString() ?? ''}
                  onChange={(value) =>
                    setNewDryOD({
                      ...newDryOD,
                      axis: value ? parseInt(value) : undefined,
                    })
                  }
                  options={generateAxisOptions()}
                  disabled={!canEdit || !newDryOD.cylinder}
                  infoTooltip="Axis of astigmatism. Range: 1-180°. Only required if cylinder is present. Horizontal: 180°, Vertical: 90°."
                />

                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={addDryODReading}
                  disabled={!canEdit}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Reading
                </ActionButton>
              </div>
            </div>

            {/* Saved Readings */}
            {dryData.odReadings.length > 0 && (
              <div className="space-y-3">
                {dryData.odReadings.map((reading, idx) => (
                  <div
                    key={reading.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">Reading #{idx + 1}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingDryOD(reading)}
                          disabled={!canEdit}
                          className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDryODReading(reading.id)}
                          disabled={!canEdit}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrescription(reading.sphere, reading.cylinder, reading.axis)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Working Distance: {reading.workingDistance}cm
                    </p>
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      Neutralizing Power:{' '}
                      {calculateNeutralizingPower(reading.sphere, reading.workingDistance).toFixed(2)}D
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OS Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Left Eye (OS)</h4>

            {/* Inline Form for New Reading */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h5 className="text-xs font-semibold text-emerald-900 mb-2">New Reading</h5>
              <div className="space-y-2">
                <ExamSelect
                  label="Working Distance"
                  value={newDryOS.workingDistance.toString()}
                  onChange={(value) => setNewDryOS({ ...newDryOS, workingDistance: parseInt(value) })}
                  options={[
                    { value: '33', label: '33cm (3.00D)' },
                    { value: '50', label: '50cm (2.00D)' },
                    { value: '67', label: '67cm (1.50D)' },
                  ]}
                  disabled={!canEdit}
                  infoTooltip="Distance from patient to retinoscope. Common: 67cm (1.50D), 50cm (2.00D), 33cm (3.00D). Subtract from final result."
                />

                <ExamSelect
                  label="Sphere (D)"
                  value={newDryOS.sphere.toFixed(2)}
                  onChange={(value) => setNewDryOS({ ...newDryOS, sphere: parseFloat(value) })}
                  options={generateSphereOptions()}
                  disabled={!canEdit}
                  infoTooltip="Spherical power. Range: -20.00 to +20.00D in 0.25D steps. Negative = myopia, Positive = hyperopia."
                />

                <ExamSelect
                  label="Cylinder (D)"
                  value={newDryOS.cylinder?.toFixed(2) ?? ''}
                  onChange={(value) =>
                    setNewDryOS({
                      ...newDryOS,
                      cylinder: value ? parseFloat(value) : undefined,
                      axis: value ? newDryOS.axis : undefined,
                    })
                  }
                  options={generateCylinderOptions()}
                  disabled={!canEdit}
                  infoTooltip="Astigmatic correction. Range: 0.00 to -6.00D (minus cylinder notation). Leave blank if no astigmatism."
                />

                <ExamSelect
                  label="Axis (°)"
                  value={newDryOS.axis?.toString() ?? ''}
                  onChange={(value) =>
                    setNewDryOS({
                      ...newDryOS,
                      axis: value ? parseInt(value) : undefined,
                    })
                  }
                  options={generateAxisOptions()}
                  disabled={!canEdit || !newDryOS.cylinder}
                  infoTooltip="Axis of astigmatism. Range: 1-180°. Only required if cylinder is present. Horizontal: 180°, Vertical: 90°."
                />

                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={addDryOSReading}
                  disabled={!canEdit}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Reading
                </ActionButton>
              </div>
            </div>

            {/* Saved Readings */}
            {dryData.osReadings.length > 0 && (
              <div className="space-y-3">
                {dryData.osReadings.map((reading, idx) => (
                  <div
                    key={reading.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">Reading #{idx + 1}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingDryOS(reading)}
                          disabled={!canEdit}
                          className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDryOSReading(reading.id)}
                          disabled={!canEdit}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrescription(reading.sphere, reading.cylinder, reading.axis)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Working Distance: {reading.workingDistance}cm
                    </p>
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      Neutralizing Power:{' '}
                      {calculateNeutralizingPower(reading.sphere, reading.workingDistance).toFixed(2)}D
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button for Dry */}
        {dryHasChanges && (
          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Unsaved changes
            </p>
            <ActionButton variant="primary" onClick={handleSaveDry} disabled={!canEdit || drySaving}>
              {drySaving ? 'Saving...' : 'Save Dry Retinoscopy'}
            </ActionButton>
          </div>
        )}
      </ExamCard>

      {/* ========== SECTION 3: SUBJECTIVE REFRACTION ========== */}
      <ExamCard
        title="Subjective Refraction (after Wet/Dry Retinoscopy)"
        icon={<Lightbulb className="w-5 h-5" />}
        badge={
          subjectiveData.readings.some((r) => r.isFinal)
            ? { text: 'Final Rx Selected', variant: 'success' }
            : subjectiveData.readings.length > 0
            ? { text: `${subjectiveData.readings.length} Reading(s)`, variant: 'info' }
            : { text: 'Pending', variant: 'pending' }
        }
        infoTooltip="Patient's preferred prescription based on visual clarity testing. Uses retinoscopy as starting point, refined with JCC, duochrome, etc."
      >
        {/* Inline Form for New Reading */}
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-4">
          <p className="text-xs font-semibold text-purple-900 mb-2">
            Reading #{newSubjReading.entryNumber}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* OD Column */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-blue-700 mb-1">OD (Right Eye)</h5>
              <ExamSelect
                label="Sphere (D)"
                value={newSubjReading.odSphere.toFixed(2)}
                onChange={(value) =>
                  setNewSubjReading({ ...newSubjReading, odSphere: parseFloat(value) })
                }
                options={generateSphereOptions()}
                disabled={!canEdit}
              />
              <ExamSelect
                label="Cylinder (D)"
                value={newSubjReading.odCylinder?.toFixed(2) ?? ''}
                onChange={(value) =>
                  setNewSubjReading({
                    ...newSubjReading,
                    odCylinder: value ? parseFloat(value) : undefined,
                    odAxis: value ? newSubjReading.odAxis : undefined,
                  })
                }
                options={generateCylinderOptions()}
                disabled={!canEdit}
              />
              <ExamSelect
                label="Axis (°)"
                value={newSubjReading.odAxis?.toString() ?? ''}
                onChange={(value) =>
                  setNewSubjReading({
                    ...newSubjReading,
                    odAxis: value ? parseInt(value) : undefined,
                  })
                }
                options={generateAxisOptions()}
                disabled={!canEdit || !newSubjReading.odCylinder}
              />
              <ExamInput
                label="VA Achieved"
                value={newSubjReading.vaAchievedOD}
                onChange={(e) =>
                  setNewSubjReading({ ...newSubjReading, vaAchievedOD: e.target.value })
                }
                disabled={!canEdit}
              />
            </div>

            {/* OS Column */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-emerald-700 mb-1">OS (Left Eye)</h5>
              <ExamSelect
                label="Sphere (D)"
                value={newSubjReading.osSphere.toFixed(2)}
                onChange={(value) =>
                  setNewSubjReading({ ...newSubjReading, osSphere: parseFloat(value) })
                }
                options={generateSphereOptions()}
                disabled={!canEdit}
              />
              <ExamSelect
                label="Cylinder (D)"
                value={newSubjReading.osCylinder?.toFixed(2) ?? ''}
                onChange={(value) =>
                  setNewSubjReading({
                    ...newSubjReading,
                    osCylinder: value ? parseFloat(value) : undefined,
                    osAxis: value ? newSubjReading.osAxis : undefined,
                  })
                }
                options={generateCylinderOptions()}
                disabled={!canEdit}
              />
              <ExamSelect
                label="Axis (°)"
                value={newSubjReading.osAxis?.toString() ?? ''}
                onChange={(value) =>
                  setNewSubjReading({
                    ...newSubjReading,
                    osAxis: value ? parseInt(value) : undefined,
                  })
                }
                options={generateAxisOptions()}
                disabled={!canEdit || !newSubjReading.osCylinder}
              />
              <ExamInput
                label="VA Achieved"
                value={newSubjReading.vaAchievedOS}
                onChange={(e) =>
                  setNewSubjReading({ ...newSubjReading, vaAchievedOS: e.target.value })
                }
                disabled={!canEdit}
              />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <ActionButton
              variant="primary"
              size="sm"
              onClick={addSubjectiveReading}
              disabled={!canEdit}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Reading
            </ActionButton>
          </div>
        </div>

        {/* Saved Readings - Compact Table */}
        {subjectiveData.readings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">#</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">
                    OD (Right)
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">
                    OS (Left)
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">VA</th>
                  <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase">
                    Final Rx
                  </th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjectiveData.readings.map((reading) => (
                  <tr
                    key={reading.id}
                    className={reading.isFinal ? 'bg-emerald-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-2 py-2 whitespace-nowrap font-semibold text-gray-900">
                      {reading.entryNumber}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                      {formatPrescription(reading.odSphere, reading.odCylinder, reading.odAxis)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                      {formatPrescription(reading.osSphere, reading.osCylinder, reading.osAxis)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                      <div className="text-xs">
                        <div>OD: {reading.vaAchievedOD || 'N/A'}</div>
                        <div>OS: {reading.vaAchievedOS || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <button
                        onClick={() => markSubjectiveAsFinal(reading.id)}
                        disabled={!canEdit}
                        className="inline-flex items-center gap-1 disabled:opacity-50"
                        title="Mark as final prescription"
                      >
                        {reading.isFinal ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 hover:text-emerald-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => editSubjectiveReading(reading)}
                          disabled={!canEdit}
                          className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                          title="Edit reading"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteSubjectiveReading(reading.id)}
                          disabled={!canEdit}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          title="Delete reading"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Save Button for Subjective */}
        {subjectiveHasChanges && (
          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Unsaved changes
            </p>
            <ActionButton
              variant="primary"
              onClick={handleSaveSubjective}
              disabled={!canEdit || subjectiveSaving}
            >
              {subjectiveSaving ? 'Saving...' : 'Save Subjective Refraction'}
            </ActionButton>
          </div>
        )}
      </ExamCard>

      {/* ========== MODALS/FORMS FOR EDITING ========== */}
      {/* Wet OD Reading Modal */}
      {editingWetOD && (
        <ReadingModal
          title="Add/Edit Wet Retinoscopy Reading - OD (Right Eye)"
          reading={editingWetOD}
          onSave={saveWetODReading}
          onCancel={() => setEditingWetOD(null)}
        />
      )}

      {/* Wet OS Reading Modal */}
      {editingWetOS && (
        <ReadingModal
          title="Add/Edit Wet Retinoscopy Reading - OS (Left Eye)"
          reading={editingWetOS}
          onSave={saveWetOSReading}
          onCancel={() => setEditingWetOS(null)}
        />
      )}

      {/* Dry OD Reading Modal */}
      {editingDryOD && (
        <ReadingModal
          title="Add/Edit Dry Retinoscopy Reading - OD (Right Eye)"
          reading={editingDryOD}
          onSave={saveDryODReading}
          onCancel={() => setEditingDryOD(null)}
        />
      )}

      {/* Dry OS Reading Modal */}
      {editingDryOS && (
        <ReadingModal
          title="Add/Edit Dry Retinoscopy Reading - OS (Left Eye)"
          reading={editingDryOS}
          onSave={saveDryOSReading}
          onCancel={() => setEditingDryOS(null)}
        />
      )}

      {/* Subjective Refraction Modal */}
      {editingSubjective && (
        <SubjectiveRefinementModal
          title={isAddingSubjective ? 'Add Subjective Refinement' : 'Edit Subjective Refinement'}
          reading={editingSubjective}
          onSave={saveSubjectiveReading}
          onCancel={() => {
            setEditingSubjective(null);
            setIsAddingSubjective(false);
          }}
        />
      )}
    </div>
  );
}

// ========== MODAL COMPONENT FOR RETINOSCOPY READINGS ==========
interface ReadingModalProps {
  title: string;
  reading: RetinoscopyReading;
  onSave: (reading: RetinoscopyReading) => void;
  onCancel: () => void;
}

function ReadingModal({ title, reading, onSave, onCancel }: ReadingModalProps) {
  const [formData, setFormData] = useState<RetinoscopyReading>(reading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ExamSelect
            label="Working Distance (cm)"
            value={formData.workingDistance}
            onChange={(e) => setFormData({ ...formData, workingDistance: parseInt(e.target.value) })}
          >
            <option value="33">33 cm (3.00D)</option>
            <option value="50">50 cm (2.00D)</option>
            <option value="67">67 cm (1.50D) - Standard</option>
          </ExamSelect>

          <ExamInput
            label="Sphere (D)"
            type="number"
            step="0.25"
            value={formData.sphere}
            onChange={(e) =>
              setFormData({ ...formData, sphere: parseFloat(e.target.value) || 0 })
            }
          />

          <ExamInput
            label="Cylinder (D) - Optional"
            type="number"
            step="0.25"
            value={formData.cylinder || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                cylinder: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            helpText="Leave empty if no astigmatism"
          />

          <ExamInput
            label="Axis (°)"
            type="number"
            min="0"
            max="180"
            step="5"
            value={formData.axis || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                axis: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={!formData.cylinder}
            helpText="0-180 degrees (required if cylinder is entered)"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <ActionButton variant="secondary" onClick={onCancel} type="button">
              Cancel
            </ActionButton>
            <ActionButton variant="primary" type="submit">
              Save Reading
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== MODAL COMPONENT FOR SUBJECTIVE REFRACTION ==========
interface SubjectiveRefinementModalProps {
  title: string;
  reading: SubjectiveRefractionReading;
  onSave: (reading: SubjectiveRefractionReading) => void;
  onCancel: () => void;
}

function SubjectiveRefinementModal({
  title,
  reading,
  onSave,
  onCancel,
}: SubjectiveRefinementModalProps) {
  const [formData, setFormData] = useState<SubjectiveRefractionReading>(reading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">Entry #{formData.entryNumber}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* OD | OS Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OD Column */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Right Eye (OD)</h4>

              <ExamInput
                label="Sphere (D)"
                type="number"
                step="0.25"
                value={formData.odSphere}
                onChange={(e) =>
                  setFormData({ ...formData, odSphere: parseFloat(e.target.value) || 0 })
                }
              />

              <ExamInput
                label="Cylinder (D) - Optional"
                type="number"
                step="0.25"
                value={formData.odCylinder || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    odCylinder: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />

              <ExamInput
                label="Axis (°)"
                type="number"
                min="0"
                max="180"
                step="5"
                value={formData.odAxis || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    odAxis: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                disabled={!formData.odCylinder}
              />

              <ExamInput
                label="Visual Acuity Achieved"
                type="text"
                value={formData.vaAchievedOD}
                onChange={(e) => setFormData({ ...formData, vaAchievedOD: e.target.value })}
              />
            </div>

            {/* OS Column */}
            <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Left Eye (OS)</h4>

              <ExamInput
                label="Sphere (D)"
                type="number"
                step="0.25"
                value={formData.osSphere}
                onChange={(e) =>
                  setFormData({ ...formData, osSphere: parseFloat(e.target.value) || 0 })
                }
              />

              <ExamInput
                label="Cylinder (D) - Optional"
                type="number"
                step="0.25"
                value={formData.osCylinder || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    osCylinder: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />

              <ExamInput
                label="Axis (°)"
                type="number"
                min="0"
                max="180"
                step="5"
                value={formData.osAxis || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    osAxis: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                disabled={!formData.osCylinder}
              />

              <ExamInput
                label="Visual Acuity Achieved"
                type="text"
                value={formData.vaAchievedOS}
                onChange={(e) => setFormData({ ...formData, vaAchievedOS: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <ActionButton variant="secondary" onClick={onCancel} type="button">
              Cancel
            </ActionButton>
            <ActionButton variant="primary" type="submit">
              Save Refinement
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
