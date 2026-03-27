'use client';

import { useState, useEffect } from 'react';
import { KeratometryData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Circle } from 'lucide-react';

interface KeratometryFormProps {
  initialData: KeratometryData | null;
  patientId: string;
  onSave: (data: KeratometryData) => void;
  canEdit: boolean;
}

export default function KeratometryForm({ initialData, patientId, onSave, canEdit }: KeratometryFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<KeratometryData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    OD: {
      K1: 43.5,
      K2: 44.0,
      axis: 90,
    },
    OS: {
      K1: 43.5,
      K2: 44.0,
      axis: 90,
    },
    device: 'Manual Keratometer',
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

  const calculateAverageK = (K1: number, K2: number): number => {
    return (K1 + K2) / 2;
  };

  const calculateAstigmatism = (K1: number, K2: number): number => {
    return Math.abs(K2 - K1);
  };

  const handleODChange = (field: string, value: any) => {
    const newOD = {
      ...formData.OD,
      [field]: value === '' ? 0 : parseFloat(value) || 0,
    };
    
    setFormData({
      ...formData,
      OD: {
        ...newOD,
        averageK: calculateAverageK(newOD.K1, newOD.K2),
        cornealAstigmatism: calculateAstigmatism(newOD.K1, newOD.K2),
      },
    });
    setHasChanges(true);
  };

  const handleOSChange = (field: string, value: any) => {
    const newOS = {
      ...formData.OS,
      [field]: value === '' ? 0 : parseFloat(value) || 0,
    };
    
    setFormData({
      ...formData,
      OS: {
        ...newOS,
        averageK: calculateAverageK(newOS.K1, newOS.K2),
        cornealAstigmatism: calculateAstigmatism(newOS.K1, newOS.K2),
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
        {/* Keratometry Measurements */}
        <ExamCard 
          title="Keratometry Measurements"
          description="Corneal curvature measurement"
          icon={<Circle className="w-5 h-5" />}
          badge={
            formData.OD.K1 && formData.OD.K2 && formData.OS.K1 && formData.OS.K2
              ? { text: "Completed", variant: "success" }
              : { text: "Pending", variant: "pending" }
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ExamSelect
              label="Device"
              value={formData.device}
              onChange={(e) => {
                setFormData({ ...formData, device: e.target.value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Manual Keratometer">Manual Keratometer (Javal-Schiotz)</option>
              <option value="Autokeratometer">Autokeratometer</option>
              <option value="Topographer">Corneal Topographer</option>
              <option value="IOL Master">IOL Master</option>
              <option value="Lenstar">Lenstar</option>
            </ExamSelect>
            <ExamSelect
              label="Measurement Quality"
              value={formData.quality || 'Good'}
              onChange={(e) => {
                setFormData({ ...formData, quality: e.target.value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </ExamSelect>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OD Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Right Eye (OD)
              </h4>
              <ExamInput
                label="K1 - Flat Meridian (D)"
                type="number"
                step="0.01"
                value={formData.OD.K1}
                onChange={(e) => handleODChange('K1', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="K2 - Steep Meridian (D)"
                type="number"
                step="0.01"
                value={formData.OD.K2}
                onChange={(e) => handleODChange('K2', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Axis of K2 (°)"
                type="number"
                min="0"
                max="180"
                value={formData.OD.axis}
                onChange={(e) => handleODChange('axis', e.target.value)}
                disabled={!canEdit}
              />

              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Average K (D)</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {formData.OD.averageK?.toFixed(2) || calculateAverageK(formData.OD.K1, formData.OD.K2).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Corneal Astigmatism (D)</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {formData.OD.cornealAstigmatism?.toFixed(2) || calculateAstigmatism(formData.OD.K1, formData.OD.K2).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* OS Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Left Eye (OS)
              </h4>
              <ExamInput
                label="K1 - Flat Meridian (D)"
                type="number"
                step="0.01"
                value={formData.OS.K1}
                onChange={(e) => handleOSChange('K1', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="K2 - Steep Meridian (D)"
                type="number"
                step="0.01"
                value={formData.OS.K2}
                onChange={(e) => handleOSChange('K2', e.target.value)}
                disabled={!canEdit}
              />
              <ExamInput
                label="Axis of K2 (°)"
                type="number"
                min="0"
                max="180"
                value={formData.OS.axis}
                onChange={(e) => handleOSChange('axis', e.target.value)}
                disabled={!canEdit}
              />

              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Average K (D)</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {formData.OS.averageK?.toFixed(2) || calculateAverageK(formData.OS.K1, formData.OS.K2).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Corneal Astigmatism (D)</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {formData.OS.cornealAstigmatism?.toFixed(2) || calculateAstigmatism(formData.OS.K1, formData.OS.K2).toFixed(2)}
                  </p>
                </div>
              </div>
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
              {saving ? 'Saving...' : 'Save Keratometry'}
            </ActionButton>
          </div>
        </div>
      </form>
    </>
  );
}
