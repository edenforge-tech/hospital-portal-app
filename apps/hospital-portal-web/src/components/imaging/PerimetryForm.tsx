'use client';

import { useState } from 'react';

interface PerimetryData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  device: {
    manufacturer: string;
    model: string;
  };
  testType: 'Humphrey' | 'Goldmann' | 'FDT' | 'Octopus';
  OD: {
    testPattern: '24-2' | '30-2' | '10-2' | '60-4' | 'Macula';
    strategy: 'SITA Standard' | 'SITA Fast' | 'SITA Faster' | 'Full Threshold' | 'FastPac';
    stimulusSize: 'III' | 'V';
    meanDeviation: number; // dB
    patternStandardDeviation: number; // dB
    visualFieldIndex: number; // percentage
    ghtResult: 'Within Normal Limits' | 'Borderline' | 'Outside Normal Limits' | 'Abnormally High Sensitivity' | 'General Reduction of Sensitivity';
    reliability: {
      fixationLosses: number; // percentage
      falsePositives: number; // percentage
      falseNegatives: number; // percentage
      testDuration: number; // minutes
    };
    defects: string[];
    reliable: boolean;
  };
  OS: {
    testPattern: '24-2' | '30-2' | '10-2' | '60-4' | 'Macula';
    strategy: 'SITA Standard' | 'SITA Fast' | 'SITA Faster' | 'Full Threshold' | 'FastPac';
    stimulusSize: 'III' | 'V';
    meanDeviation: number;
    patternStandardDeviation: number;
    visualFieldIndex: number;
    ghtResult: 'Within Normal Limits' | 'Borderline' | 'Outside Normal Limits' | 'Abnormally High Sensitivity' | 'General Reduction of Sensitivity';
    reliability: {
      fixationLosses: number;
      falsePositives: number;
      falseNegatives: number;
      testDuration: number;
    };
    defects: string[];
    reliable: boolean;
  };
  clinicalInterpretation?: string;
  notes?: string;
}

interface PerimetryFormProps {
  patientId: string;
  initialData?: Partial<PerimetryData> | null;
  onSave: (data: PerimetryData) => Promise<void>;
  readOnly?: boolean;
}

