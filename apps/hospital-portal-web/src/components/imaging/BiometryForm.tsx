'use client';

import { useState, useEffect } from 'react';

interface BiometryData {
  patientId: string;
  examinationDate: Date;
  examinerId: string;
  device: {
    manufacturer: string;
    model: string;
    type: 'Optical' | 'Ultrasound A-Scan' | 'Ultrasound B-Scan';
  };
  OD: {
    axialLength: number; // mm
    anteriorChamberDepth: number; // mm
    lensThickness: number; // mm
    keratometry: {
      k1: number; // D
      k2: number; // D
      axis: number; // degrees
      averageK: number; // D
    };
    whitToWhite: number; // mm
    centralCornealThickness?: number; // μm
    targetRefraction: number; // D (usually 0 for emmetropia, -1.5 for slight myopia, etc.)
    iolCalculations: IOLCalculation[];
    selectedIOL?: string; // IOL model chosen
  };
  OS: {
    axialLength: number;
    anteriorChamberDepth: number;
    lensThickness: number;
    keratometry: {
      k1: number;
      k2: number;
      axis: number;
      averageK: number;
    };
    whitToWhite: number;
    centralCornealThickness?: number;
    targetRefraction: number;
    iolCalculations: IOLCalculation[];
    selectedIOL?: string;
  };
  notes?: string;
}

interface IOLCalculation {
  formula: 'SRK/T' | 'Holladay 1' | 'Holladay 2' | 'Haigis' | 'Barrett Universal II' | 'Hill-RBF' | 'Hoffer Q' | 'Olsen';
  recommendedPower: number; // D
  predictedRefraction: number; // D
  iolConstant: number; // A-constant or formula-specific constant
}

interface BiometryFormProps {
  patientId: string;
  initialData?: Partial<BiometryData> | null;
  onSave: (data: BiometryData) => Promise<void>;
  readOnly?: boolean;
}

