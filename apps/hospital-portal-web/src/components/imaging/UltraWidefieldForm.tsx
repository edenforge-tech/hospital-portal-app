'use client';

import { useState } from 'react';

interface UltraWidefieldData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  device: { manufacturer: string; model: string };
  OD: {
    imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    peripheralFindings: string[];
    posteriorFindings: string[];
    interpretation: string;
  };
  OS: {
    imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    peripheralFindings: string[];
    posteriorFindings: string[];
    interpretation: string;
  };
  notes?: string;
}

interface UltraWidefieldFormProps {
  patientId: string;
  initialData?: Partial<UltraWidefieldData> | null;
  onSave: (data: UltraWidefieldData) => Promise<void>;
  readOnly?: boolean;
}

export default function UltraWidefieldForm({ patientId, initialData, onSave, readOnly = false }: UltraWidefieldFormProps) {
  const [formData, setFormData] = useState<UltraWidefieldData>({
    patientId,
    examinationDate: initialData?.examinationDate || new Date(),
    examinerId: initialData?.examinerId || '',
    device: initialData?.device || { manufacturer: 'Optos', model: 'California' },
    OD: initialData?.OD || { imageQuality: 'Good', peripheralFindings: [], posteriorFindings: [], interpretation: '' },
    OS: initialData?.OS || { imageQuality: 'Good', peripheralFindings: [], posteriorFindings: [], interpretation: '' },
    notes: initialData?.notes || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const peripheralFindings = [
    'Normal peripheral retina',
    'Lattice degeneration',
    'Retinal tear (horseshoe)',
    'Retinal tear (atrophic hole)',
    'Retinal detachment',
    'Retinoschisis',
    'Peripheral hemorrhages',
    'Peripheral neovascularization',
    'Peripheral drusen',
    'Chorioretinal scar',
  ];

  const posteriorFindings = [
    'Normal posterior pole',
    'Diabetic retinopathy',
    'Hypertensive retinopathy',
    'Macular edema',
    'Epiretinal membrane',
    'Disc edema',
    'Optic atrophy',
    'CNVM',
    'Geographic atrophy',
  ];

  const toggleFinding = (eye: 'OD' | 'OS', type: 'peripheralFindings' | 'posteriorFindings', finding: string) => {
    setFormData(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [type]: prev[eye][type].includes(finding)
          ? prev[eye][type].filter(f => f !== finding)
          : [...prev[eye][type], finding],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      alert('Failed to save ultra-widefield data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
          <select value={`${formData.device.manufacturer}|${formData.device.model}`} onChange={e => { const [manufacturer, model] = e.target.value.split('|'); setFormData({ ...formData, device: { manufacturer, model } }); }} disabled={readOnly} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="Optos|California">Optos California (200°)</option>
            <option value="Optos|Silverstone">Optos Silverstone (200°)</option>
            <option value="Optos|Monaco">Optos Monaco (200°)</option>
            <option value="Zeiss|Clarus 500">Zeiss Clarus 500 (UWF)</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Eye (OD)</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Quality</label>
          <select value={formData.OD.imageQuality} onChange={e => setFormData({ ...formData, OD: { ...formData.OD, imageQuality: e.target.value as any } })} disabled={readOnly} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Peripheral Findings - OD</label>
          <div className="grid grid-cols-2 gap-2">
            {peripheralFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input type="checkbox" checked={formData.OD.peripheralFindings.includes(finding)} onChange={() => toggleFinding('OD', 'peripheralFindings', finding)} disabled={readOnly} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Posterior Pole Findings - OD</label>
          <div className="grid grid-cols-2 gap-2">
            {posteriorFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input type="checkbox" checked={formData.OD.posteriorFindings.includes(finding)} onChange={() => toggleFinding('OD', 'posteriorFindings', finding)} disabled={readOnly} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Left Eye (OS)</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Quality</label>
          <select value={formData.OS.imageQuality} onChange={e => setFormData({ ...formData, OS: { ...formData.OS, imageQuality: e.target.value as any } })} disabled={readOnly} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Peripheral Findings - OS</label>
          <div className="grid grid-cols-2 gap-2">
            {peripheralFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input type="checkbox" checked={formData.OS.peripheralFindings.includes(finding)} onChange={() => toggleFinding('OS', 'peripheralFindings', finding)} disabled={readOnly} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Posterior Pole Findings - OS</label>
          <div className="grid grid-cols-2 gap-2">
            {posteriorFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input type="checkbox" checked={formData.OS.posteriorFindings.includes(finding)} onChange={() => toggleFinding('OS', 'posteriorFindings', finding)} disabled={readOnly} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
        <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} disabled={readOnly} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Document peripheral lesions, retinal tears, need for laser treatment..." />
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
            {isSaving ? 'Saving...' : 'Save Ultra-Widefield Imaging'}
          </button>
        </div>
      )}
    </form>
  );
}
