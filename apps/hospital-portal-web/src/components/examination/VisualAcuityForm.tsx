'use client';

import { useState, useEffect } from 'react';
import { VisualAcuityData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';
import { ExamCard, ExamInput, ExamSelect, StatusBadge, SectionDivider, ActionButton } from './ExamCard';
import { Eye } from 'lucide-react';

interface VisualAcuityFormProps {
  initialData: VisualAcuityData | null;
  patientId: string;
  onSave: (data: VisualAcuityData) => void;
  canEdit: boolean;
}

const snellenValues = ['6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'CF', 'HM', 'PL', 'NPL'];
const nearVAValues = ['N6', 'N8', 'N10', 'N12', 'N18', 'N24', 'N36'];

export default function VisualAcuityForm({ initialData, patientId, onSave, canEdit }: VisualAcuityFormProps) {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<VisualAcuityData>({
    patientId,
    examinationDate: new Date(),
    examinerId: user?.id || '',
    distanceVA: {
      OD: { unaided: '6/6' },
      OS: { unaided: '6/6' },
    },
    chart: 'Snellen',
    testingDistance: '6 meters',
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

  const handleDistanceVAChange = (eye: 'OD' | 'OS', type: 'unaided' | 'aided' | 'pinhole', value: string) => {
    setFormData({
      ...formData,
      distanceVA: {
        ...formData.distanceVA,
        [eye]: {
          ...formData.distanceVA[eye],
          [type]: value,
        },
      },
    });
    setHasChanges(true);
  };

  const handleNearVAChange = (eye: 'OD' | 'OS', type: 'unaided' | 'aided', value: string) => {
    setFormData({
      ...formData,
      nearVA: {
        ...formData.nearVA,
        OD: formData.nearVA?.OD || { unaided: 'N6' },
        OS: formData.nearVA?.OS || { unaided: 'N6' },
        [eye]: {
          ...(formData.nearVA?.[eye] || { unaided: 'N6' }),
          [type]: value,
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
        {/* Chart Configuration */}
        <ExamCard 
          title="Visual Acuity Testing Configuration"
          description="Testing parameters"
          icon={<Eye className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExamSelect
              label="Chart Type"
              value={formData.chart}
              onChange={(e) => {
                setFormData({ ...formData, chart: e.target.value as any });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Snellen">Snellen</option>
              <option value="LogMAR">LogMAR</option>
              <option value="ETDRS">ETDRS</option>
              <option value="Lea Symbols">Lea Symbols (Pediatric)</option>
              <option value="Cardiff Cards">Cardiff Cards (Pediatric)</option>
            </ExamSelect>

            <ExamSelect
              label="Testing Distance"
              value={formData.testingDistance}
              onChange={(e) => {
                setFormData({ ...formData, testingDistance: e.target.value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="6 meters">6 meters (Snellen)</option>
              <option value="20 feet">20 feet (Snellen)</option>
              <option value="4 meters">4 meters</option>
              <option value="3 meters">3 meters</option>
            </ExamSelect>
          </div>
        </ExamCard>

        {/* Distance Visual Acuity */}
        <ExamCard 
          title="Distance Visual Acuity"
          description="Measurement of far vision clarity"
          badge={formData.distanceVA.OD.unaided && formData.distanceVA.OS.unaided ? { text: "Completed", variant: "success" } : { text: "Pending", variant: "pending" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OD Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Right Eye (OD)
              </h4>
              <ExamSelect
                label="Unaided"
                value={formData.distanceVA.OD.unaided}
                onChange={(e) => handleDistanceVAChange('OD', 'unaided', e.target.value)}
                disabled={!canEdit}
              >
                {snellenValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>

              <ExamSelect
                label="Aided (with glasses)"
                value={formData.distanceVA.OD.aided || ''}
                onChange={(e) => handleDistanceVAChange('OD', 'aided', e.target.value)}
                disabled={!canEdit}
              >
                <option value="">Not tested</option>
                {snellenValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>

              <ExamSelect
                label="Pinhole"
                value={formData.distanceVA.OD.pinhole || ''}
                onChange={(e) => handleDistanceVAChange('OD', 'pinhole', e.target.value)}
                disabled={!canEdit}
                helpText="If unaided vision is poor"
              >
                <option value="">Not tested</option>
                {snellenValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>
            </div>

            {/* OS Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Left Eye (OS)
              </h4>
              <ExamSelect
                label="Unaided"
                value={formData.distanceVA.OS.unaided}
                onChange={(e) => handleDistanceVAChange('OS', 'unaided', e.target.value)}
                disabled={!canEdit}
              >
                {snellenValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>

              <ExamSelect
                label="Aided (with glasses)"
                value={formData.distanceVA.OS.aided || ''}
                onChange={(e) => handleDistanceVAChange('OS', 'aided', e.target.value)}
                disabled={!canEdit}
              >
                <option value="">Not tested</option>
                {snellenValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>

              <ExamSelect
                label="Pinhole"
                value={formData.distanceVA.OS.pinhole || ''}
                onChange={(e) => handleDistanceVAChange('OS', 'pinhole', e.target.value)}
                disabled={!canEdit}
                helpText="If unaided vision is poor"
              >
                <option value="">Not tested</option>
                {snellenValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>
            </div>
          </div>
        </ExamCard>

        {/* Near Visual Acuity */}
        <ExamCard 
          title="Near Visual Acuity"
          description="Near vision testing"
          collapsible={true}
          defaultExpanded={false}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OD Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Right Eye (OD)
              </h4>
              <ExamSelect
                label="Unaided"
                value={formData.nearVA?.OD.unaided || ''}
                onChange={(e) => handleNearVAChange('OD', 'unaided', e.target.value)}
                disabled={!canEdit}
              >
                <option value="">Not tested</option>
                {nearVAValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>

              <ExamSelect
                label="Aided (with reading glasses)"
                value={formData.nearVA?.OD.aided || ''}
                onChange={(e) => handleNearVAChange('OD', 'aided', e.target.value)}
                disabled={!canEdit}
              >
                <option value="">Not tested</option>
                {nearVAValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>
            </div>

            {/* OS Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Left Eye (OS)
              </h4>
              <ExamSelect
                label="Unaided"
                value={formData.nearVA?.OS.unaided || ''}
                onChange={(e) => handleNearVAChange('OS', 'unaided', e.target.value)}
                disabled={!canEdit}
              >
                <option value="">Not tested</option>
                {nearVAValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>

              <ExamSelect
                label="Aided (with reading glasses)"
                value={formData.nearVA?.OS.aided || ''}
                onChange={(e) => handleNearVAChange('OS', 'aided', e.target.value)}
                disabled={!canEdit}
              >
                <option value="">Not tested</option>
                {nearVAValues.map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </ExamSelect>
            </div>
          </div>
        </ExamCard>

        {/* Clinical Notes */}
        <ExamCard title="Clinical Notes" description="Additional observations">
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
              {saving ? 'Saving...' : 'Save Visual Acuity'}
            </ActionButton>
          </div>
        </div>
      </form>
    </>
  );
}