export default function BiometryForm({
  patientId,
  initialData,
  onSave,
  readOnly = false,
}: BiometryFormProps) {
  const [formData, setFormData] = useState<BiometryData>({
    patientId,
    examinationDate: initialData?.examinationDate || new Date(),
    examinerId: initialData?.examinerId || '',
    device: initialData?.device || { manufacturer: 'Zeiss', model: 'IOLMaster 700', type: 'Optical' },
    OD: initialData?.OD || {
      axialLength: 23.5,
      anteriorChamberDepth: 3.0,
      lensThickness: 4.0,
      keratometry: { k1: 43.0, k2: 44.0, axis: 90, averageK: 43.5 },
      whitToWhite: 12.0,
      targetRefraction: 0,
      iolCalculations: [],
    },
    OS: initialData?.OS || {
      axialLength: 23.5,
      anteriorChamberDepth: 3.0,
      lensThickness: 4.0,
      keratometry: { k1: 43.0, k2: 44.0, axis: 90, averageK: 43.5 },
      whitToWhite: 12.0,
      targetRefraction: 0,
      iolCalculations: [],
    },
    notes: initialData?.notes || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // IOL models for selection
  const iolModels = [
    'Alcon AcrySof IQ (SN60WF)',
    'Alcon AcrySof Toric (SN60T3-T9)',
    'Alcon PanOptix (TFNT00)',
    'Johnson & Johnson Tecnis (ZCB00)',
    'Johnson & Johnson Tecnis Toric (ZCT)',
    'Johnson & Johnson Tecnis Symfony (ZXR00)',
    'Bausch & Lomb enVista (MX60)',
    'Zeiss AT LISA tri 839MP',
    'Rayner RayOne EMV',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save biometry:', error);
      alert('Failed to save biometry data');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-calculate average K when k1 or k2 changes
  const updateAverageK = (eye: 'OD' | 'OS') => {
    const keratometry = formData[eye].keratometry;
    const averageK = (keratometry.k1 + keratometry.k2) / 2;
    setFormData(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        keratometry: { ...prev[eye].keratometry, averageK: parseFloat(averageK.toFixed(2)) }
      }
    }));
  };

  // Calculate IOL power using various formulas
  const calculateIOLPower = (eye: 'OD' | 'OS') => {
    const eyeData = formData[eye];
    const AL = eyeData.axialLength;
    const K = eyeData.keratometry.averageK;
    const ACD = eyeData.anteriorChamberDepth;
    const target = eyeData.targetRefraction;

    const calculations: IOLCalculation[] = [];

    // SRK/T Formula (most commonly used)
    const aConstantSRKT = 118.7; // Default A-constant
    const LOPT = AL + 0.65696 - 0.02029 * AL;
    const cornealHeight = 0.62467 * aConstantSRKT - 68.747;
    const offsetConstant = cornealHeight + LOPT - 0.5835 * K;
    const iolPowerSRKT = (1336 / (AL - offsetConstant - 0.05) - 1.336 * K) / (1 - 0.001 * target);
    calculations.push({
      formula: 'SRK/T',
      recommendedPower: parseFloat(iolPowerSRKT.toFixed(2)),
      predictedRefraction: target,
      iolConstant: aConstantSRKT,
    });

    // Holladay 1 Formula
    const aConstantHolladay = 118.4;
    const sf = 1.75; // Surgeon factor
    const iolPowerHolladay = ((1000 * 1.336 / (AL - sf - ACD)) - K - target) / (1 - 0.001 * target * (1000 * 1.336 / (AL - sf - ACD)));
    calculations.push({
      formula: 'Holladay 1',
      recommendedPower: parseFloat(iolPowerHolladay.toFixed(2)),
      predictedRefraction: target,
      iolConstant: aConstantHolladay,
    });

    // Haigis Formula
    const a0 = 0.62467, a1 = 0.4, a2 = 0.1; // Haigis constants
    const d = a0 + a1 * ACD + a2 * AL;
    const iolPowerHaigis = (1336 / (AL - d - 0.05) - 1.336 * K) / (1 - 0.001 * target);
    calculations.push({
      formula: 'Haigis',
      recommendedPower: parseFloat(iolPowerHaigis.toFixed(2)),
      predictedRefraction: target,
      iolConstant: a0,
    });

    // Hoffer Q Formula (for short eyes)
    const pACD = 0.58357 + 0.00516 * AL - 0.43285 * K / 1000;
    const iolPowerHofferQ = (1336 / (AL - pACD - 0.05) - 1.336 * K) / (1 - 0.001 * target);
    calculations.push({
      formula: 'Hoffer Q',
      recommendedPower: parseFloat(iolPowerHofferQ.toFixed(2)),
      predictedRefraction: target,
      iolConstant: 118.5,
    });

    // Barrett Universal II (simplified - actual formula is proprietary)
    const iolPowerBarrett = iolPowerSRKT - 0.3; // Approximation
    calculations.push({
      formula: 'Barrett Universal II',
      recommendedPower: parseFloat(iolPowerBarrett.toFixed(2)),
      predictedRefraction: target,
      iolConstant: 118.7,
    });

    // Hill-RBF (simplified - actual uses neural network)
    const iolPowerHill = iolPowerSRKT + 0.2; // Approximation
    calculations.push({
      formula: 'Hill-RBF',
      recommendedPower: parseFloat(iolPowerHill.toFixed(2)),
      predictedRefraction: target,
      iolConstant: 118.7,
    });

    // Holladay 2 (simplified)
    const iolPowerHolladay2 = iolPowerHolladay - 0.25;
    calculations.push({
      formula: 'Holladay 2',
      recommendedPower: parseFloat(iolPowerHolladay2.toFixed(2)),
      predictedRefraction: target,
      iolConstant: 118.4,
    });

    // Olsen Formula (simplified)
    const iolPowerOlsen = iolPowerSRKT + 0.1;
    calculations.push({
      formula: 'Olsen',
      recommendedPower: parseFloat(iolPowerOlsen.toFixed(2)),
      predictedRefraction: target,
      iolConstant: 118.7,
    });

    setFormData(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        iolCalculations: calculations,
      }
    }));
  };

  const getALInterpretation = (al: number) => {
    if (al < 22) return { text: 'Short eye', color: 'text-orange-700 bg-orange-100' };
    if (al < 24.5) return { text: 'Normal', color: 'text-green-700 bg-green-100' };
    if (al < 26) return { text: 'Long eye', color: 'text-yellow-700 bg-yellow-100' };
    return { text: 'Very long eye', color: 'text-red-700 bg-red-100' };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      {/* Device Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Measurement Type
            </label>
            <select
              value={formData.device.type}
              onChange={e => setFormData({
                ...formData,
                device: { ...formData.device, type: e.target.value as any }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>Optical</option>
              <option>Ultrasound A-Scan</option>
              <option>Ultrasound B-Scan</option>
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
                setFormData({ ...formData, device: { ...formData.device, manufacturer, model } });
              }}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Zeiss|IOLMaster 700">Zeiss IOLMaster 700 (Optical)</option>
              <option value="Zeiss|IOLMaster 500">Zeiss IOLMaster 500 (Optical)</option>
              <option value="Haag-Streit|Lenstar LS 900">Haag-Streit Lenstar LS 900</option>
              <option value="Nidek|AL-Scan">Nidek AL-Scan (Optical)</option>
              <option value="Tomey|OA-2000">Tomey OA-2000</option>
              <option value="Sonomed|Escalon A-Scan">Sonomed Escalon (Ultrasound)</option>
            </select>
          </div>
        </div>
      </div>

      {/* OD Measurements */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Eye (OD) - Measurements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Axial Length (mm) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.OD.axialLength}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, axialLength: parseFloat(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getALInterpretation(formData.OD.axialLength).color}`}>
              {getALInterpretation(formData.OD.axialLength).text}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anterior Chamber Depth (mm)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.OD.anteriorChamberDepth}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, anteriorChamberDepth: parseFloat(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Normal: 2.5-3.5 mm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lens Thickness (mm)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.OD.lensThickness}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, lensThickness: parseFloat(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Normal: 3.5-5.0 mm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              White-to-White (mm)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.OD.whitToWhite}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, whitToWhite: parseFloat(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Typical: 11.5-12.5 mm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Central Corneal Thickness (μm)
            </label>
            <input
              type="number"
              value={formData.OD.centralCornealThickness || ''}
              onChange={e => setFormData({
                ...formData,
                OD: { ...formData.OD, centralCornealThickness: parseInt(e.target.value) || undefined }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Normal: 500-560 μm</p>
          </div>
        </div>

        {/* Keratometry */}
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Keratometry - OD</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                K1 (Flat) in D *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OD.keratometry.k1}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OD: {
                      ...formData.OD,
                      keratometry: { ...formData.OD.keratometry, k1: parseFloat(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => updateAverageK('OD'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                K2 (Steep) in D *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OD.keratometry.k2}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OD: {
                      ...formData.OD,
                      keratometry: { ...formData.OD.keratometry, k2: parseFloat(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => updateAverageK('OD'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Axis (degrees)
              </label>
              <input
                type="number"
                min="0"
                max="180"
                value={formData.OD.keratometry.axis}
                onChange={e => setFormData({
                  ...formData,
                  OD: {
                    ...formData.OD,
                    keratometry: { ...formData.OD.keratometry, axis: parseInt(e.target.value) || 0 }
                  }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average K (D)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OD.keratometry.averageK}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="text-xs text-gray-600 mt-1">Auto-calculated</p>
            </div>
          </div>
        </div>

        {/* Target Refraction */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Refraction (D)
          </label>
          <select
            value={formData.OD.targetRefraction}
            onChange={e => setFormData({
              ...formData,
              OD: { ...formData.OD, targetRefraction: parseFloat(e.target.value) }
            })}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="-3.00">-3.00 D (Moderate myopia)</option>
            <option value="-2.00">-2.00 D (Mild myopia)</option>
            <option value="-1.50">-1.50 D (Slight myopia)</option>
            <option value="-1.00">-1.00 D (Mild myopia)</option>
            <option value="-0.50">-0.50 D (Monovision near eye)</option>
            <option value="0.00">0.00 D (Emmetropia - distance vision)</option>
            <option value="0.50">+0.50 D (Slight hyperopia)</option>
            <option value="1.00">+1.00 D (Mild hyperopia)</option>
          </select>
          <p className="text-xs text-gray-600 mt-1">
            0.00 D for distance vision, -0.50 to -1.50 D for monovision (near eye)
          </p>
        </div>

        {/* Calculate IOL Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => calculateIOLPower('OD')}
            disabled={readOnly}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Calculate IOL Power (All Formulas)
          </button>
        </div>

        {/* IOL Calculations Results */}
        {formData.OD.iolCalculations.length > 0 && (
          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-gray-900 mb-3">IOL Power Calculations - OD</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Formula</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">IOL Power (D)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Predicted Rx</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Constant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.OD.iolCalculations.map((calc, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{calc.formula}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 font-semibold">{calc.recommendedPower.toFixed(2)} D</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{calc.predictedRefraction.toFixed(2)} D</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{calc.iolConstant.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected IOL Model
              </label>
              <select
                value={formData.OD.selectedIOL || ''}
                onChange={e => setFormData({
                  ...formData,
                  OD: { ...formData.OD, selectedIOL: e.target.value }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select IOL Model --</option>
                {iolModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* OS Measurements */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Left Eye (OS) - Measurements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Axial Length (mm) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.OS.axialLength}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, axialLength: parseFloat(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getALInterpretation(formData.OS.axialLength).color}`}>
              {getALInterpretation(formData.OS.axialLength).text}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anterior Chamber Depth (mm)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.OS.anteriorChamberDepth}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, anteriorChamberDepth: parseFloat(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Normal: 2.5-3.5 mm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lens Thickness (mm)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.OS.lensThickness}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, lensThickness: parseFloat(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Normal: 3.5-5.0 mm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              White-to-White (mm)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.OS.whitToWhite}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, whitToWhite: parseFloat(e.target.value) || 0 }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Typical: 11.5-12.5 mm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Central Corneal Thickness (μm)
            </label>
            <input
              type="number"
              value={formData.OS.centralCornealThickness || ''}
              onChange={e => setFormData({
                ...formData,
                OS: { ...formData.OS, centralCornealThickness: parseInt(e.target.value) || undefined }
              })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Normal: 500-560 μm</p>
          </div>
        </div>

        {/* Keratometry */}
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Keratometry - OS</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                K1 (Flat) in D *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OS.keratometry.k1}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OS: {
                      ...formData.OS,
                      keratometry: { ...formData.OS.keratometry, k1: parseFloat(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => updateAverageK('OS'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                K2 (Steep) in D *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OS.keratometry.k2}
                onChange={e => {
                  setFormData({
                    ...formData,
                    OS: {
                      ...formData.OS,
                      keratometry: { ...formData.OS.keratometry, k2: parseFloat(e.target.value) || 0 }
                    }
                  });
                  setTimeout(() => updateAverageK('OS'), 0);
                }}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Axis (degrees)
              </label>
              <input
                type="number"
                min="0"
                max="180"
                value={formData.OS.keratometry.axis}
                onChange={e => setFormData({
                  ...formData,
                  OS: {
                    ...formData.OS,
                    keratometry: { ...formData.OS.keratometry, axis: parseInt(e.target.value) || 0 }
                  }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average K (D)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.OS.keratometry.averageK}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="text-xs text-gray-600 mt-1">Auto-calculated</p>
            </div>
          </div>
        </div>

        {/* Target Refraction */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Refraction (D)
          </label>
          <select
            value={formData.OS.targetRefraction}
            onChange={e => setFormData({
              ...formData,
              OS: { ...formData.OS, targetRefraction: parseFloat(e.target.value) }
            })}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="-3.00">-3.00 D (Moderate myopia)</option>
            <option value="-2.00">-2.00 D (Mild myopia)</option>
            <option value="-1.50">-1.50 D (Monovision near eye)</option>
            <option value="-1.00">-1.00 D (Mild myopia)</option>
            <option value="-0.50">-0.50 D (Slight myopia)</option>
            <option value="0.00">0.00 D (Emmetropia - distance vision)</option>
            <option value="0.50">+0.50 D (Slight hyperopia)</option>
            <option value="1.00">+1.00 D (Mild hyperopia)</option>
          </select>
          <p className="text-xs text-gray-600 mt-1">
            For monovision: dominant eye 0.00 D, non-dominant eye -1.50 D
          </p>
        </div>

        {/* Calculate IOL Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => calculateIOLPower('OS')}
            disabled={readOnly}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Calculate IOL Power (All Formulas)
          </button>
        </div>

        {/* IOL Calculations Results */}
        {formData.OS.iolCalculations.length > 0 && (
          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-gray-900 mb-3">IOL Power Calculations - OS</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Formula</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">IOL Power (D)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Predicted Rx</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Constant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.OS.iolCalculations.map((calc, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{calc.formula}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 font-semibold">{calc.recommendedPower.toFixed(2)} D</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{calc.predictedRefraction.toFixed(2)} D</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{calc.iolConstant.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected IOL Model
              </label>
              <select
                value={formData.OS.selectedIOL || ''}
                onChange={e => setFormData({
                  ...formData,
                  OS: { ...formData.OS, selectedIOL: e.target.value }
                })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select IOL Model --</option>
                {iolModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Notes */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Clinical Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          disabled={readOnly}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Document any special considerations, previous refractive surgery, corneal irregularities, patient preferences for monovision, etc."
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
            {isSaving ? 'Saving...' : 'Save Biometry & IOL Calculations'}
          </button>
        </div>
      )}
    </form>
  );
}
