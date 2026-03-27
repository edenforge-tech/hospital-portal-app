'use client';

import { useState, useEffect } from 'react';
import { VisualFieldData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Grid } from 'lucide-react';

interface VisualFieldFormProps {
  initialData: VisualFieldData | null;
  patientId: string;
  onSave: (data: VisualFieldData) => void;
  canEdit: boolean;
}

export default function VisualFieldForm({ initialData, patientId, onSave, canEdit }: VisualFieldFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<VisualFieldData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    testType: 'Automated',
    OD: {
      testCompleted: false,
    },
    OS: {
      testCompleted: false,
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
        [field]: value === '' ? undefined : (typeof value === 'string' && !isNaN(parseFloat(value)) ? parseFloat(value) : value),
      },
    });
    setHasChanges(true);
  };

  const handleOSChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      OS: {
        ...formData.OS,
        [field]: value === '' ? undefined : (typeof value === 'string' && !isNaN(parseFloat(value)) ? parseFloat(value) : value),
      },
    });
    setHasChanges(true);
  };

  const getReliabilityColor = (reliability: string): string => {
    switch (reliability) {
      case 'Excellent': return 'text-emerald-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-amber-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
        {/* Visual Field Test Configuration */}
        <ExamCard 
          title="Visual Field Test Configuration"
          description="Peripheral vision assessment"
          icon={<Grid className="w-5 h-5" />}
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
              <option value="Confrontation">Confrontation (Manual)</option>
              <option value="Amsler Grid">Amsler Grid (Central)</option>
              <option value="Automated">Automated Perimetry</option>
              <option value="Goldmann">Goldmann Perimetry</option>
              <option value="Frequency Doubling">Frequency Doubling Technology</option>
            </ExamSelect>
            
            {formData.testType === 'Automated' && (
              <ExamSelect
                label="Test Pattern"
                value={formData.testPattern || '24-2'}
                onChange={(e) => {
                  setFormData({ ...formData, testPattern: e.target.value });
                  setHasChanges(true);
                }}
                disabled={!canEdit}
              >
                <option value="24-2">24-2 (Standard)</option>
                <option value="30-2">30-2 (Extended)</option>
                <option value="10-2">10-2 (Central)</option>
                <option value="60-4">60-4 (Peripheral)</option>
              </ExamSelect>
            )}
            
            {formData.testType === 'Automated' && (
              <ExamSelect
                label="Strategy"
                value={formData.strategy || 'SITA Standard'}
                onChange={(e) => {
                  setFormData({ ...formData, strategy: e.target.value });
                  setHasChanges(true);
                }}
                disabled={!canEdit}
              >
                <option value="SITA Standard">SITA Standard</option>
                <option value="SITA Fast">SITA Fast</option>
                <option value="SITA Faster">SITA Faster</option>
                <option value="Full Threshold">Full Threshold</option>
              </ExamSelect>
            )}
          </div>
        </ExamCard>

        {/* Visual Field Results - Both Eyes */}
        <ExamCard 
          title="Visual Field Test Results"
          description="Peripheral vision analysis"
          badge={
            formData.OD.testCompleted && formData.OS.testCompleted
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.OD.testCompleted}
                  onChange={(e) => handleODChange('testCompleted', e.target.checked)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label className="text-sm font-medium text-gray-700">Test Completed</label>
              </div>
              <ExamSelect
                label="Reliability"
                value={formData.OD.reliability || 'Good'}
                onChange={(e) => handleODChange('reliability', e.target.value)}
                disabled={!canEdit}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </ExamSelect>
              {formData.testType === 'Automated' && (
                <>
                  <ExamInput
                    label="Mean Deviation (dB)"
                    type="number"
                    step="0.01"
                    value={formData.OD.MD || ''}
                    onChange={(e) => handleODChange('MD', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="Pattern Std Dev (dB)"
                    type="number"
                    step="0.01"
                    value={formData.OD.PSD || ''}
                    onChange={(e) => handleODChange('PSD', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="Visual Field Index (%)"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.OD.VFI || ''}
                    onChange={(e) => handleODChange('VFI', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="False Positives (%)"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.OD.falsePositives || ''}
                    onChange={(e) => handleODChange('falsePositives', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="False Negatives (%)"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.OD.falseNegatives || ''}
                    onChange={(e) => handleODChange('falseNegatives', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="Fixation Losses (%)"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.OD.fixationLosses || ''}
                    onChange={(e) => handleODChange('fixationLosses', e.target.value)}
                    disabled={!canEdit}
                  />
                </>
              )}
            </div>

            {/* OS Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Left Eye (OS)
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.OS.testCompleted}
                  onChange={(e) => handleOSChange('testCompleted', e.target.checked)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label className="text-sm font-medium text-gray-700">Test Completed</label>
              </div>
              <ExamSelect
                label="Reliability"
                value={formData.OS.reliability || 'Good'}
                onChange={(e) => handleOSChange('reliability', e.target.value)}
                disabled={!canEdit}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </ExamSelect>
              {formData.testType === 'Automated' && (
                <>
                  <ExamInput
                    label="Mean Deviation (dB)"
                    type="number"
                    step="0.01"
                    value={formData.OS.MD || ''}
                    onChange={(e) => handleOSChange('MD', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="Pattern Std Dev (dB)"
                    type="number"
                    step="0.01"
                    value={formData.OS.PSD || ''}
                    onChange={(e) => handleOSChange('PSD', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="Visual Field Index (%)"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.OS.VFI || ''}
                    onChange={(e) => handleOSChange('VFI', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="False Positives (%)"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.OS.falsePositives || ''}
                    onChange={(e) => handleOSChange('falsePositives', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="False Negatives (%)"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.OS.falseNegatives || ''}
                    onChange={(e) => handleOSChange('falseNegatives', e.target.value)}
                    disabled={!canEdit}
                  />
                  <ExamInput
                    label="Fixation Losses (%)"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.OS.fixationLosses || ''}
                    onChange={(e) => handleOSChange('fixationLosses', e.target.value)}
                    disabled={!canEdit}
                  />
                </>
              )}
            </div>
          </div>
        </ExamCard>

        {/* Interpretation */}
        <ExamCard 
          title="Interpretation"
          description="Clinical findings"
        >
          <textarea
            value={formData.interpretation || ''}
            onChange={(e) => {
              setFormData({ ...formData, interpretation: e.target.value });
              setHasChanges(true);
            }}
            disabled={!canEdit}
            rows={4}
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
                {saving ? 'Saving...' : 'Save Visual Field'}
              </ActionButton>
            </div>
          </div>
        </ExamCard>
      </form>
    </>
  );
}