export default function PerimetryForm({
  patientId,
  initialData,
  onSave,
  readOnly = false,
}: PerimetryFormProps) {
  const [formData, setFormData] = useState<PerimetryData>({
    patientId,
    examinationDate: initialData?.examinationDate || new Date(),
    examinerId: initialData?.examinerId || '',
    device: initialData?.device || { manufacturer: 'Zeiss', model: 'Humphrey Field Analyzer 3' },
    testType: initialData?.testType || 'Humphrey',
    OD: initialData?.OD || {
      testPattern: '24-2',
      strategy: 'SITA Standard',
      stimulusSize: 'III',
      meanDeviation: 0,
      patternStandardDeviation: 0,
      visualFieldIndex: 100,
      ghtResult: 'Within Normal Limits',
      reliability: { fixationLosses: 0, falsePositives: 0, falseNegatives: 0, testDuration: 0 },
      defects: [],
      reliable: true,
    },
    OS: initialData?.OS || {
      testPattern: '24-2',
      strategy: 'SITA Standard',
      stimulusSize: 'III',
      meanDeviation: 0,
      patternStandardDeviation: 0,
      visualFieldIndex: 100,
      ghtResult: 'Within Normal Limits',
      reliability: { fixationLosses: 0, falsePositives: 0, falseNegatives: 0, testDuration: 0 },
      defects: [],
      reliable: true,
    },
    clinicalInterpretation: initialData?.clinicalInterpretation || '',
    notes: initialData?.notes || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const visualFieldDefects = [
    'No defect',
    'Generalized depression',
    'Nasal step',
    'Arcuate scotoma (superior)',
    'Arcuate scotoma (inferior)',
    'Paracentral scotoma',
    'Central scotoma',
    'Cecocentral scotoma',
    'Altitudinal defect (superior)',
    'Altitudinal defect (inferior)',
    'Temporal wedge',
    'Enlarged blind spot',
    'Hemianopia (homonymous)',
    'Hemianopia (bitemporal)',
    'Quadrantanopia',
    'Constriction (concentric)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save perimetry:', error);
      alert('Failed to save perimetry data');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDefect = (eye: 'OD' | 'OS', defect: string) => {
    setFormData(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        defects: prev[eye].defects.includes(defect)
          ? prev[eye].defects.filter(d => d !== defect)
          : [...prev[eye].defects, defect],
      },
    }));
  };

  const getMDInterpretation = (md: number) => {
    if (md >= -2) return { text: 'Normal', color: 'text-green-700 bg-green-100' };
    if (md >= -6) return { text: 'Early defect', color: 'text-yellow-700 bg-yellow-100' };
    if (md >= -12) return { text: 'Moderate defect', color: 'text-orange-700 bg-orange-100' };
    return { text: 'Severe defect', color: 'text-red-700 bg-red-100' };
  };

  const getPSDInterpretation = (psd: number) => {
    if (psd < 2) return { text: 'Normal', color: 'text-green-700 bg-green-100' };
    if (psd < 5) return { text: 'Borderline', color: 'text-yellow-700 bg-yellow-100' };
    return { text: 'Abnormal', color: 'text-red-700 bg-red-100' };
  };

  const getVFIInterpretation = (vfi: number) => {
    if (vfi >= 92) return { text: 'Normal', color: 'text-green-700 bg-green-100' };
    if (vfi >= 80) return { text: 'Early loss', color: 'text-yellow-700 bg-yellow-100' };
    if (vfi >= 60) return { text: 'Moderate loss', color: 'text-orange-700 bg-orange-100' };
    return { text: 'Severe loss', color: 'text-red-700 bg-red-100' };
  };

  const getGHTColor = (result: string) => {
    switch (result) {
      case 'Within Normal Limits': return 'text-green-700 bg-green-100';
      case 'Borderline': return 'text-yellow-700 bg-yellow-100';
      case 'Outside Normal Limits': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const checkReliability = (eye: 'OD' | 'OS') => {
    const rel = formData[eye].reliability;
    const reliable = rel.fixationLosses < 20 && rel.falsePositives < 15 && rel.falseNegatives < 33;
    setFormData(prev => ({
      ...prev,
      [eye]: { ...prev[eye], reliable },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      {/* Device Configuration */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Type
            </label>
            <select
              value={formData.testType}
              onChange={e => setFormData({ ...formData, testType: e.target.value as any })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>Humphrey</option>
              <option>Goldmann</option>
              <option>FDT</option>
              <option>Octopus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device
            </label>
            <select
              value={`${formData.device.manufacturer}|${formData.device.model}`}
              onChange={e => {
                const [manufacturer, model] = e.target.value.split('|');
                setFormData({ ...formData, device: { manufacturer, model } });
              }}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Zeiss|Humphrey Field Analyzer 3">Zeiss HFA3 (Humphrey)</option>
              <option value="Zeiss|Humphrey Field Analyzer II">Zeiss HFA II</option>
              <option value="Haag-Streit|Octopus 900">Haag-Streit Octopus 900</option>
              <option value="Zeiss|Humphrey Matrix">Zeiss Humphrey Matrix (FDT)</option>
              <option value="Metrovision|MonPack3">Metrovision MonPack3</option>
            </select>
          </div>
        </div>
      </div>

      {/* OD Testing */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Eye (OD)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Pattern
            </label>
            <select
              value={formData.OD.testPattern}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, testPattern: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>24-2</option>
              <option>30-2</option>
              <option>10-2</option>
              <option>60-4</option>
              <option>Macula</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strategy
            </label>
            <select
              value={formData.OD.strategy}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, strategy: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>SITA Standard</option>
              <option>SITA Fast</option>
              <option>SITA Faster</option>
              <option>Full Threshold</option>
              <option>FastPac</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stimulus Size
            </label>
            <select
              value={formData.OD.stimulusSize}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, stimulusSize: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>III</option>
              <option>V</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Duration (min)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.OD.reliability.testDuration}
              onChange={e => setFormData({
                ...formData,
                OD: {
                  ...formData.OD,
                  reliability: { ...formData.OD.reliability, testDuration: parseFloat(e.target.value) || 0 }
                }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Global Indices */}
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Global Indices - OD</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mean Deviation (MD) in dB
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OD.meanDeviation}
                onChange={e => setFormData({
                  ...formData,
                  OD: { ...formData.OD, meanDeviation: parseFloat(e.target.value) || 0 }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getMDInterpretation(formData.OD.meanDeviation).color}`}>
                {getMDInterpretation(formData.OD.meanDeviation).text}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pattern Standard Deviation (PSD) in dB
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OD.patternStandardDeviation}
                onChange={e => setFormData({
                  ...formData,
                  OD: { ...formData.OD, patternStandardDeviation: parseFloat(e.target.value) || 0 }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getPSDInterpretation(formData.OD.patternStandardDeviation).color}`}>
                {getPSDInterpretation(formData.OD.patternStandardDeviation).text}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visual Field Index (VFI) %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.OD.visualFieldIndex}
                onChange={e => setFormData({
                  ...formData,
                  OD: { ...formData.OD, visualFieldIndex: parseInt(e.target.value) || 0 }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getVFIInterpretation(formData.OD.visualFieldIndex).color}`}>
                {getVFIInterpretation(formData.OD.visualFieldIndex).text}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glaucoma Hemifield Test (GHT)
            </label>
            <select
              value={formData.OD.ghtResult}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, ghtResult: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Within Normal Limits</option>
              <option>Borderline</option>
              <option>Outside Normal Limits</option>
              <option>Abnormally High Sensitivity</option>
              <option>General Reduction of Sensitivity</option>
            </select>
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getGHTColor(formData.OD.ghtResult)}`}>
              {formData.OD.ghtResult}
            </span>
          </div>
        </div>

        {/* Reliability Indices */}
        <div className="bg-yellow-50 p-4 rounded mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Reliability Indices - OD</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixation Losses (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.OD.reliability.fixationLosses}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OD: {
                      ...formData.OD,
                      reliability: { ...formData.OD.reliability, fixationLosses: parseInt(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => checkReliability('OD'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-600 mt-1">Target: &lt;20%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                False Positives (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.OD.reliability.falsePositives}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OD: {
                      ...formData.OD,
                      reliability: { ...formData.OD.reliability, falsePositives: parseInt(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => checkReliability('OD'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-600 mt-1">Target: &lt;15%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                False Negatives (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.OD.reliability.falseNegatives}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OD: {
                      ...formData.OD,
                      reliability: { ...formData.OD.reliability, falseNegatives: parseInt(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => checkReliability('OD'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-600 mt-1">Target: &lt;33%</p>
            </div>
          </div>

          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded font-semibold ${formData.OD.reliable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Test {formData.OD.reliable ? 'RELIABLE' : 'UNRELIABLE'}
            </span>
          </div>
        </div>

        {/* Visual Field Defects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visual Field Defects - OD
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {visualFieldDefects.map(defect => (
              <label key={defect} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.OD.defects.includes(defect)}
                  onChange={() => toggleDefect('OD', defect)}
                  disabled={readOnly}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{defect}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* OS Testing */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Left Eye (OS)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Pattern
            </label>
            <select
              value={formData.OS.testPattern}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, testPattern: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>24-2</option>
              <option>30-2</option>
              <option>10-2</option>
              <option>60-4</option>
              <option>Macula</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strategy
            </label>
            <select
              value={formData.OS.strategy}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, strategy: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>SITA Standard</option>
              <option>SITA Fast</option>
              <option>SITA Faster</option>
              <option>Full Threshold</option>
              <option>FastPac</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stimulus Size
            </label>
            <select
              value={formData.OS.stimulusSize}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, stimulusSize: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>III</option>
              <option>V</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Duration (min)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.OS.reliability.testDuration}
              onChange={e => setFormData({
                ...formData,
                OS: {
                  ...formData.OS,
                  reliability: { ...formData.OS.reliability, testDuration: parseFloat(e.target.value) || 0 }
                }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Global Indices */}
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Global Indices - OS</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mean Deviation (MD) in dB
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OS.meanDeviation}
                onChange={e => setFormData({
                  ...formData,
                  OS: { ...formData.OS, meanDeviation: parseFloat(e.target.value) || 0 }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getMDInterpretation(formData.OS.meanDeviation).color}`}>
                {getMDInterpretation(formData.OS.meanDeviation).text}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pattern Standard Deviation (PSD) in dB
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OS.patternStandardDeviation}
                onChange={e => setFormData({
                  ...formData,
                  OS: { ...formData.OS, patternStandardDeviation: parseFloat(e.target.value) || 0 }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getPSDInterpretation(formData.OS.patternStandardDeviation).color}`}>
                {getPSDInterpretation(formData.OS.patternStandardDeviation).text}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visual Field Index (VFI) %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.OS.visualFieldIndex}
                onChange={e => setFormData({
                  ...formData,
                  OS: { ...formData.OS, visualFieldIndex: parseInt(e.target.value) || 0 }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getVFIInterpretation(formData.OS.visualFieldIndex).color}`}>
                {getVFIInterpretation(formData.OS.visualFieldIndex).text}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glaucoma Hemifield Test (GHT)
            </label>
            <select
              value={formData.OS.ghtResult}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, ghtResult: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Within Normal Limits</option>
              <option>Borderline</option>
              <option>Outside Normal Limits</option>
              <option>Abnormally High Sensitivity</option>
              <option>General Reduction of Sensitivity</option>
            </select>
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getGHTColor(formData.OS.ghtResult)}`}>
              {formData.OS.ghtResult}
            </span>
          </div>
        </div>

        {/* Reliability Indices */}
        <div className="bg-yellow-50 p-4 rounded mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Reliability Indices - OS</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixation Losses (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.OS.reliability.fixationLosses}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OS: {
                      ...formData.OS,
                      reliability: { ...formData.OS.reliability, fixationLosses: parseInt(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => checkReliability('OS'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-600 mt-1">Target: &lt;20%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                False Positives (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.OS.reliability.falsePositives}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OS: {
                      ...formData.OS,
                      reliability: { ...formData.OS.reliability, falsePositives: parseInt(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => checkReliability('OS'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-600 mt-1">Target: &lt;15%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                False Negatives (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.OS.reliability.falseNegatives}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OS: {
                      ...formData.OS,
                      reliability: { ...formData.OS.reliability, falseNegatives: parseInt(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => checkReliability('OS'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-600 mt-1">Target: &lt;33%</p>
            </div>
          </div>

          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded font-semibold ${formData.OS.reliable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Test {formData.OS.reliable ? 'RELIABLE' : 'UNRELIABLE'}
            </span>
          </div>
        </div>

        {/* Visual Field Defects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visual Field Defects - OS
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {visualFieldDefects.map(defect => (
              <label key={defect} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.OS.defects.includes(defect)}
                  onChange={() => toggleDefect('OS', defect)}
                  disabled={readOnly}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{defect}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Interpretation */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Clinical Interpretation
        </label>
        <textarea
          value={formData.clinicalInterpretation}
          onChange={e => setFormData({ ...formData, clinicalInterpretation: e.target.value })}
          disabled={readOnly}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Document progression analysis, correlation with optic nerve findings, treatment recommendations..."
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          disabled={readOnly}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Patient cooperation, test conditions, technical issues, etc."
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
            {isSaving ? 'Saving...' : 'Save Perimetry Results'}
          </button>
        </div>
      )}
    </form>
  );
}
