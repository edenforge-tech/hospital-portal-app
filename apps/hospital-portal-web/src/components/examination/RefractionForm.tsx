'use client';

import { useState, useEffect } from 'react';
import { RefractionData, RetinoscopyData, AutoRefractionData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Circle } from 'lucide-react';
const Eye = Circle;

interface RefractionFormProps {
  initialData: RefractionData | null;
  patientId: string;
  onSave: (data: RefractionData) => void;
  canEdit: boolean;
  retinoscopyData?: RetinoscopyData | null;
  autoRefractionData?: AutoRefractionData | null;
  previousRx?: any;
}

export default function RefractionForm({ 
  initialData, 
  patientId, 
  onSave, 
  canEdit,
  retinoscopyData,
  autoRefractionData,
  previousRx 
}: RefractionFormProps) {
  const { user } = useAuthStore();
  
  // Determine starting Rx source and values
  const getStartingRx = () => {
    if (retinoscopyData) {
      return {
        source: 'Retinoscopy' as const,
        OD: { 
          sphere: retinoscopyData.OD.sphere, 
          cylinder: retinoscopyData.OD.cylinder, 
          axis: retinoscopyData.OD.axis 
        },
        OS: { 
          sphere: retinoscopyData.OS.sphere, 
          cylinder: retinoscopyData.OS.cylinder, 
          axis: retinoscopyData.OS.axis 
        },
      };
    } else if (autoRefractionData) {
      return {
        source: 'Auto-Refractor' as const,
        OD: { 
          sphere: autoRefractionData.OD.sphere, 
          cylinder: autoRefractionData.OD.cylinder, 
          axis: autoRefractionData.OD.axis 
        },
        OS: { 
          sphere: autoRefractionData.OS.sphere, 
          cylinder: autoRefractionData.OS.cylinder, 
          axis: autoRefractionData.OS.axis 
        },
      };
    } else if (previousRx) {
      return {
        source: 'Previous Prescription' as const,
        OD: { 
          sphere: previousRx.OD.sphere || 0, 
          cylinder: previousRx.OD.cylinder || 0, 
          axis: previousRx.OD.axis || 0 
        },
        OS: { 
          sphere: previousRx.OS.sphere || 0, 
          cylinder: previousRx.OS.cylinder || 0, 
          axis: previousRx.OS.axis || 0 
        },
      };
    }
    return {
      source: 'Manual' as const,
      OD: { sphere: 0, cylinder: 0, axis: 0 },
      OS: { sphere: 0, cylinder: 0, axis: 0 },
    };
  };

  const [formData, setFormData] = useState<RefractionData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    startingRx: getStartingRx(),
    finalRx: {
      OD: {
        sphere: 0,
        cylinder: 0,
        axis: 0,
        visualAcuity: '6/6',
      },
      OS: {
        sphere: 0,
        cylinder: 0,
        axis: 0,
        visualAcuity: '6/6',
      },
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        examinationDate: new Date(initialData.examinationDate),
      });
    } else {
      // Initialize finalRx from starting Rx
      const starting = getStartingRx();
      setFormData(prev => ({
        ...prev,
        startingRx: starting,
        finalRx: {
          OD: {
            sphere: starting.OD.sphere,
            cylinder: starting.OD.cylinder || 0,
            axis: starting.OD.axis || 0,
            visualAcuity: '6/6',
          },
          OS: {
            sphere: starting.OS.sphere,
            cylinder: starting.OS.cylinder || 0,
            axis: starting.OS.axis || 0,
            visualAcuity: '6/6',
          },
        },
      }));
    }
  }, [initialData, retinoscopyData, autoRefractionData, previousRx]);

  const handleODChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      finalRx: {
        ...formData.finalRx,
        OD: {
          ...formData.finalRx.OD,
          [field]: value === '' ? 0 : (field === 'visualAcuity' ? value : parseFloat(value) || 0),
        },
      },
    });
    setHasChanges(true);
  };

  const handleOSChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      finalRx: {
        ...formData.finalRx,
        OS: {
          ...formData.finalRx.OS,
          [field]: value === '' ? 0 : (field === 'visualAcuity' ? value : parseFloat(value) || 0),
        },
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
        {/* Starting Prescription */}
        <ExamCard 
          title="Starting Prescription"
          description="Starting prescription"
          icon={<Eye className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-emerald-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                OD - {formData.startingRx.source}
              </p>
              <p className="text-sm font-mono">
                SPH {formData.startingRx.OD.sphere >= 0 ? '+' : ''}{formData.startingRx.OD.sphere.toFixed(2)}
                {' '}CYL {(formData.startingRx.OD.cylinder || 0) >= 0 ? '+' : ''}{(formData.startingRx.OD.cylinder || 0).toFixed(2)}
                {' '}× {formData.startingRx.OD.axis || 0}°
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                OS - {formData.startingRx.source}
              </p>
              <p className="text-sm font-mono">
                SPH {formData.startingRx.OS.sphere >= 0 ? '+' : ''}{formData.startingRx.OS.sphere.toFixed(2)}
                {' '}CYL {(formData.startingRx.OS.cylinder || 0) >= 0 ? '+' : ''}{(formData.startingRx.OS.cylinder || 0).toFixed(2)}
                {' '}× {formData.startingRx.OS.axis || 0}°
              </p>
            </div>
          </div>
        </ExamCard>

        {/* Final Prescription - Both Eyes */}
        <ExamCard 
          title="Final Prescription"
          description="Subjective refraction"
          badge={
            formData.finalRx.OD.visualAcuity && formData.finalRx.OS.visualAcuity
              ? { text: "Completed", variant: "success" }
              : { text: "Pending", variant: "warning" }
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
                value={formData.finalRx.OD.sphere}
                onChange={(e) => handleODChange('sphere', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Cylinder (D)"
                type="number"
                step="0.25"
                value={formData.finalRx.OD.cylinder || 0}
                onChange={(e) => handleODChange('cylinder', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Axis (°)"
                type="number"
                min="0"
                max="180"
                value={formData.finalRx.OD.axis || 0}
                onChange={(e) => handleODChange('axis', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Visual Acuity"
                type="text"
                value={formData.finalRx.OD.visualAcuity}
                onChange={(e) => handleODChange('visualAcuity', e.target.value)}
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
                value={formData.finalRx.OS.sphere}
                onChange={(e) => handleOSChange('sphere', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Cylinder (D)"
                type="number"
                step="0.25"
                value={formData.finalRx.OS.cylinder || 0}
                onChange={(e) => handleOSChange('cylinder', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Axis (°)"
                type="number"
                min="0"
                max="180"
                value={formData.finalRx.OS.axis || 0}
                onChange={(e) => handleOSChange('axis', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Visual Acuity"
                type="text"
                value={formData.finalRx.OS.visualAcuity}
                onChange={(e) => handleOSChange('visualAcuity', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
        </ExamCard>

        {/* Clinical Notes */}
        <ExamCard 
          title="Clinical Notes"
          description="Clinical notes"
        >
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Final Binocular VA
            </label>
            <div className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
              {formData.finalRx.OD.visualAcuity} / {formData.finalRx.OS.visualAcuity}
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
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
                {saving ? 'Saving...' : 'Save Refraction'}
              </ActionButton>
            </div>
          </div>
        </ExamCard>
      </form>
    </>
  );
}
