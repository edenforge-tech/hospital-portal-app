'use client';

import React, { useState } from 'react';
import { Eye, AlertTriangle, CheckCircle, TrendingUp, Info, Upload, RefreshCw } from 'lucide-react';

interface BiometryMeasurement {
  AL: number;  // Axial Length (mm)
  K1: number;  // Flattest K (D)
  K2: number;  // Steepest K (D)
  ACD: number; // Anterior Chamber Depth (mm)
  LT: number;  // Lens Thickness (mm)
  WTW: number; // White-to-White (mm)
  pupilSize: number; // Pupil diameter (mm)
}

interface BiometryData {
  OD: BiometryMeasurement;
  OS: BiometryMeasurement;
  device: string;
  measurementDate: string;
  measurementQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  snr: number; // Signal-to-Noise Ratio
  technician: string;
  notes: string;
}

interface BiometryIntegrationProps {
  initialData?: BiometryData;
  onSave?: (data: BiometryData) => void;
  canEdit?: boolean;
}

export default function BiometryIntegration({
  initialData,
  onSave,
  canEdit = true,
}: BiometryIntegrationProps) {
  const [biometryData, setBiometryData] = useState<BiometryData>(
    initialData || {
      OD: { AL: 23.5, K1: 43.0, K2: 44.0, ACD: 3.2, LT: 4.5, WTW: 12.0, pupilSize: 3.0 },
      OS: { AL: 23.5, K1: 43.0, K2: 44.0, ACD: 3.2, LT: 4.5, WTW: 12.0, pupilSize: 3.0 },
      device: 'IOLMaster 700',
      measurementDate: new Date().toISOString().split('T')[0],
      measurementQuality: 'Good',
      snr: 85,
      technician: 'Current User',
      notes: '',
    }
  );

  const [activeEye, setActiveEye] = useState<'OD' | 'OS'>('OD');
  const [showDeviceIntegration, setShowDeviceIntegration] = useState(false);

  // Update biometry value
  const updateBiometry = (
    eye: 'OD' | 'OS',
    parameter: keyof BiometryMeasurement,
    value: number
  ) => {
    setBiometryData((prev) => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [parameter]: value,
      },
    }));
  };

  // Calculate derived parameters
  const calculateKAvg = (K1: number, K2: number): number => {
    return (K1 + K2) / 2;
  };

  const calculateAstigmatism = (K1: number, K2: number): number => {
    return Math.abs(K2 - K1);
  };

  const calculateKAxis = (K1: number, K2: number): number => {
    // Simplified - in real app would need actual K axis from device
    return K1 < K2 ? 180 : 90;
  };

  // Validation warnings
  const getValidationWarnings = (): Array<{ type: string; message: string }> => {
    const warnings = [];

    // AL difference between eyes
    const alDiff = Math.abs(biometryData.OD.AL - biometryData.OS.AL);
    if (alDiff > 0.3) {
      warnings.push({
        type: 'error',
        message: `Large AL difference between eyes (${alDiff.toFixed(2)}mm). Verify measurements - possible error.`,
      });
    }

    // Very short eyes
    if (biometryData.OD.AL < 20 || biometryData.OS.AL < 20) {
      warnings.push({
        type: 'warning',
        message: 'Very short eye detected (AL <20mm). Use Hoffer Q or Barrett formula for IOL calculation.',
      });
    }

    // Very long eyes
    if (biometryData.OD.AL > 28 || biometryData.OS.AL > 28) {
      warnings.push({
        type: 'warning',
        message: 'Very long eye detected (AL >28mm). Use Barrett Universal II formula for IOL calculation.',
      });
    }

    // High K readings
    if (biometryData.OD.K2 > 48 || biometryData.OS.K2 > 48) {
      warnings.push({
        type: 'warning',
        message: 'High keratometry detected (K >48D). Check for keratoconus or measurement error.',
      });
    }

    // Low K readings (possible post-refractive surgery)
    if (biometryData.OD.K1 < 40 || biometryData.OS.K1 < 40) {
      warnings.push({
        type: 'warning',
        message: 'Low keratometry detected (K <40D). History of LASIK/PRK? Use post-refractive IOL formulas.',
      });
    }

    // Poor measurement quality
    if (biometryData.measurementQuality === 'Poor' || biometryData.snr < 50) {
      warnings.push({
        type: 'error',
        message: 'Poor measurement quality (SNR <50). Repeat biometry for accurate IOL calculation.',
      });
    }

    return warnings;
  };

  const handleSave = () => {
    if (onSave) {
      onSave(biometryData);
    }
  };

  const handleDeviceImport = (device: string) => {
    // Placeholder for device integration
    alert(`Device integration for ${device} is planned for Phase 2. Currently using manual entry.`);
    setShowDeviceIntegration(false);
  };

  const warnings = getValidationWarnings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Biometry Measurements</h3>
          <p className="text-sm text-gray-600">
            Optical biometry for accurate IOL power calculation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDeviceIntegration(!showDeviceIntegration)}
            disabled={!canEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>Import from Device</span>
          </button>
        </div>
      </div>

      {/* Device Integration Panel */}
      {showDeviceIntegration && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Select Biometry Device</h4>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleDeviceImport('IOLMaster 700')}
              className="p-4 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <p className="font-semibold text-blue-900">IOLMaster 700</p>
              <p className="text-xs text-blue-700">Zeiss SSOCT</p>
            </button>
            <button
              onClick={() => handleDeviceImport('Lenstar LS900')}
              className="p-4 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <p className="font-semibold text-blue-900">Lenstar LS900</p>
              <p className="text-xs text-blue-700">Haag-Streit</p>
            </button>
            <button
              onClick={() => handleDeviceImport('A-Scan Ultrasound')}
              className="p-4 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <p className="font-semibold text-blue-900">A-Scan</p>
              <p className="text-xs text-blue-700">Ultrasound</p>
            </button>
          </div>
          <p className="text-xs text-blue-700 mt-3">
            💡 Phase 2: Direct integration with biometry devices via HL7/DICOM
          </p>
        </div>
      )}

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 flex items-start space-x-2 ${
                warning.type === 'error'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-orange-50 border-orange-300'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 mt-0.5 ${
                  warning.type === 'error' ? 'text-red-600' : 'text-orange-600'
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  warning.type === 'error' ? 'text-red-900' : 'text-orange-900'
                }`}
              >
                {warning.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Eye Selection Toggle */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveEye('OD')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeEye === 'OD'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>OD (Right Eye)</span>
          </div>
        </button>
        <button
          onClick={() => setActiveEye('OS')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeEye === 'OS'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>OS (Left Eye)</span>
          </div>
        </button>
      </div>

      {/* Biometry Data Entry Form */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          {activeEye === 'OD' ? 'OD (Right Eye)' : 'OS (Left Eye)'} Measurements
        </h4>

        <div className="grid grid-cols-2 gap-6">
          {/* Axial Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Axial Length (AL)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.01"
                value={biometryData[activeEye].AL}
                onChange={(e) => updateBiometry(activeEye, 'AL', parseFloat(e.target.value) || 0)}
                disabled={!canEdit}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
              <span className="text-gray-600 font-medium">mm</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Normal: 22.5 - 24.5 mm</p>
          </div>

          {/* K1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              K1 (Flattest K)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.25"
                value={biometryData[activeEye].K1}
                onChange={(e) => updateBiometry(activeEye, 'K1', parseFloat(e.target.value) || 0)}
                disabled={!canEdit}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
              <span className="text-gray-600 font-medium">D</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Normal: 41 - 46 D</p>
          </div>

          {/* K2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              K2 (Steepest K)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.25"
                value={biometryData[activeEye].K2}
                onChange={(e) => updateBiometry(activeEye, 'K2', parseFloat(e.target.value) || 0)}
                disabled={!canEdit}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
              <span className="text-gray-600 font-medium">D</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Should be ≥ K1</p>
          </div>

          {/* ACD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anterior Chamber Depth (ACD)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.01"
                value={biometryData[activeEye].ACD}
                onChange={(e) => updateBiometry(activeEye, 'ACD', parseFloat(e.target.value) || 0)}
                disabled={!canEdit}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
              <span className="text-gray-600 font-medium">mm</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Normal: 2.5 - 3.5 mm</p>
          </div>

          {/* Lens Thickness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lens Thickness (LT)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.01"
                value={biometryData[activeEye].LT}
                onChange={(e) => updateBiometry(activeEye, 'LT', parseFloat(e.target.value) || 0)}
                disabled={!canEdit}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
              <span className="text-gray-600 font-medium">mm</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Normal: 3.5 - 5.0 mm</p>
          </div>

          {/* White-to-White */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              White-to-White (WTW)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                value={biometryData[activeEye].WTW}
                onChange={(e) => updateBiometry(activeEye, 'WTW', parseFloat(e.target.value) || 0)}
                disabled={!canEdit}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
              <span className="text-gray-600 font-medium">mm</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Normal: 11.0 - 13.0 mm</p>
          </div>

          {/* Pupil Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pupil Size</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                value={biometryData[activeEye].pupilSize}
                onChange={(e) =>
                  updateBiometry(activeEye, 'pupilSize', parseFloat(e.target.value) || 0)
                }
                disabled={!canEdit}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
              <span className="text-gray-600 font-medium">mm</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Mesopic measurement</p>
          </div>
        </div>
      </div>

      {/* Calculated Parameters */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Calculated Parameters - Both Eyes</h4>
        <div className="grid grid-cols-2 gap-6">
          {/* OD Calculations */}
          <div className="space-y-3">
            <p className="font-semibold text-blue-900 flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>OD (Right Eye)</span>
            </p>
            <div className="space-y-2 bg-white p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">K Average:</span>
                <span className="font-bold">
                  {calculateKAvg(biometryData.OD.K1, biometryData.OD.K2).toFixed(2)} D
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Corneal Astigmatism:</span>
                <span className="font-bold">
                  {calculateAstigmatism(biometryData.OD.K1, biometryData.OD.K2).toFixed(2)} D
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Axis:</span>
                <span className="font-bold">{calculateKAxis(biometryData.OD.K1, biometryData.OD.K2)}°</span>
              </div>
            </div>
          </div>

          {/* OS Calculations */}
          <div className="space-y-3">
            <p className="font-semibold text-green-900 flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>OS (Left Eye)</span>
            </p>
            <div className="space-y-2 bg-white p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">K Average:</span>
                <span className="font-bold">
                  {calculateKAvg(biometryData.OS.K1, biometryData.OS.K2).toFixed(2)} D
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Corneal Astigmatism:</span>
                <span className="font-bold">
                  {calculateAstigmatism(biometryData.OS.K1, biometryData.OS.K2).toFixed(2)} D
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Axis:</span>
                <span className="font-bold">{calculateKAxis(biometryData.OS.K1, biometryData.OS.K2)}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* AL Comparison */}
        <div className="mt-4 bg-white p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">AL Difference (OD vs OS):</span>
            <span
              className={`font-bold ${
                Math.abs(biometryData.OD.AL - biometryData.OS.AL) > 0.3
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {Math.abs(biometryData.OD.AL - biometryData.OS.AL).toFixed(2)} mm
            </span>
          </div>
          {Math.abs(biometryData.OD.AL - biometryData.OS.AL) <= 0.3 && (
            <p className="text-xs text-green-700 mt-1">✓ Within normal range (&lt;0.3mm)</p>
          )}
        </div>
      </div>

      {/* Measurement Quality */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Device Used</label>
          <select
            value={biometryData.device}
            onChange={(e) => setBiometryData((prev) => ({ ...prev, device: e.target.value }))}
            disabled={!canEdit}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option>IOLMaster 700</option>
            <option>IOLMaster 500</option>
            <option>Lenstar LS900</option>
            <option>A-Scan Ultrasound</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Measurement Quality
          </label>
          <select
            value={biometryData.measurementQuality}
            onChange={(e) =>
              setBiometryData((prev) => ({
                ...prev,
                measurementQuality: e.target.value as any,
              }))
            }
            disabled={!canEdit}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SNR (Signal-to-Noise)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={biometryData.snr}
              onChange={(e) =>
                setBiometryData((prev) => ({ ...prev, snr: parseInt(e.target.value) || 0 }))
              }
              disabled={!canEdit}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
            <span
              className={`font-bold ${
                biometryData.snr >= 80
                  ? 'text-green-600'
                  : biometryData.snr >= 50
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {biometryData.snr >= 80 ? '✓' : biometryData.snr >= 50 ? '⚠' : '✗'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Good: &gt;80, Acceptable: 50-80</p>
        </div>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes</label>
        <textarea
          value={biometryData.notes}
          onChange={(e) => setBiometryData((prev) => ({ ...prev, notes: e.target.value }))}
          disabled={!canEdit}
          rows={3}
          placeholder="Additional notes (e.g., measurement difficulties, patient cooperation, media opacity affecting measurements, etc.)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      {/* Measurement Information */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600">Measurement Date</p>
          <p className="font-semibold text-gray-900">{biometryData.measurementDate}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600">Technician</p>
          <p className="font-semibold text-gray-900">{biometryData.technician}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600">Device</p>
          <p className="font-semibold text-gray-900">{biometryData.device}</p>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Save Biometry Data</span>
          </button>
        </div>
      )}
    </div>
  );
}
