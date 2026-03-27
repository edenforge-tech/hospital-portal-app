'use client';

import { useState, useEffect } from 'react';
import { AutoRefractionData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Scan } from 'lucide-react';

interface AutoRefractionFormProps {
  initialData: AutoRefractionData | null;
  patientId: string;
  onSave: (data: AutoRefractionData) => void;
  canEdit: boolean;
}

export default function AutoRefractionForm({ initialData, patientId, onSave, canEdit }: AutoRefractionFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<AutoRefractionData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    OD: {
      sphere: 0,
      cylinder: 0,
      axis: 0,
    },
    OS: {
      sphere: 0,
      cylinder: 0,
      axis: 0,
    },
    device: 'Auto Refractometer',
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
        [field]: value === '' ? undefined : parseFloat(value) || value,
      },
    });
    setHasChanges(true);
  };

  const handleOSChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      OS: {
        ...formData.OS,
        [field]: value === '' ? undefined : parseFloat(value) || value,
      },
    });
    setHasChanges(true);
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
        {/* Auto-Refraction Results */}
        <ExamCard 
          title="Auto-Refraction Results"
          description="Automated refraction"
          icon={<Scan className="w-5 h-5" />}
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
              <option value="Auto Refractometer">Auto Refractometer</option>
              <option value="Autorefractor-Keratometer">Autorefractor-Keratometer</option>
              <option value="Aberrometer">Aberrometer</option>
              <option value="Wavefront Analyzer">Wavefront Analyzer</option>
            </ExamSelect>
            <ExamInput
              label="Measurement Time"
              type="datetime-local"
              value={formData.measurementTime ? new Date(formData.measurementTime).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                setFormData({ ...formData, measurementTime: new Date(e.target.value) });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            />
          </div>
        </ExamCard>

        {/* Automated Refraction - Both Eyes */}
        <ExamCard 
          title="Automated Refraction Measurements"
          description="Refraction results"
          badge={
            (formData.OD.sphere !== 0 || formData.OD.cylinder !== 0) &&
            (formData.OS.sphere !== 0 || formData.OS.cylinder !== 0)
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
              <ExamInput
                label="Sphere (D)"
                type="number"
                step="0.25"
                value={formData.OD.sphere}
                onChange={(e) => handleODChange('sphere', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Cylinder (D)"
                type="number"
                step="0.25"
                value={formData.OD.cylinder}
                onChange={(e) => handleODChange('cylinder', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Axis (°)"
                type="number"
                min="0"
                max="180"
                value={formData.OD.axis}
                onChange={(e) => handleODChange('axis', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Pupil Diameter (mm)"
                type="number"
                step="0.1"
                value={formData.OD.pupilDiameter || ''}
                onChange={(e) => handleODChange('pupilDiameter', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Vertex Distance (mm)"
                type="number"
                step="0.5"
                value={formData.OD.vertexDistance || ''}
                onChange={(e) => handleODChange('vertexDistance', e.target.value)}
                disabled={!canEdit}
              />
            </div>

            {/* OS Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Left Eye (OS)
              </h4>
              <ExamInput
                label="Sphere (D)"
                type="number"
                step="0.25"
                value={formData.OS.sphere}
                onChange={(e) => handleOSChange('sphere', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Cylinder (D)"
                type="number"
                step="0.25"
                value={formData.OS.cylinder}
                onChange={(e) => handleOSChange('cylinder', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Axis (°)"
                type="number"
                min="0"
                max="180"
                value={formData.OS.axis}
                onChange={(e) => handleOSChange('axis', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Pupil Diameter (mm)"
                type="number"
                step="0.1"
                value={formData.OS.pupilDiameter || ''}
                onChange={(e) => handleOSChange('pupilDiameter', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Vertex Distance (mm)"
                type="number"
                step="0.5"
                value={formData.OS.vertexDistance || ''}
                onChange={(e) => handleOSChange('vertexDistance', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
        </ExamCard>

        {/* Additional Parameters */}
        <ExamCard 
          title="Additional Parameters"
          description="PD and keratometry"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ExamInput
              label="PD Distance (mm)"
              type="number"
              step="0.5"
              value={formData.PD || ''}
              onChange={(e) => {
                setFormData({ ...formData, PD: parseFloat(e.target.value) || undefined });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            />
            <ExamInput
              label="K1 OD (D)"
              type="number"
              step="0.01"
              value={formData.keratometryOD?.K1 || ''}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  keratometryOD: { ...formData.keratometryOD, K1: parseFloat(e.target.value) || 0 } 
                });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            />
            <ExamInput
              label="K2 OD (D)"
              type="number"
              step="0.01"
              value={formData.keratometryOD?.K2 || ''}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  keratometryOD: { ...formData.keratometryOD, K2: parseFloat(e.target.value) || 0 } 
                });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            />
            <ExamInput
              label="K1 OS (D)"
              type="number"
              step="0.01"
              value={formData.keratometryOS?.K1 || ''}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  keratometryOS: { ...formData.keratometryOS, K1: parseFloat(e.target.value) || 0 } 
                });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            />
            <ExamInput
              label="K2 OS (D)"
              type="number"
              step="0.01"
              value={formData.keratometryOS?.K2 || ''}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  keratometryOS: { ...formData.keratometryOS, K2: parseFloat(e.target.value) || 0 } 
                });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            />
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
                {saving ? 'Saving...' : 'Save Auto-Refraction'}
              </ActionButton>
            </div>
          </div>
        </ExamCard>
      </form>
    </>
  );
}
