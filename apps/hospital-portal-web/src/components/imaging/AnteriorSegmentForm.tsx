'use client';

import { useState } from 'react';

interface AnteriorSegmentData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  imagingType: 'Slit-lamp Photography' | 'Gonioscopy' | 'Anterior Segment OCT' | 'Scheimpflug';
  device: { manufacturer: string; model: string };
  OD: {
    cornealFindings: string[];
    irisFindings: string[];
    angleAssessment?: {
      quadrant: 'Superior' | 'Temporal' | 'Inferior' | 'Nasal';
      grading: 'Open' | 'Narrow' | 'Closed';
      pigmentation: 'None' | 'Mild' | 'Moderate' | 'Heavy';
    }[];
    anteriorChamberDepth?: 'Deep' | 'Normal' | 'Shallow';
    interpretation: string;
  };
  OS: {
    cornealFindings: string[];
    irisFindings: string[];
    angleAssessment?: {
      quadrant: 'Superior' | 'Temporal' | 'Inferior' | 'Nasal';
      grading: 'Open' | 'Narrow' | 'Closed';
      pigmentation: 'None' | 'Mild' | 'Moderate' | 'Heavy';
    }[];
    anteriorChamberDepth?: 'Deep' | 'Normal' | 'Shallow';
    interpretation: string;
  };
  notes?: string;
}

interface AnteriorSegmentFormProps {
  patientId: string;
  initialData?: Partial<AnteriorSegmentData> | null;
  onSave: (data: AnteriorSegmentData) => Promise<void>;
  readOnly?: boolean;
}

export default function AnteriorSegmentForm({ patientId, initialData, onSave, readOnly = false }: AnteriorSegmentFormProps) {
  const [formData, setFormData] = useState<AnteriorSegmentData>({
    patientId,
    examinationDate: initialData?.examinationDate || new Date(),
    examinerId: initialData?.examinerId || '',
    imagingType: initialData?.imagingType || 'Slit-lamp Photography',
    device: initialData?.device || { manufacturer: 'Haag-Streit', model: 'BM 900' },
    OD: initialData?.OD || { cornealFindings: [], irisFindings: [], interpretation: '' },
    OS: initialData?.OS || { cornealFindings: [], irisFindings: [], interpretation: '' },
    notes: initialData?.notes || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const cornealFindings = [
    'Clear cornea',
    'Corneal edema',
    'Corneal opacity/scar',
    'Keratic precipitates',
    'Endothelial dystrophy',
    'Epithelial defect',
    'Stromal infiltrate',
    'Corneal ulcer',
    'Pterygium',
    'Band keratopathy',
  ];

  const irisFindings = [
    'Normal iris',
    'Iris atrophy',
    'Iris neovascularization',
    'Posterior synechiae',
    'Iridodialysis',
    'Iris cyst',
    'Iris nevus',
    'Heterochromia',
    'Anisocoria',
  ];

  const toggleFinding = (eye: 'OD' | 'OS', type: 'cornealFindings' | 'irisFindings', finding: string) => {
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
      alert('Failed to save anterior segment data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Imaging Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imaging Type</label>
            <select value={formData.imagingType} onChange={e => setFormData({ ...formData, imagingType: e.target.value as any })} disabled={readOnly} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option>Slit-lamp Photography</option>
              <option>Gonioscopy</option>
              <option>Anterior Segment OCT</option>
              <option>Scheimpflug</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
            <select value={`${formData.device.manufacturer}|${formData.device.model}`} onChange={e => { const [manufacturer, model] = e.target.value.split('|'); setFormData({ ...formData, device: { manufacturer, model } }); }} disabled={readOnly} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="Haag-Streit|BM 900">Haag-Streit BM 900 (Slit-lamp)</option>
              <option value="Zeiss|SL 220">Zeiss SL 220 (Slit-lamp)</option>
              <option value="Heidelberg|Anterion">Heidelberg Anterion (AS-OCT)</option>
              <option value="Optovue|Avanti">Optovue Avanti (AS-OCT)</option>
              <option value="Oculus|Pentacam">Oculus Pentacam (Scheimpflug)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Eye (OD)</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Corneal Findings - OD</label>
          <div className="grid grid-cols-2 gap-2">
            {cornealFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input type="checkbox" checked={formData.OD.cornealFindings.includes(finding)} onChange={() => toggleFinding('OD', 'cornealFindings', finding)} disabled={readOnly} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Iris Findings - OD</label>
          <div className="grid grid-cols-2 gap-2">
            {irisFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input type="checkbox" checked={formData.OD.irisFindings.includes(finding)} onChange={() => toggleFinding('OD', 'irisFindings', finding)} disabled={readOnly} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>

        {formData.imagingType === 'Gonioscopy' && (
          <div className="bg-purple-50 p-4 rounded mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Gonioscopy - OD</h4>
            <p className="text-sm text-gray-600 mb-2">Angle grading by quadrant (Shaffer grading)</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anterior Chamber Depth</label>
              <select value={formData.OD.anteriorChamberDepth || 'Normal'} onChange={e => setFormData({ ...formData, OD: { ...formData.OD, anteriorChamberDepth: e.target.value as any } })} disabled={readOnly} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option>Deep</option>
                <option>Normal</option>
                <option>Shallow</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Left Eye (OS)</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Corneal Findings - OS</label>
          <div className="grid grid-cols-2 gap-2">
            {cornealFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input type="checkbox" checked={formData.OS.cornealFindings.includes(finding)} onChange={() => toggleFinding('OS', 'cornealFindings', finding)} disabled={readOnly} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Iris Findings - OS</label>
          <div className="grid grid-cols-2 gap-2">
            {irisFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input type="checkbox" checked={formData.OS.irisFindings.includes(finding)} onChange={() => toggleFinding('OS', 'irisFindings', finding)} disabled={readOnly} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>

        {formData.imagingType === 'Gonioscopy' && (
          <div className="bg-purple-50 p-4 rounded mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Gonioscopy - OS</h4>
            <p className="text-sm text-gray-600 mb-2">Angle grading by quadrant (Shaffer grading)</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anterior Chamber Depth</label>
              <select value={formData.OS.anteriorChamberDepth || 'Normal'} onChange={e => setFormData({ ...formData, OS: { ...formData.OS, anteriorChamberDepth: e.target.value as any } })} disabled={readOnly} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option>Deep</option>
                <option>Normal</option>
                <option>Shallow</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
        <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} disabled={readOnly} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Document angle closure risk, glaucoma findings, corneal pathology..." />
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
            {isSaving ? 'Saving...' : 'Save Anterior Segment Imaging'}
          </button>
        </div>
      )}
    </form>
  );
}
