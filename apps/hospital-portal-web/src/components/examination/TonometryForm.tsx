'use client';

import { useState, useEffect } from 'react';
import { TonometryData, PachymetryData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Activity, AlertCircle, CheckCircle, AlertTriangle as AlertTri } from 'lucide-react';
const Gauge = Activity; // Use Activity icon as gauge alternative
const AlertTriangle = AlertTri;

interface TonometryFormProps {
  initialData: TonometryData | null;
  patientId: string;
  onSave: (data: TonometryData) => void;
  canEdit: boolean;
  pachymetryData?: PachymetryData | null;
}

export default function TonometryForm({ initialData, patientId, onSave, canEdit, pachymetryData }: TonometryFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<TonometryData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    method: 'Goldmann',
    measurementTime: new Date(),
    OD: { measuredIOP: 15 },
    OS: { measuredIOP: 15 },
    cctCorrectionApplied: false,
    glaucomaSuspectOD: false,
    glaucomaSuspectOS: false,
    hypotonyOD: false,
    hypotonyOS: false,
    isGlaucomaPatient: false,
    onGlaucomaMedication: false,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        examinationDate: new Date(initialData.examinationDate),
        measurementTime: new Date(initialData.measurementTime),
      });
    }
  }, [initialData]);

  const calculateIOPCorrection = (cct: number): number => {
    const deviation = cct - 545;
    return (deviation / 10) * 0.7;
  };

  const handleIOPChange = (eye: 'OD' | 'OS', value: string) => {
    const iop = parseFloat(value) || 0;
    let correctedIOP = iop;
    const cct = eye === 'OD' ? pachymetryData?.OD.centralThickness : pachymetryData?.OS.centralThickness;
    
    if (formData.cctCorrectionApplied && cct) {
      correctedIOP = iop + calculateIOPCorrection(cct);
    }

    setFormData({
      ...formData,
      [eye]: {
        measuredIOP: iop,
        correctedIOP: formData.cctCorrectionApplied ? correctedIOP : undefined,
      },
      [`glaucomaSuspect${eye}`]: iop > 21,
      [`hypotony${eye}`]: iop < 10,
    });
    setHasChanges(true);
  };

  const toggleCCTCorrection = () => {
    const applyCCT = !formData.cctCorrectionApplied;
    
    if (applyCCT && pachymetryData) {
      const cctOD = pachymetryData.OD.centralThickness;
      const cctOS = pachymetryData.OS.centralThickness;
      
      setFormData({
        ...formData,
        cctCorrectionApplied: applyCCT,
        cctOD,
        cctOS,
        OD: {
          ...formData.OD,
          correctedIOP: formData.OD.measuredIOP + calculateIOPCorrection(cctOD),
        },
        OS: {
          ...formData.OS,
          correctedIOP: formData.OS.measuredIOP + calculateIOPCorrection(cctOS),
        },
      });
    } else {
      setFormData({
        ...formData,
        cctCorrectionApplied: false,
        OD: { ...formData.OD, correctedIOP: undefined },
        OS: { ...formData.OS, correctedIOP: undefined },
      });
    }
    setHasChanges(true);
  };

  const getIOPStatus = (iop: number) => {
    if (iop > 21) return { text: 'Glaucoma Suspect', variant: 'error' as const, icon: AlertCircle };
    if (iop < 10) return { text: 'Hypotony', variant: 'warning' as const, icon: AlertTriangle };
    return { text: 'Normal', variant: 'success' as const, icon: CheckCircle };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setHasChanges(false);
    setSaving(false);
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({
        ...initialData,
        examinationDate: new Date(initialData.examinationDate),
        measurementTime: new Date(initialData.measurementTime),
      });
    }
    setHasChanges(false);
  };

  const statusOD = getIOPStatus(formData.OD.measuredIOP);
  const statusOS = getIOPStatus(formData.OS.measuredIOP);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <ExamCard 
          title="Tonometry Configuration"
          description="IOP measurement"
          icon={<Gauge className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExamSelect
              label="Measurement Method"
              value={formData.method}
              onChange={(e) => {
                setFormData({ ...formData, method: e.target.value as any });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Goldmann">Goldmann Applanation (Gold Standard)</option>
              <option value="NCT">Non-Contact (Air Puff)</option>
              <option value="Tonopen">Tonopen (Handheld)</option>
              <option value="iCare">iCare Rebound</option>
              <option value="Perkins">Perkins Handheld</option>
            </ExamSelect>

            <ExamInput
              label="Measurement Time"
              type="time"
              value={formData.measurementTime.toTimeString().slice(0, 5)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newTime = new Date(formData.measurementTime);
                newTime.setHours(parseInt(hours));
                newTime.setMinutes(parseInt(minutes));
                setFormData({ ...formData, measurementTime: newTime });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            />

            <div className="flex items-end pb-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cctCorrectionApplied}
                  onChange={toggleCCTCorrection}
                  disabled={!canEdit || !pachymetryData}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Apply CCT Correction
                  {!pachymetryData && <span className="text-gray-400 ml-1">(No pachymetry)</span>}
                </span>
              </label>
            </div>
          </div>
        </ExamCard>

        {/* IOP Measurements - Both Eyes */}
        <ExamCard 
          title="Intraocular Pressure Measurements"
          description="IOP measurement for both eyes"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OD Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900">Right Eye (OD)</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusOD.variant === 'success' ? 'bg-emerald-100 text-emerald-800' :
                  statusOD.variant === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {statusOD.text}
                </span>
              </div>
              <ExamInput
                label="Measured IOP (mmHg)"
                type="number"
                step="1"
                min="0"
                max="60"
                value={formData.OD.measuredIOP}
                onChange={(e) => handleIOPChange('OD', e.target.value)}
                disabled={!canEdit}
              />
              {formData.cctCorrectionApplied && formData.OD.correctedIOP !== undefined && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <statusOD.icon className="w-6 h-6 text-emerald-700" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">CCT-Corrected:</p>
                    <p className="text-xl font-bold text-emerald-900">{formData.OD.correctedIOP.toFixed(1)} mmHg</p>
                    <p className="text-xs text-gray-600">CCT: {formData.cctOD}μm</p>
                  </div>
                </div>
              )}
              {formData.glaucomaSuspectOD && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800">
                    <p className="font-semibold">High IOP</p>
                    <p>IOP &gt; 21 mmHg</p>
                  </div>
                </div>
              )}
              {formData.hypotonyOD && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold">Low IOP</p>
                    <p>IOP &lt; 10 mmHg</p>
                  </div>
                </div>
              )}
            </div>

            {/* OS Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900">Left Eye (OS)</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusOS.variant === 'success' ? 'bg-emerald-100 text-emerald-800' :
                  statusOS.variant === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {statusOS.text}
                </span>
              </div>
              <ExamInput
                label="Measured IOP (mmHg)"
                type="number"
                step="1"
                min="0"
                max="60"
                value={formData.OS.measuredIOP}
                onChange={(e) => handleIOPChange('OS', e.target.value)}
                disabled={!canEdit}
              />
              {formData.cctCorrectionApplied && formData.OS.correctedIOP !== undefined && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <statusOS.icon className="w-6 h-6 text-emerald-700" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">CCT-Corrected:</p>
                    <p className="text-xl font-bold text-emerald-900">{formData.OS.correctedIOP.toFixed(1)} mmHg</p>
                    <p className="text-xs text-gray-600">CCT: {formData.cctOS}μm</p>
                  </div>
                </div>
              )}
              {formData.glaucomaSuspectOS && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800">
                    <p className="font-semibold">High IOP</p>
                    <p>IOP &gt; 21 mmHg</p>
                  </div>
                </div>
              )}
              {formData.hypotonyOS && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold">Low IOP</p>
                    <p>IOP &lt; 10 mmHg</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ExamCard>

        <ExamCard title="Patient Glaucoma Status" collapsible={true} defaultExpanded={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isGlaucomaPatient}
                onChange={(e) => {
                  setFormData({ ...formData, isGlaucomaPatient: e.target.checked });
                  setHasChanges(true);
                }}
                disabled={!canEdit}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">Known Glaucoma Patient</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.onGlaucomaMedication}
                onChange={(e) => {
                  setFormData({ ...formData, onGlaucomaMedication: e.target.checked });
                  setHasChanges(true);
                }}
                disabled={!canEdit}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">On Glaucoma Medication</span>
            </label>
          </div>

          {formData.onGlaucomaMedication && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Glaucoma Medications (add to notes below)
              </label>
              <p className="text-xs text-gray-500">List medications in the Clinical Notes section</p>
            </div>
          )}
        </ExamCard>

        <ExamCard title="Clinical Notes">
          <textarea
            value={formData.notes || ''}
            onChange={(e) => {
              setFormData({ ...formData, notes: e.target.value });
              setHasChanges(true);
            }}
            disabled={!canEdit}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </ExamCard>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 -mx-6 -mb-6 px-6 py-4 mt-6">
          <div className="flex items-center justify-end gap-3">
            {hasChanges && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Unsaved changes
              </p>
            )}
            <ActionButton variant="secondary" onClick={handleReset} disabled={!hasChanges || saving}>
              Reset
            </ActionButton>
            <ActionButton variant="primary" type="submit" disabled={!canEdit || saving} size="lg">
              {saving ? 'Saving...' : 'Save Tonometry'}
            </ActionButton>
          </div>
        </div>
      </form>
    </>
  );
}
