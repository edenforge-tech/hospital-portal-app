'use client';

import React, { useState } from 'react';
import {
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Layers,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface TopographyData {
  keratometry: {
    K1: number;
    K2: number;
    axis: number;
    Kavg: number;
    astigmatism: number;
  };
  pachymetry: {
    central: number;
    thinnest: number;
    thinnestLocation: string;
  };
  elevation: {
    anterior: number;
    posterior: number;
  };
  keratoconusIndices: {
    KI: number; // Keratoconus Index
    CKI: number; // Central Keratoconus Index
    IHA: number; // Index of Height Asymmetry
    IHD: number; // Index of Height Decentration
  };
  bfsScore: number; // Best Fit Sphere
  screening: {
    keratoconusRisk: 'Normal' | 'Suspect' | 'Mild' | 'Moderate' | 'Severe';
    confidence: number; // 0-100%
  };
}

interface TopographyAnalysisProps {
  patientId: string;
  odData?: any;
  osData?: any;
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

export default function TopographyAnalysis({
  patientId,
  odData,
  osData,
  onSave,
  canEdit = true,
}: TopographyAnalysisProps) {
  const [activeEye, setActiveEye] = useState<'OD' | 'OS'>('OD');
  const [device, setDevice] = useState('Pentacam HR');
  const [measurementDate, setMeasurementDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Mock topography data - In production, fetch from device or database
  const [topographyOD, setTopographyOD] = useState<TopographyData>({
    keratometry: {
      K1: 48.5,
      K2: 52.3,
      axis: 85,
      Kavg: 50.4,
      astigmatism: 3.8,
    },
    pachymetry: {
      central: 465,
      thinnest: 452,
      thinnestLocation: '2.5mm inferotemporal',
    },
    elevation: {
      anterior: 12,
      posterior: 28,
    },
    keratoconusIndices: {
      KI: 1.18,
      CKI: 1.09,
      IHA: 18.5,
      IHD: 0.058,
    },
    bfsScore: 52.3,
    screening: {
      keratoconusRisk: 'Moderate',
      confidence: 87,
    },
  });

  const [topographyOS, setTopographyOS] = useState<TopographyData>({
    keratometry: {
      K1: 47.8,
      K2: 51.5,
      axis: 88,
      Kavg: 49.65,
      astigmatism: 3.7,
    },
    pachymetry: {
      central: 478,
      thinnest: 468,
      thinnestLocation: '2.1mm inferotemporal',
    },
    elevation: {
      anterior: 8,
      posterior: 18,
    },
    keratoconusIndices: {
      KI: 1.12,
      CKI: 1.05,
      IHA: 14.2,
      IHD: 0.042,
    },
    bfsScore: 51.1,
    screening: {
      keratoconusRisk: 'Mild',
      confidence: 78,
    },
  });

  const currentData = activeEye === 'OD' ? topographyOD : topographyOS;

  // Keratoconus risk assessment based on indices
  const assessKeratoconusRisk = (data: TopographyData): {
    level: string;
    color: string;
    recommendation: string;
  } => {
    const { KI, CKI, IHA } = data.keratoconusIndices;
    const { thinnest } = data.pachymetry;
    const { Kavg } = data.keratometry;

    // Amsler-Krumeich Classification
    if (Kavg > 55 || thinnest < 400) {
      return {
        level: 'Severe (Stage 4)',
        color: 'text-red-700 bg-red-50 border-red-300',
        recommendation: 'Consider keratoplasty (PKP/DALK). Cross-linking contraindicated.',
      };
    } else if (Kavg > 53 || thinnest < 450) {
      return {
        level: 'Advanced (Stage 3)',
        color: 'text-orange-700 bg-orange-50 border-orange-300',
        recommendation: 'Cross-linking may slow progression. Monitor closely.',
      };
    } else if ((Kavg > 48 && KI > 1.15) || (thinnest < 500 && IHA > 15)) {
      return {
        level: 'Moderate (Stage 2)',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-300',
        recommendation: 'Corneal cross-linking strongly recommended. Avoid eye rubbing.',
      };
    } else if (KI > 1.07 || CKI > 1.03 || IHA > 10) {
      return {
        level: 'Mild/Suspect (Stage 1)',
        color: 'text-blue-700 bg-blue-50 border-blue-300',
        recommendation: 'Monitor every 6 months. Consider cross-linking if progression detected.',
      };
    } else {
      return {
        level: 'Normal',
        color: 'text-green-700 bg-green-50 border-green-300',
        recommendation: 'No keratoconus detected. Routine follow-up.',
      };
    }
  };

  const riskAssessment = assessKeratoconusRisk(currentData);

  const handleDeviceImport = () => {
    alert(`Device integration for ${device} is planned for Phase 2. Currently using mock data.`);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ OD: topographyOD, OS: topographyOS, device, measurementDate });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Device Selection */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Corneal Topography Analysis</h3>
          <p className="text-sm text-gray-600">
            Keratoconus screening and corneal curvature analysis
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={device}
            onChange={(e) => setDevice(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option>Pentacam HR</option>
            <option>Orbscan II</option>
            <option>TMS-4</option>
            <option>Galilei G6</option>
          </select>
          <button
            onClick={handleDeviceImport}
            disabled={!canEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>Import from Device</span>
          </button>
        </div>
      </div>

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

      {/* Keratoconus Risk Assessment */}
      <div className={`p-4 rounded-lg border-2 ${riskAssessment.color}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-lg font-bold">Keratoconus Risk Assessment</h4>
            </div>
            <p className="text-2xl font-bold mb-2">{riskAssessment.level}</p>
            <p className="text-sm">{riskAssessment.recommendation}</p>
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Confidence:</span>
                <div className="flex-1 bg-white bg-opacity-50 rounded-full h-3 max-w-xs">
                  <div
                    className="bg-current h-3 rounded-full transition-all"
                    style={{ width: `${currentData.screening.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{currentData.screening.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keratometry Data */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <span>Keratometry (Corneal Curvature)</span>
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">K1 (Flattest)</p>
            <p className="text-3xl font-bold text-blue-900">
              {currentData.keratometry.K1.toFixed(2)} D
            </p>
            <p className="text-xs text-gray-600 mt-1">@ {currentData.keratometry.axis}°</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">K2 (Steepest)</p>
            <p className="text-3xl font-bold text-blue-900">
              {currentData.keratometry.K2.toFixed(2)} D
            </p>
            <p className="text-xs text-gray-600 mt-1">@ {(currentData.keratometry.axis + 90) % 180}°</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">K Average</p>
            <p className="text-3xl font-bold text-purple-900">
              {currentData.keratometry.Kavg.toFixed(2)} D
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Astigmatism</p>
            <p className="text-3xl font-bold text-orange-900">
              {currentData.keratometry.astigmatism.toFixed(2)} D
            </p>
            {currentData.keratometry.astigmatism > 3.0 && (
              <p className="text-xs text-orange-700 mt-1">⚠️ Irregular astigmatism</p>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg col-span-2">
            <p className="text-sm text-gray-600 mb-1">BFS (Best Fit Sphere)</p>
            <p className="text-3xl font-bold text-green-900">
              {currentData.bfsScore.toFixed(2)} D
            </p>
            <p className="text-xs text-gray-600 mt-1">Reference sphere for elevation maps</p>
          </div>
        </div>
      </div>

      {/* Pachymetry Data */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>Pachymetry (Corneal Thickness)</span>
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-lg ${
              currentData.pachymetry.central < 500 ? 'bg-orange-50' : 'bg-green-50'
            }`}
          >
            <p className="text-sm text-gray-600 mb-1">Central Thickness</p>
            <p
              className={`text-3xl font-bold ${
                currentData.pachymetry.central < 500 ? 'text-orange-900' : 'text-green-900'
              }`}
            >
              {currentData.pachymetry.central} μm
            </p>
            <p className="text-xs text-gray-600 mt-1">Normal: 520-560 μm</p>
          </div>

          <div
            className={`p-4 rounded-lg ${
              currentData.pachymetry.thinnest < 450 ? 'bg-red-50' : 'bg-green-50'
            }`}
          >
            <p className="text-sm text-gray-600 mb-1">Thinnest Point</p>
            <p
              className={`text-3xl font-bold ${
                currentData.pachymetry.thinnest < 450 ? 'text-red-900' : 'text-green-900'
              }`}
            >
              {currentData.pachymetry.thinnest} μm
            </p>
            {currentData.pachymetry.thinnest < 450 && (
              <p className="text-xs text-red-700 mt-1">⚠️ Critically thin</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Thinnest Location</p>
            <p className="text-lg font-bold text-blue-900 mt-2">
              {currentData.pachymetry.thinnestLocation}
            </p>
            {currentData.pachymetry.thinnestLocation.includes('inferotemporal') && (
              <p className="text-xs text-blue-700 mt-1">📍 Typical keratoconus pattern</p>
            )}
          </div>
        </div>
      </div>

      {/* Elevation Data */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Corneal Elevation Maps</h4>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg ${
              currentData.elevation.anterior > 10 ? 'bg-orange-50' : 'bg-green-50'
            }`}
          >
            <p className="text-sm text-gray-600 mb-1">Anterior Elevation (BFS)</p>
            <p
              className={`text-3xl font-bold ${
                currentData.elevation.anterior > 10 ? 'text-orange-900' : 'text-green-900'
              }`}
            >
              +{currentData.elevation.anterior} μm
            </p>
            {currentData.elevation.anterior > 10 && (
              <p className="text-xs text-orange-700 mt-1">⚠️ Abnormal elevation</p>
            )}
          </div>

          <div
            className={`p-4 rounded-lg ${
              currentData.elevation.posterior > 20 ? 'bg-red-50' : 'bg-green-50'
            }`}
          >
            <p className="text-sm text-gray-600 mb-1">Posterior Elevation (BFS)</p>
            <p
              className={`text-3xl font-bold ${
                currentData.elevation.posterior > 20 ? 'text-red-900' : 'text-green-900'
              }`}
            >
              +{currentData.elevation.posterior} μm
            </p>
            {currentData.elevation.posterior > 20 && (
              <p className="text-xs text-red-700 mt-1">
                🚨 Ectasia suspected (posterior elevation most sensitive)
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Clinical Note:</strong> Posterior elevation is most sensitive for early
            keratoconus detection. Elevation &gt;20μm is highly suggestive of ectasia.
          </p>
        </div>
      </div>

      {/* Keratoconus Indices (ABCD Grading) */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          Keratoconus Indices (Automated Screening)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${currentData.keratoconusIndices.KI > 1.07 ? 'bg-orange-50' : 'bg-green-50'}`}>
            <p className="text-sm text-gray-600 mb-1">KI (Keratoconus Index)</p>
            <p
              className={`text-3xl font-bold ${
                currentData.keratoconusIndices.KI > 1.07 ? 'text-orange-900' : 'text-green-900'
              }`}
            >
              {currentData.keratoconusIndices.KI.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Normal: &lt;1.07</p>
            {currentData.keratoconusIndices.KI > 1.07 && (
              <p className="text-xs text-orange-700">⚠️ Abnormal - suspect keratoconus</p>
            )}
          </div>

          <div className={`p-4 rounded-lg ${currentData.keratoconusIndices.CKI > 1.03 ? 'bg-orange-50' : 'bg-green-50'}`}>
            <p className="text-sm text-gray-600 mb-1">CKI (Central Keratoconus Index)</p>
            <p
              className={`text-3xl font-bold ${
                currentData.keratoconusIndices.CKI > 1.03 ? 'text-orange-900' : 'text-green-900'
              }`}
            >
              {currentData.keratoconusIndices.CKI.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Normal: &lt;1.03</p>
          </div>

          <div className={`p-4 rounded-lg ${currentData.keratoconusIndices.IHA > 10 ? 'bg-orange-50' : 'bg-green-50'}`}>
            <p className="text-sm text-gray-600 mb-1">IHA (Index of Height Asymmetry)</p>
            <p
              className={`text-3xl font-bold ${
                currentData.keratoconusIndices.IHA > 10 ? 'text-orange-900' : 'text-green-900'
              }`}
            >
              {currentData.keratoconusIndices.IHA.toFixed(1)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Normal: &lt;10</p>
          </div>

          <div className={`p-4 rounded-lg ${currentData.keratoconusIndices.IHD > 0.04 ? 'bg-orange-50' : 'bg-green-50'}`}>
            <p className="text-sm text-gray-600 mb-1">IHD (Index of Height Decentration)</p>
            <p
              className={`text-3xl font-bold ${
                currentData.keratoconusIndices.IHD > 0.04 ? 'text-orange-900' : 'text-green-900'
              }`}
            >
              {currentData.keratoconusIndices.IHD.toFixed(3)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Normal: &lt;0.04</p>
          </div>
        </div>

        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <h5 className="font-semibold text-purple-900 mb-2">ABCD Grading System</h5>
          <p className="text-sm text-purple-800">
            <strong>A</strong>nterior elevation, <strong>B</strong>ack (posterior) elevation,{' '}
            <strong>C</strong>orneal thickness (thinnest), <strong>D</strong>istance visual acuity
          </p>
          <p className="text-xs text-purple-700 mt-2">
            📚 Modern keratoconus staging replacing Amsler-Krumeich classification
          </p>
        </div>
      </div>

      {/* Clinical Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-3">Clinical Recommendations</h4>
        <div className="space-y-2">
          {currentData.screening.keratoconusRisk !== 'Normal' && (
            <>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-gray-800">
                  <strong>Follow-up:</strong> Repeat topography every 6 months to monitor
                  progression
                </p>
              </div>
              {(currentData.screening.keratoconusRisk === 'Moderate' ||
                currentData.screening.keratoconusRisk === 'Mild') &&
                currentData.pachymetry.thinnest >= 400 && (
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <p className="text-sm text-gray-800">
                      <strong>Treatment:</strong> Corneal cross-linking (CXL) to halt progression
                    </p>
                  </div>
                )}
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-gray-800">
                  <strong>Patient Education:</strong> Avoid eye rubbing - major risk factor for
                  progression
                </p>
              </div>
              {currentData.keratometry.astigmatism > 3.0 && (
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                  <p className="text-sm text-gray-800">
                    <strong>Refractive Management:</strong> Consider RGP contact lenses or scleral
                    lenses
                  </p>
                </div>
              )}
            </>
          )}
          {currentData.screening.keratoconusRisk === 'Normal' && (
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-800">
                <strong>Routine Follow-up:</strong> Annual topography screening recommended
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Measurement Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600">Measurement Date</p>
          <p className="font-semibold text-gray-900">{measurementDate}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600">Device</p>
          <p className="font-semibold text-gray-900">{device}</p>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Save Topography Analysis</span>
          </button>
        </div>
      )}
    </div>
  );
}
