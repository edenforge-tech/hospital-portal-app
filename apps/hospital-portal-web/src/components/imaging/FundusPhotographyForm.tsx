'use client';

import { useState } from 'react';

interface FundusPhotographyData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  imagingType: 'Color Fundus' | 'Red-Free' | 'Autofluorescence' | 'FA' | 'ICG';
  camera: {
    manufacturer: string;
    model: string;
  };
  protocol?: '7-Field' | '9-Field' | 'Ultra-Widefield' | 'Macula-Centered' | 'Custom';
  pupilDilation?: boolean;
  dilatingAgent?: string;
  OD: {
    imagesAcquired: number;
    imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    views: string[]; // e.g., 'Disc-centered', 'Macula-centered', 'Temporal', etc.
    findings: string[];
    gradability: 'Gradable' | 'Ungradable';
    ungradableReason?: string;
  };
  OS: {
    imagesAcquired: number;
    imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    views: string[];
    findings: string[];
    gradability: 'Gradable' | 'Ungradable';
    ungradableReason?: string;
  };
  angiography?: {
    type: 'FA' | 'ICG';
    dye: string;
    dyeVolume?: number; // ml
    adverseReaction: boolean;
    reactionDetails?: string;
    phases: string[]; // 'Early', 'Mid', 'Late', 'Very Late'
    transitTime?: number; // seconds
    findings: string[];
  };
  notes?: string;
}

interface FundusPhotographyFormProps {
  patientId: string;
  initialData?: Partial<FundusPhotographyData> | null;
  onSave: (data: FundusPhotographyData) => Promise<void>;
  readOnly?: boolean;
}

