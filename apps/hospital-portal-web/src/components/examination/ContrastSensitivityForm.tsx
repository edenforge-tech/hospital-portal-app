'use client';

import { useState, useEffect } from 'react';
import { ContrastSensitivityData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Activity } from 'lucide-react';

interface ContrastSensitivityFormProps {
  initialData: ContrastSensitivityData | null;
  patientId: string;
  onSave: (data: ContrastSensitivityData) => void;
  canEdit: boolean;
}

export default function ContrastSensitivityForm({ initialData, patientId, onSave, canEdit }: ContrastSensitivityFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<ContrastSensitivityData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    testType: 'Pelli-Robson',
    OD: {
      logCS: 0,
    },
    OS: {
      logCS: 0,
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
    }
  }, [initialData]);

  const handleODChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      OD: {
        ...formData.OD,
        [field]: value === '' ? 0 : parseFloat(value) || 0,
      },
    });
    setHasChanges(true);
  };

  const handleOSChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      OS: {
        ...formData.OS,
        [field]: value === '' ? 0 : parseFloat(value) || 0,
      },
    });
    setHasChanges(true);
  };

  const getCSInterpretation = (logCS: number, testType: string): { text: string; color: string } => {
    if (testType === 'Pelli-Robson') {
      if (logCS >= 1.80) return { text: 'Normal', color: 'text-emerald-600' };
      if (logCS >= 1.50) return { text: 'Borderline', color: 'text-amber-600' };
      if (logCS >= 1.20) return { text: 'Mild Deficit', color: 'text-orange-600' };
      if (logCS >= 0.90) return { text: 'Moderate Deficit', color: 'text-red-600' };
      return { text: 'Severe Deficit', color: 'text-red-700' };
    }
    return { text: 'Measured', color: 'text-gray-600' };
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
        {/* Contrast Sensitivity Test */}
        <ExamCard 
          title="Contrast Sensitivity Test"
          description="Contrast sensitivity assessment"
          icon={<Activity className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExamSelect
              label="Test Type"
              value={formData.testType}
              onChange={(e) => {
                setFormData({ ...formData, testType: e.target.value as any });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Pelli-Robson">Pelli-Robson Chart</option>
              <option value="MARS">MARS Letter Chart</option>
              <option value="CSV-1000">CSV-1000 (Spatial Frequencies)</option>
              <option value="Quick CSF">Quick CSF Test</option>
            </ExamSelect>
            
            <ExamSelect
              label="Testing Distance"
              value={formData.testingDistance || '1 meter'}
              onChange={(e) => {
                setFormData({ ...formData, testingDistance: e.target.value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="1 meter">1 meter (Pelli-Robson)</option>
              <option value="3 meters">3 meters</option>
              <option value="6 meters">6 meters</option>
            </ExamSelect>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <ExamSelect
              label="Lighting Conditions"
              value={formData.lighting || '85 cd/m²'}
              onChange={(e) => {
                setFormData({ ...formData, lighting: e.target.value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="85 cd/m²">85 cd/m² (Standard)</option>
              <option value="High Luminance">High Luminance</option>
              <option value="Mesopic">Mesopic (Low Light)</option>
              <option value="Photopic">Photopic (Bright)</option>
            </ExamSelect>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.withCorrection || false}
                onChange={(e) => {
                  setFormData({ ...formData, withCorrection: e.target.checked });
                  setHasChanges(true);
                }}
                disabled={!canEdit}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label className="text-sm font-medium text-gray-700">With Best Correction</label>
            </div>
          </div>
        </ExamCard>

        {/* Contrast Sensitivity Measurements - Both Eyes */}
        <ExamCard 
          title="Contrast Sensitivity Measurements"
          description="Contrast sensitivity assessment"
          badge={
            formData.OD.logCS > 0 && formData.OS.logCS > 0
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
                  label="Log Contrast Sensitivity"
                  type="number"
                  step="0.05"
                  min="0"
                  max="2.5"
                  value={formData.OD.logCS}
                  onChange={(e) => handleODChange('logCS', e.target.value)}
                  disabled={!canEdit}
                />
                <p className={`text-xs mt-1 font-medium ${getCSInterpretation(formData.OD.logCS, formData.testType).color}`}>
                  {getCSInterpretation(formData.OD.logCS, formData.testType).text}
                </p>
              </div>
              {formData.testType === 'CSV-1000' && (
                <>
                  <ExamInput
                    label="3 cpd"
                    type="number"
                    step="0.05"
                    value={formData.OD.spatialFreq3 || ''}
                    onChange={(e) => handleODChange('spatialFreq3', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="6 cpd"
                    type="number"
                    step="0.05"
                    value={formData.OD.spatialFreq6 || ''}
                    onChange={(e) => handleODChange('spatialFreq6', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="12 cpd"
                    type="number"
                    step="0.05"
                    value={formData.OD.spatialFreq12 || ''}
                    onChange={(e) => handleODChange('spatialFreq12', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="18 cpd"
                    type="number"
                    step="0.05"
                    value={formData.OD.spatialFreq18 || ''}
                    onChange={(e) => handleODChange('spatialFreq18', e.target.value)}
                    disabled={!canEdit}
                  />
                </>
              )}
              {formData.testType === 'MARS' && (
                <ExamInput
                  label="MARS Score (letters)"
                  type="number"
                  min="0"
                  max="48"
                  value={formData.OD.marsScore || ''}
                  onChange={(e) => handleODChange('marsScore', e.target.value)}
                  disabled={!canEdit}
                />
              )}
            </div>

            {/* OS Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Left Eye (OS)
              </h4>
              <div>
                <ExamInput
                  label="Log Contrast Sensitivity"
                  type="number"
                  step="0.05"
                  min="0"
                  max="2.5"
                  value={formData.OS.logCS}
                  onChange={(e) => handleOSChange('logCS', e.target.value)}
                  disabled={!canEdit}
                />
                <p className={`text-xs mt-1 font-medium ${getCSInterpretation(formData.OS.logCS, formData.testType).color}`}>
                  {getCSInterpretation(formData.OS.logCS, formData.testType).text}
                </p>
              </div>

              {formData.testType === 'CSV-1000' && (
                <>
                  <ExamInput
                    label="3 cpd"
                    type="number"
                    step="0.05"
                    value={formData.OS.spatialFreq3 || ''}
                    onChange={(e) => handleOSChange('spatialFreq3', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="6 cpd"
                    type="number"
                    step="0.05"
                    value={formData.OS.spatialFreq6 || ''}
                    onChange={(e) => handleOSChange('spatialFreq6', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="12 cpd"
                    type="number"
                    step="0.05"
                    value={formData.OS.spatialFreq12 || ''}
                    onChange={(e) => handleOSChange('spatialFreq12', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="18 cpd"
                    type="number"
                    step="0.05"
                    value={formData.OS.spatialFreq18 || ''}
                    onChange={(e) => handleOSChange('spatialFreq18', e.target.value)}
                    disabled={!canEdit}
                  />
                </>
              )}
              {formData.testType === 'MARS' && (
                <ExamInput
                  label="MARS Score (letters)"
                  type="number"
                  min="0"
                  max="48"
                  value={formData.OS.marsScore || ''}
                  onChange={(e) => handleOSChange('marsScore', e.target.value)}
                  disabled={!canEdit}
                />
              )}
            </div>
          </div>

          <textarea
            value={formData.interpretation || ''}
            onChange={(e) => {
              setFormData({ ...formData, interpretation: e.target.value });
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
                {saving ? 'Saving...' : 'Save Contrast Sensitivity'}
              </ActionButton>
            </div>
          </div>
        </ExamCard>
      </form>
    </>
  );
}
