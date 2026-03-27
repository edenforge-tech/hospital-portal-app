'use client';

import { useState, useEffect } from 'react';
import { RetinoscopyData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Lightbulb } from 'lucide-react';

interface RetinoscopyFormProps {
  initialData: RetinoscopyData | null;
  patientId: string;
  onSave: (data: RetinoscopyData) => void;
  canEdit: boolean;
}

export default function RetinoscopyForm({ initialData, patientId, onSave, canEdit }: RetinoscopyFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<RetinoscopyData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    OD: {
      sphere: 0,
      workingDistance: 67,
    },
    OS: {
      sphere: 0,
      workingDistance: 67,
    },
    illumination: 'Streak',
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

  const calculateNeutralizingPower = (grossPower: number, workingDistance: number) => {
    const workingDistanceDiopters = 100 / workingDistance;
    return grossPower - workingDistanceDiopters;
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
        {/* Configuration */}
        <ExamCard 
          title="Retinoscopy Configuration"
          description="Objective refraction"
          icon={<Lightbulb className="w-5 h-5" />}
        >
          <ExamSelect
            label="Retinoscope Type"
            value={formData.illumination}
            onChange={(e) => {
              setFormData({ ...formData, illumination: e.target.value as 'Plane' | 'Streak' });
              setHasChanges(true);
            }}
            disabled={!canEdit}
          >
            <option value="Streak">Streak Retinoscope (most common)</option>
            <option value="Plane">Plane Retinoscope</option>
          </ExamSelect>
        </ExamCard>

        {/* Retinoscopy Measurements - Both Eyes */}
        <ExamCard 
          title="Retinoscopy Measurements"
          description="Objective measurements"
          badge={
            formData.OD.sphere !== 0 && formData.OS.sphere !== 0
              ? { text: "Measured", variant: "success" }
              : { text: "Pending", variant: "pending" }
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OD Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Right Eye (OD)
              </h4>
              <ExamSelect
                label="Working Distance (cm)"
                value={formData.OD.workingDistance}
                onChange={(e) => handleODChange('workingDistance', e.target.value)}
                disabled={!canEdit}
              >
                <option value="50">50 cm (2.00D)</option>
                <option value="67">67 cm (1.50D) - Standard</option>
                <option value="100">100 cm (1.00D)</option>
              </ExamSelect>
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
                value={formData.OD.cylinder || ''}
                onChange={(e) => handleODChange('cylinder', e.target.value)}
                disabled={!canEdit}
                helpText="Optional"
              />
              <ExamInput
                label="Axis (°)"
                type="number"
                min="0"
                max="180"
                step="5"
                value={formData.OD.axis || ''}
                onChange={(e) => handleODChange('axis', e.target.value)}
                disabled={!canEdit || !formData.OD.cylinder}
                helpText="0-180"
              />
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Neutralizing Power:</p>
                <p className="text-lg font-semibold text-emerald-900">
                  {calculateNeutralizingPower(formData.OD.sphere, formData.OD.workingDistance).toFixed(2)}D
                  {formData.OD.cylinder && (
                    <span className="text-sm">
                      {' '}/ {formData.OD.cylinder.toFixed(2)}D × {formData.OD.axis}°
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-600 mt-1">(Gross - Working distance)</p>
              </div>
            </div>

            {/* OS Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Left Eye (OS)
              </h4>
              <ExamSelect
                label="Working Distance (cm)"
                value={formData.OS.workingDistance}
                onChange={(e) => handleOSChange('workingDistance', e.target.value)}
                disabled={!canEdit}
              >
                <option value="50">50 cm (2.00D)</option>
                <option value="67">67cm (1.50D) - Standard</option>
                <option value="100">100 cm (1.00D)</option>
              </ExamSelect>
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
                value={formData.OS.cylinder || ''}
                onChange={(e) => handleOSChange('cylinder', e.target.value)}
                disabled={!canEdit}
                helpText="Optional"
              />
              <ExamInput
                label="Axis (°)"
                type="number"
                min="0"
                max="180"
                step="5"
                value={formData.OS.axis || ''}
                onChange={(e) => handleOSChange('axis', e.target.value)}
                disabled={!canEdit || !formData.OS.cylinder}
                helpText="0-180"
              />
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Neutralizing Power:</p>
                <p className="text-lg font-semibold text-emerald-900">
                  {calculateNeutralizingPower(formData.OS.sphere, formData.OS.workingDistance).toFixed(2)}D
                  {formData.OS.cylinder && (
                    <span className="text-sm">
                      {' '}/ {formData.OS.cylinder.toFixed(2)}D × {formData.OS.axis}°
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-600 mt-1">(Gross - Working distance)</p>
              </div>
            </div>
          </div>
        </ExamCard>

        {/* Clinical Notes */}
        <ExamCard title="Clinical Notes" description="Reflex quality and observations">
          <textarea
            value={formData.notes || ''}
            onChange={(e) => {
              setFormData({ ...formData, notes: e.target.value });
              setHasChanges(true);
            }}
            disabled={!canEdit}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        </ExamCard>

        {/* Info Section */}
        <ExamCard title="Retinoscopy Guidelines" collapsible={true} defaultExpanded={false}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>Starting Point:</strong> Retinoscopy provides objective baseline for subjective refraction</li>
              <li>• <strong>Working Distance:</strong> Most common is 67cm (1.50D) or 50cm (2.00D)</li>
              <li>• <strong>Neutralize Reflex:</strong> Move lenses until reflex motion reverses</li>
              <li>• <strong>"With" Motion:</strong> Add plus (or reduce minus)</li>
              <li>• <strong>"Against" Motion:</strong> Add minus (or reduce plus)</li>
              <li>• <strong>Astigmatism:</strong> Look for "scissoring" reflex, use streak to find axes</li>
            </ul>
          </div>
        </ExamCard>

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
              {saving ? 'Saving...' : 'Save Retinoscopy'}
            </ActionButton>
          </div>
        </div>
      </form>
    </>
  );
}
