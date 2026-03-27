'use client';

import { useState, useEffect } from 'react';
import { ColorVisionData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Palette } from 'lucide-react';

interface ColorVisionFormProps {
  initialData: ColorVisionData | null;
  patientId: string;
  onSave: (data: ColorVisionData) => void;
  canEdit: boolean;
}

export default function ColorVisionForm({ initialData, patientId, onSave, canEdit }: ColorVisionFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<ColorVisionData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    testType: 'Ishihara',
    OD: {
      tested: false,
    },
    OS: {
      tested: false,
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

  const getResultColor = (result?: string): string => {
    if (!result) return 'text-gray-600';
    if (result === 'Normal') return 'text-emerald-600';
    if (result.includes('Red-Green')) return 'text-red-600';
    if (result.includes('Blue-Yellow')) return 'text-blue-600';
    return 'text-amber-600';
  };

  const calculateScore = (platesRead: number, totalPlates: number): string => {
    const percentage = (platesRead / totalPlates) * 100;
    return `${platesRead}/${totalPlates} (${percentage.toFixed(0)}%)`;
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
        {/* Color Vision Testing */}
        <ExamCard 
          title="Color Vision Testing"
          description="Color vision testing"
          icon={<Palette className="w-5 h-5" />}
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
              <option value="Ishihara">Ishihara Plates (38 plates)</option>
              <option value="D-15">Farnsworth D-15 (Dichotomous)</option>
              <option value="HRR">Hardy-Rand-Rittler (HRR)</option>
              <option value="Farnsworth-Munsell 100">Farnsworth-Munsell 100 Hue</option>
              <option value="Anomaloscope">Anomaloscope (Nagel)</option>
            </ExamSelect>
            
            <ExamSelect
              label="Testing Conditions"
              value={formData.lightingCondition || 'Natural Daylight'}
              onChange={(e) => {
                setFormData({ ...formData, lightingCondition: e.target.value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Natural Daylight">Natural Daylight</option>
              <option value="Standard Illuminant C">Standard Illuminant C</option>
              <option value="LED White">LED White Light</option>
              <option value="Fluorescent">Fluorescent</option>
            </ExamSelect>
          </div>

          {(formData.testType === 'Ishihara' || formData.testType === 'HRR') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <ExamInput
                label="Total Plates in Test"
                type="number"
                value={formData.totalPlates || (formData.testType === 'Ishihara' ? 38 : 24)}
                onChange={(e) => {
                  setFormData({ ...formData, totalPlates: parseInt(e.target.value) || 0 });
                  setHasChanges(true);
                }}
                disabled={!canEdit}
              />
            </div>
          )}
        </ExamCard>

        {/* Test Results */}
        <ExamCard 
          title="Test Results"
          description="Color vision assessment"
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
                  checked={formData.OD.tested}
                  onChange={(e) => handleODChange('tested', e.target.checked)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label className="text-sm font-medium text-gray-700">OD Tested Separately</label>
              </div>

              {formData.OD.tested && (
                <>
                  <ExamInput
                    label="Plates Read Correctly"
                    type="number"
                    min="0"
                    max={formData.totalPlates || 38}
                    value={formData.OD.platesRead || ''}
                    onChange={(e) => handleODChange('platesRead', e.target.value)}
                    disabled={!canEdit}
                  />
                  
                  <ExamSelect
                    label="Result"
                    value={formData.OD.result || 'Normal'}
                    onChange={(e) => handleODChange('result', e.target.value)}
                    disabled={!canEdit}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Red-Green Deficiency">Red-Green Deficiency</option>
                    <option value="Protanopia">Protanopia (Red Blind)</option>
                    <option value="Protanomaly">Protanomaly (Red Weak)</option>
                    <option value="Deuteranopia">Deuteranopia (Green Blind)</option>
                    <option value="Deuteranomaly">Deuteranomaly (Green Weak)</option>
                    <option value="Blue-Yellow Deficiency">Blue-Yellow Deficiency</option>
                    <option value="Tritanopia">Tritanopia (Blue Blind)</option>
                    <option value="Tritanomaly">Tritanomaly (Blue Weak)</option>
                    <option value="Achromatopsia">Achromatopsia (Total Color Blind)</option>
                  </ExamSelect>

                  {formData.OD.platesRead !== undefined && formData.totalPlates && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Score: <span className="font-semibold">{calculateScore(formData.OD.platesRead, formData.totalPlates)}</span>
                      </p>
                    </div>
                  )}
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
                  checked={formData.OS.tested}
                  onChange={(e) => handleOSChange('tested', e.target.checked)}
                  disabled={!canEdit}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label className="text-sm font-medium text-gray-700">OS Tested Separately</label>
              </div>

              {formData.OS.tested && (
                <>
                  <ExamInput
                    label="Plates Read Correctly"
                    type="number"
                    min="0"
                    max={formData.totalPlates || 38}
                    value={formData.OS.platesRead || ''}
                    onChange={(e) => handleOSChange('platesRead', e.target.value)}
                    disabled={!canEdit}
                  />
                  
                  <ExamSelect
                    label="Result"
                    value={formData.OS.result || 'Normal'}
                    onChange={(e) => handleOSChange('result', e.target.value)}
                    disabled={!canEdit}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Red-Green Deficiency">Red-Green Deficiency</option>
                    <option value="Protanopia">Protanopia (Red Blind)</option>
                    <option value="Protanomaly">Protanomaly (Red Weak)</option>
                    <option value="Deuteranopia">Deuteranopia (Green Blind)</option>
                    <option value="Deuteranomaly">Deuteranomaly (Green Weak)</option>
                    <option value="Blue-Yellow Deficiency">Blue-Yellow Deficiency</option>
                    <option value="Tritanopia">Tritanopia (Blue Blind)</option>
                    <option value="Tritanomaly">Tritanomaly (Blue Weak)</option>
                    <option value="Achromatopsia">Achromatopsia (Total Color Blind)</option>
                  </ExamSelect>

                  {formData.OS.platesRead !== undefined && formData.totalPlates && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Score: <span className="font-semibold">{calculateScore(formData.OS.platesRead, formData.totalPlates)}</span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Binocular Result */}
          {!formData.OD.tested && !formData.OS.tested && (
            <>
              <SectionDivider title="Binocular Testing" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExamInput
                  label="Plates Read Correctly"
                  type="number"
                  min="0"
                  max={formData.totalPlates || 38}
                  value={formData.platesRead || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, platesRead: parseInt(e.target.value) || 0 });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                />
                
                <ExamSelect
                  label="Result"
                  value={formData.result || 'Normal'}
                  onChange={(e) => {
                    setFormData({ ...formData, result: e.target.value as any });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="Normal">Normal</option>
                  <option value="Red-Green Deficiency">Red-Green Deficiency</option>
                  <option value="Protanopia">Protanopia (Red Blind)</option>
                  <option value="Protanomaly">Protanomaly (Red Weak)</option>
                  <option value="Deuteranopia">Deuteranopia (Green Blind)</option>
                  <option value="Deuteranomaly">Deuteranomaly (Green Weak)</option>
                  <option value="Blue-Yellow Deficiency">Blue-Yellow Deficiency</option>
                  <option value="Tritanopia">Tritanopia (Blue Blind)</option>
                  <option value="Tritanomaly">Tritanomaly (Blue Weak)</option>
                  <option value="Achromatopsia">Achromatopsia (Total Color Blind)</option>
                </ExamSelect>

                {formData.platesRead !== undefined && formData.totalPlates && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">
                      Score: <span className="font-semibold">{calculateScore(formData.platesRead, formData.totalPlates)}</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </ExamCard>

        {/* Plates Read */}
        <ExamCard 
          title="Plates Read"
          description="Detailed responses"
        >
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
                {saving ? 'Saving...' : 'Save Color Vision'}
              </ActionButton>
            </div>
          </div>
        </ExamCard>
      </form>
    </>
  );
}