export default function FundusPhotographyForm({
  patientId,
  initialData,
  onSave,
  readOnly = false,
}: FundusPhotographyFormProps) {
  const [formData, setFormData] = useState<FundusPhotographyData>({
    patientId,
    examinationDate: initialData?.examinationDate || new Date(),
    examinerId: initialData?.examinerId || '',
    imagingType: initialData?.imagingType || 'Color Fundus',
    camera: initialData?.camera || { manufacturer: 'Topcon', model: 'TRC-NW400' },
    protocol: initialData?.protocol || '7-Field',
    pupilDilation: initialData?.pupilDilation ?? true,
    dilatingAgent: initialData?.dilatingAgent || '',
    OD: initialData?.OD || {
      imagesAcquired: 0,
      imageQuality: 'Good',
      views: [],
      findings: [],
      gradability: 'Gradable',
    },
    OS: initialData?.OS || {
      imagesAcquired: 0,
      imageQuality: 'Good',
      views: [],
      findings: [],
      gradability: 'Gradable',
    },
    angiography: initialData?.angiography,
    notes: initialData?.notes || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const fundusViews = [
    'Disc-centered',
    'Macula-centered',
    'Superior temporal',
    'Inferior temporal',
    'Superior nasal',
    'Inferior nasal',
    'Temporal to macula',
    'Peripheral superior',
    'Peripheral inferior',
  ];

  const commonFindings = [
    'Normal fundus',
    'Drusen (hard)',
    'Drusen (soft)',
    'Geographic atrophy',
    'Pigmentary changes',
    'Macular edema',
    'Subretinal fluid',
    'Hemorrhages (dot-blot)',
    'Hemorrhages (flame-shaped)',
    'Microaneurysms',
    'Cotton wool spots',
    'Hard exudates',
    'Neovascularization',
    'Disc edema',
    'Disc pallor',
    'Cup-to-disc ratio increased',
    'Epiretinal membrane',
    'Macular hole',
    'Retinal tear',
    'Retinal detachment',
    'Lattice degeneration',
    'Chorioretinal scarring',
    'Nevus/melanoma',
  ];

  const angiographyFindings = [
    'Normal perfusion',
    'Delayed choroidal filling',
    'Delayed retinal filling',
    'Capillary non-perfusion',
    'Microaneurysms',
    'Vascular leakage',
    'Neovascularization (disc)',
    'Neovascularization (elsewhere)',
    'CNV (classic)',
    'CNV (occult)',
    'CNV (mixed)',
    'Window defects',
    'Blocked fluorescence',
    'Cystoid macular edema',
    'Central serous retinopathy',
    'Vascular occlusion',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save fundus photography:', error);
      alert('Failed to save fundus photography data');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleView = (eye: 'OD' | 'OS', view: string) => {
    setFormData(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        views: prev[eye].views.includes(view)
          ? prev[eye].views.filter(v => v !== view)
          : [...prev[eye].views, view],
      },
    }));
  };

  const toggleFinding = (eye: 'OD' | 'OS', finding: string) => {
    setFormData(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        findings: prev[eye].findings.includes(finding)
          ? prev[eye].findings.filter(f => f !== finding)
          : [...prev[eye].findings, finding],
      },
    }));
  };

  const toggleAngiographyFinding = (finding: string) => {
    if (!formData.angiography) return;

    setFormData(prev => ({
      ...prev,
      angiography: {
        ...prev.angiography!,
        findings: prev.angiography!.findings.includes(finding)
          ? prev.angiography!.findings.filter(f => f !== finding)
          : [...prev.angiography!.findings, finding],
      },
    }));
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      {/* Examination Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Examination Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imaging Type
            </label>
            <select
              value={formData.imagingType}
              onChange={e => setFormData({ ...formData, imagingType: e.target.value as any })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>Color Fundus</option>
              <option>Red-Free</option>
              <option>Autofluorescence</option>
              <option>FA</option>
              <option>ICG</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protocol
            </label>
            <select
              value={formData.protocol}
              onChange={e => setFormData({ ...formData, protocol: e.target.value as any })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>7-Field</option>
              <option>9-Field</option>
              <option>Ultra-Widefield</option>
              <option>Macula-Centered</option>
              <option>Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Camera Manufacturer/Model
            </label>
            <select
              value={`${formData.camera.manufacturer}|${formData.camera.model}`}
              onChange={e => {
                const [manufacturer, model] = e.target.value.split('|');
                setFormData({ ...formData, camera: { manufacturer, model } });
              }}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Topcon|TRC-NW400">Topcon TRC-NW400 (Non-mydriatic)</option>
              <option value="Canon|CR-2">Canon CR-2 (Non-mydriatic)</option>
              <option value="Zeiss|Visucam 500">Zeiss Visucam 500</option>
              <option value="Optos|California">Optos California (UWF)</option>
              <option value="Optos|Silverstone">Optos Silverstone (UWF)</option>
              <option value="Kowa|VX-20">Kowa VX-20</option>
              <option value="Heidelberg|Spectralis">Heidelberg Spectralis</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.pupilDilation}
                onChange={e => setFormData({ ...formData, pupilDilation: e.target.checked })}
                disabled={readOnly}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Pupil Dilation</span>
            </label>
            {formData.pupilDilation && (
              <input
                type="text"
                placeholder="Dilating agent (e.g., Tropicamide 1%)"
                value={formData.dilatingAgent}
                onChange={e => setFormData({ ...formData, dilatingAgent: e.target.value })}
                disabled={readOnly}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* OD Imaging */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Eye (OD)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images Acquired
            </label>
            <input
              type="number"
              min="0"
              value={formData.OD.imagesAcquired}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, imagesAcquired: parseInt(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Quality
            </label>
            <select
              value={formData.OD.imageQuality}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, imageQuality: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getQualityColor(formData.OD.imageQuality)}`}>
              {formData.OD.imageQuality}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gradability
            </label>
            <select
              value={formData.OD.gradability}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, gradability: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Gradable</option>
              <option>Ungradable</option>
            </select>
          </div>
        </div>

        {formData.OD.gradability === 'Ungradable' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ungradable Reason
            </label>
            <input
              type="text"
              placeholder="e.g., Media opacity, poor fixation"
              value={formData.OD.ungradableReason || ''}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, ungradableReason: e.target.value }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fundus Views Captured
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {fundusViews.map(view => (
              <label key={view} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.OD.views.includes(view)}
                  onChange={() => toggleView('OD', view)}
                  disabled={readOnly}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{view}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clinical Findings - OD
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.OD.findings.includes(finding)}
                  onChange={() => toggleFinding('OD', finding)}
                  disabled={readOnly}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* OS Imaging */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Left Eye (OS)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images Acquired
            </label>
            <input
              type="number"
              min="0"
              value={formData.OS.imagesAcquired}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, imagesAcquired: parseInt(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Quality
            </label>
            <select
              value={formData.OS.imageQuality}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, imageQuality: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getQualityColor(formData.OS.imageQuality)}`}>
              {formData.OS.imageQuality}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gradability
            </label>
            <select
              value={formData.OS.gradability}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, gradability: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Gradable</option>
              <option>Ungradable</option>
            </select>
          </div>
        </div>

        {formData.OS.gradability === 'Ungradable' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ungradable Reason
            </label>
            <input
              type="text"
              placeholder="e.g., Media opacity, poor fixation"
              value={formData.OS.ungradableReason || ''}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, ungradableReason: e.target.value }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fundus Views Captured
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {fundusViews.map(view => (
              <label key={view} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.OS.views.includes(view)}
                  onChange={() => toggleView('OS', view)}
                  disabled={readOnly}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-md"
                />
                <span className="ml-2 text-sm text-gray-700">{view}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clinical Findings - OS
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonFindings.map(finding => (
              <label key={finding} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.OS.findings.includes(finding)}
                  onChange={() => toggleFinding('OS', finding)}
                  disabled={readOnly}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{finding}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Angiography Section */}
      {(formData.imagingType === 'FA' || formData.imagingType === 'ICG') && (
        <div className="border-t pt-4 bg-amber-50 p-4 rounded">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Angiography Details</h3>
          
          {!formData.angiography ? (
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                angiography: {
                  type: formData.imagingType as 'FA' | 'ICG',
                  dye: formData.imagingType === 'FA' ? 'Fluorescein Sodium' : 'Indocyanine Green',
                  adverseReaction: false,
                  phases: [],
                  findings: [],
                }
              })}
              disabled={readOnly}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add Angiography Data
            </button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dye
                  </label>
                  <input
                    type="text"
                    value={formData.angiography.dye}
                    onChange={e => setFormData({
                      ...formData,
                      angiography: { ...formData.angiography!, dye: e.target.value }
                    })}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dye Volume (ml)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.angiography.dyeVolume || ''}
                    onChange={e => setFormData({
                      ...formData,
                      angiography: { ...formData.angiography!, dyeVolume: parseFloat(e.target.value) || undefined }
                    })}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arm-to-Retina Transit Time (sec)
                  </label>
                  <input
                    type="number"
                    value={formData.angiography.transitTime || ''}
                    onChange={e => setFormData({
                      ...formData,
                      angiography: { ...formData.angiography!, transitTime: parseInt(e.target.value) || undefined }
                    })}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.angiography.adverseReaction}
                    onChange={e => setFormData({
                      ...formData,
                      angiography: { ...formData.angiography!, adverseReaction: e.target.checked }
                    })}
                    disabled={readOnly}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-red-700">Adverse Reaction</span>
                </label>
                {formData.angiography.adverseReaction && (
                  <textarea
                    placeholder="Describe adverse reaction..."
                    value={formData.angiography.reactionDetails || ''}
                    onChange={e => setFormData({
                      ...formData,
                      angiography: { ...formData.angiography!, reactionDetails: e.target.value }
                    })}
                    disabled={readOnly}
                    rows={2}
                    className="mt-2 w-full px-3 py-2 border border-red-300 rounded-md bg-red-50"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phases Captured
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Early', 'Mid', 'Late', 'Very Late'].map(phase => (
                    <label key={phase} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.angiography!.phases.includes(phase)}
                        onChange={() => {
                          const phases = formData.angiography!.phases.includes(phase)
                            ? formData.angiography!.phases.filter(p => p !== phase)
                            : [...formData.angiography!.phases, phase];
                          setFormData({
                            ...formData,
                            angiography: { ...formData.angiography!, phases }
                          });
                        }}
                        disabled={readOnly}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{phase}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Angiographic Findings
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {angiographyFindings.map(finding => (
                    <label key={finding} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.angiography!.findings.includes(finding)}
                        onChange={() => toggleAngiographyFinding(finding)}
                        disabled={readOnly}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{finding}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Clinical Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          disabled={readOnly}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Document additional findings, image quality issues, patient cooperation, etc."
        />
      </div>

      {/* Submit Button */}
      {!readOnly && (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Fundus Photography'}
          </button>
        </div>
      )}
    </form>
  );
}
