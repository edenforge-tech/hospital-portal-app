'use client';

import { useState, useEffect } from 'react';
import { PachymetryData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Layers } from 'lucide-react';

interface PachymetryFormProps {
  initialData: PachymetryData | null;
  patientId: string;
  onSave: (data: PachymetryData) => void;
  canEdit: boolean;
}

export default function PachymetryForm({ initialData, patientId, onSave, canEdit }: PachymetryFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<PachymetryData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    OD: {
      centralThickness: 545,
    },
    OS: {
      centralThickness: 545,
    },
    device: 'Ultrasonic Pachymeter',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        examinationDate: new Date(initialData.examinationDate),
      });
    }
  }, [initialData]);

  const handleODChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      OD: {
        ...formData.OD,
        [field]: value === '' ? undefined : parseFloat(value) || 0,
      },
    });
    setHasChanges(true);
  };

  const handleOSChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      OS: {
        ...formData.OS,
        [field]: value === '' ? undefined : parseFloat(value) || 0,
      },
    });
    setHasChanges(true);
  };

  const getCCTInterpretation = (cct: number): { text: string; color: string } => {
    if (cct < 500) return { text: 'Thin (Glaucoma Risk)', color: 'text-red-600' };
    if (cct < 520) return { text: 'Below Average', color: 'text-orange-600' };
    if (cct <= 570) return { text: 'Normal Range', color: 'text-emerald-600' };
    if (cct <= 600) return { text: 'Above Average', color: 'text-blue-600' };
    return { text: 'Thick', color: 'text-purple-600' };
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
      });
    }
    setHasChanges(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Central Corneal Thickness */}
        <ExamCard 
          title="Central Corneal Thickness"
          description="Corneal thickness measurement"
          icon={<Layers className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExamSelect
              label="Device"
              value={formData.device}
              onChange={(e) => {
                setFormData({ ...formData, device: e.target.value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Ultrasonic Pachymeter">Ultrasonic Pachymeter</option>
              <option value="Optical Coherence Tomography">OCT (Optical Coherence Tomography)</option>
              <option value="Scheimpflug Camera">Scheimpflug Camera (Pentacam)</option>
              <option value="Specular Microscopy">Specular Microscopy</option>
            </ExamSelect>
            <ExamSelect
              label="Measurement Mode"
              value={formData.mode || 'Single Scan'}
              onChange={(e) => {
                setFormData({ ...formData, mode: e.target.value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Single Scan">Single Scan</option>
              <option value="Multiple Scans">Multiple Scans (Average)</option>
              <option value="Mapping">Corneal Map</option>
            </ExamSelect>
          </div>
        </ExamCard>

        {/* Pachymetry Measurements - Both Eyes */}
        <ExamCard 
          title="Pachymetry Measurements"
          description="Corneal thickness profile"
          badge={
            formData.OD.centralThickness && formData.OS.centralThickness
              ? { text: "Completed", variant: "success" }
              : { text: "Pending", variant: "pending" }
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OD Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Right Eye (OD)
              </h4>
              <div>
                <ExamInput
                  label="Central Thickness (µm)"
                  type="number"
                  step="1"
                  value={formData.OD.centralThickness}
                  onChange={(e) => handleODChange('centralThickness', e.target.value)}
                  disabled={!canEdit}
                />
                <p className={`text-xs mt-1 font-medium ${getCCTInterpretation(formData.OD.centralThickness).color}`}>
                  {getCCTInterpretation(formData.OD.centralThickness).text}
                </p>
              </div>
              <ExamInput
                label="Superior (µm)"
                type="number"
                step="1"
                value={formData.OD.superior || ''}
                onChange={(e) => handleODChange('superior', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Inferior (µm)"
                type="number"
                step="1"
                value={formData.OD.inferior || ''}
                onChange={(e) => handleODChange('inferior', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Nasal (µm)"
                type="number"
                step="1"
                value={formData.OD.nasal || ''}
                onChange={(e) => handleODChange('nasal', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Temporal (µm)"
                type="number"
                step="1"
                value={formData.OD.temporal || ''}
                onChange={(e) => handleODChange('temporal', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Thinnest Point (µm)"
                type="number"
                step="1"
                value={formData.OD.thinnestPoint || ''}
                onChange={(e) => handleODChange('thinnestPoint', e.target.value)}
                disabled={!canEdit}
              />
            </div>

            {/* OS Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Left Eye (OS)
              </h4>
              <div>
                <ExamInput
                  label="Central Thickness (µm)"
                  type="number"
                  step="1"
                  value={formData.OS.centralThickness}
                  onChange={(e) => handleOSChange('centralThickness', e.target.value)}
                  disabled={!canEdit}
                />
                <p className={`text-xs mt-1 font-medium ${getCCTInterpretation(formData.OS.centralThickness).color}`}>
                  {getCCTInterpretation(formData.OS.centralThickness).text}
                </p>
              </div>
              <ExamInput
                label="Superior (µm)"
                type="number"
                step="1"
                value={formData.OS.superior || ''}
                onChange={(e) => handleOSChange('superior', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Inferior (µm)"
                type="number"
                step="1"
                value={formData.OS.inferior || ''}
                onChange={(e) => handleOSChange('inferior', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Nasal (µm)"
                type="number"
                step="1"
                value={formData.OS.nasal || ''}
                onChange={(e) => handleOSChange('nasal', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Temporal (µm)"
                type="number"
                step="1"
                value={formData.OS.temporal || ''}
                onChange={(e) => handleOSChange('temporal', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Thinnest Point (µm)"
                type="number"
                step="1"
                value={formData.OS.thinnestPoint || ''}
                onChange={(e) => handleOSChange('thinnestPoint', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <textarea
            value={formData.notes || ''}
            onChange={(e) => {
              setFormData({ ...formData, notes: e.target.value });
              setHasChanges(true);
            }}
            disabled={!canEdit}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 mt-4"
          />

          {/* Save Action Bar */}
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
                {saving ? 'Saving...' : 'Save Pachymetry'}
              </ActionButton>
            </div>
          </div>
        </ExamCard>
      </form>
    </>
  );
}
