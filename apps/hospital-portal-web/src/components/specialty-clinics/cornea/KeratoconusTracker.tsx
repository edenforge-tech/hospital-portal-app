'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
  Zap,
} from 'lucide-react';

interface ProgressionData {
  date: string;
  Kavg: number;
  pachymetry: number;
  stage: string;
  notes: string;
}

interface CrossLinkingData {
  performed: boolean;
  date: string;
  protocol: string; // Dresden, Accelerated, Epi-on, Trans-epithelial
  energyDensity: number; // J/cm²
  uvaPower: number; // mW/cm²
  exposureTime: number; // minutes
  complications: string;
  outcome: string;
}

interface KeratoconusTrackerProps {
  patientId: string;
  currentStage: string;
  odPachymetry: number;
  osPachymetry: number;
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

export default function KeratoconusTracker({
  patientId,
  currentStage,
  odPachymetry,
  osPachymetry,
  onSave,
  canEdit = true,
}: KeratoconusTrackerProps) {
  const [activeEye, setActiveEye] = useState<'OD' | 'OS'>('OD');

  // Mock progression data - in production, fetch from database
  const [progressionHistoryOD, setProgressionHistoryOD] = useState<ProgressionData[]>([
    { date: '2024-01-15', Kavg: 48.2, pachymetry: 478, stage: 'Stage 1', notes: 'Initial diagnosis' },
    { date: '2024-07-20', Kavg: 49.5, pachymetry: 472, stage: 'Stage 2', notes: 'Progression detected' },
    { date: '2025-01-18', Kavg: 50.1, pachymetry: 468, stage: 'Stage 2', notes: 'Continued progression' },
    { date: '2026-01-20', Kavg: 50.4, pachymetry: 465, stage: 'Stage 2', notes: 'Current visit' },
  ]);

  const [progressionHistoryOS, setProgressionHistoryOS] = useState<ProgressionData[]>([
    { date: '2024-01-15', Kavg: 47.5, pachymetry: 485, stage: 'Stage 1', notes: 'Initial diagnosis' },
    { date: '2024-07-20', Kavg: 48.8, pachymetry: 482, stage: 'Stage 1', notes: 'Mild progression' },
    { date: '2025-01-18', Kavg: 49.2, pachymetry: 480, stage: 'Stage 1', notes: 'Stable' },
    { date: '2026-01-20', Kavg: 49.65, pachymetry: 478, stage: 'Stage 1', notes: 'Current visit' },
  ]);

  const [crossLinkingOD, setCrossLinkingOD] = useState<CrossLinkingData>({
    performed: false,
    date: '',
    protocol: 'Dresden Protocol',
    energyDensity: 5.4,
    uvaPower: 3,
    exposureTime: 30,
    complications: '',
    outcome: '',
  });

  const [crossLinkingOS, setCrossLinkingOS] = useState<CrossLinkingData>({
    performed: false,
    date: '',
    protocol: 'Dresden Protocol',
    energyDensity: 5.4,
    uvaPower: 3,
    exposureTime: 30,
    complications: '',
    outcome: '',
  });

  const currentHistory = activeEye === 'OD' ? progressionHistoryOD : progressionHistoryOS;
  const currentCXL = activeEye === 'OD' ? crossLinkingOD : crossLinkingOS;
  const setCurrentCXL = activeEye === 'OD' ? setCrossLinkingOD : setCrossLinkingOS;

  // Calculate progression rate
  const calculateProgression = (history: ProgressionData[]): {
    trend: 'Stable' | 'Progressing' | 'Rapid Progression';
    KavgChange: number;
    pachyChange: number;
    color: string;
  } => {
    if (history.length < 2) {
      return { trend: 'Stable', KavgChange: 0, pachyChange: 0, color: 'text-green-700' };
    }

    const latest = history[history.length - 1];
    const baseline = history[0];

    const KavgChange = latest.Kavg - baseline.Kavg;
    const pachyChange = latest.pachymetry - baseline.pachymetry;

    // Progression criteria: >1.0D change in Kavg or >10μm pachymetry thinning
    if (KavgChange > 1.5 || pachyChange < -15) {
      return { trend: 'Rapid Progression', KavgChange, pachyChange, color: 'text-red-700' };
    } else if (KavgChange > 0.5 || pachyChange < -5) {
      return { trend: 'Progressing', KavgChange, pachyChange, color: 'text-orange-700' };
    } else {
      return { trend: 'Stable', KavgChange, pachyChange, color: 'text-green-700' };
    }
  };

  const progression = calculateProgression(currentHistory);

  // CXL eligibility assessment
  const assessCXLEligibility = (): {
    eligible: boolean;
    reason: string;
    recommendation: string;
    color: string;
  } => {
    const pachymetry = activeEye === 'OD' ? odPachymetry : osPachymetry;

    if (currentCXL.performed) {
      return {
        eligible: false,
        reason: 'Cross-linking already performed',
        recommendation: 'Monitor for stabilization effect',
        color: 'bg-blue-50 border-blue-300 text-blue-900',
      };
    }

    if (pachymetry < 400) {
      return {
        eligible: false,
        reason: 'Cornea too thin (<400μm) - contraindication',
        recommendation: 'Consider keratoplasty instead',
        color: 'bg-red-50 border-red-300 text-red-900',
      };
    }

    if (progression.trend === 'Rapid Progression' || progression.trend === 'Progressing') {
      return {
        eligible: true,
        reason: 'Documented progression detected',
        recommendation: 'Cross-linking STRONGLY RECOMMENDED to halt progression',
        color: 'bg-green-50 border-green-300 text-green-900',
      };
    }

    if (currentStage.includes('Stage 2') || currentStage.includes('Stage 3')) {
      return {
        eligible: true,
        reason: 'Moderate/Advanced keratoconus',
        recommendation: 'Consider cross-linking to prevent further progression',
        color: 'bg-yellow-50 border-yellow-300 text-yellow-900',
      };
    }

    return {
      eligible: false,
      reason: 'No documented progression',
      recommendation: 'Continue monitoring every 6 months',
      color: 'bg-gray-50 border-gray-300 text-gray-900',
    };
  };

  const cxlEligibility = assessCXLEligibility();

  const handleSave = () => {
    if (onSave) {
      onSave({
        OD: { progression: progressionHistoryOD, cxl: crossLinkingOD },
        OS: { progression: progressionHistoryOS, cxl: crossLinkingOS },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Keratoconus Progression Tracker</h3>
        <p className="text-sm text-gray-600">
          Monitor keratoconus progression and cross-linking treatment
        </p>
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
          OD (Right Eye)
        </button>
        <button
          onClick={() => setActiveEye('OS')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeEye === 'OS'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          OS (Left Eye)
        </button>
      </div>

      {/* Progression Status */}
      <div className={`p-4 rounded-lg border-2 ${progression.color} bg-opacity-10`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {progression.trend === 'Stable' && <Minus className="w-6 h-6 text-green-600" />}
              {progression.trend === 'Progressing' && <TrendingUp className="w-6 h-6 text-orange-600" />}
              {progression.trend === 'Rapid Progression' && <TrendingUp className="w-6 h-6 text-red-600" />}
              <h4 className="text-lg font-bold">Progression Status: {progression.trend}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">K Average Change:</span>
                <span className={`ml-2 font-bold ${progression.color}`}>
                  {progression.KavgChange > 0 ? '+' : ''}
                  {progression.KavgChange.toFixed(2)} D
                </span>
              </div>
              <div>
                <span className="text-gray-600">Pachymetry Change:</span>
                <span className={`ml-2 font-bold ${progression.color}`}>
                  {progression.pachyChange} μm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CXL Eligibility */}
      <div className={`p-4 rounded-lg border-2 ${cxlEligibility.color}`}>
        <div className="flex items-start space-x-3">
          {cxlEligibility.eligible ? (
            <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
          ) : (
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-2">
              Cross-Linking Eligibility: {cxlEligibility.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
            </h4>
            <p className="text-sm mb-1">
              <strong>Reason:</strong> {cxlEligibility.reason}
            </p>
            <p className="text-sm font-medium">{cxlEligibility.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Progression History Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-600" />
          <span>Progression History ({activeEye})</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-center p-3 font-semibold">K Average (D)</th>
                <th className="text-center p-3 font-semibold">Pachymetry (μm)</th>
                <th className="text-center p-3 font-semibold">Stage</th>
                <th className="text-left p-3 font-semibold">Notes</th>
                <th className="text-center p-3 font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {currentHistory.map((entry, index) => {
                const isLatest = index === currentHistory.length - 1;
                const prevEntry = index > 0 ? currentHistory[index - 1] : null;
                const kavgChange = prevEntry ? entry.Kavg - prevEntry.Kavg : 0;
                const pachyChange = prevEntry ? entry.pachymetry - prevEntry.pachymetry : 0;

                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 ${
                      isLatest ? 'bg-purple-50 font-semibold' : ''
                    }`}
                  >
                    <td className="p-3">{entry.date}</td>
                    <td className="p-3 text-center">{entry.Kavg.toFixed(2)}</td>
                    <td className="p-3 text-center">{entry.pachymetry}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          entry.stage.includes('Stage 3') || entry.stage.includes('Stage 4')
                            ? 'bg-red-100 text-red-800'
                            : entry.stage.includes('Stage 2')
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {entry.stage}
                      </span>
                    </td>
                    <td className="p-3">{entry.notes}</td>
                    <td className="p-3 text-center">
                      {prevEntry && (
                        <div className="flex items-center justify-center space-x-1">
                          {kavgChange > 0.5 || pachyChange < -5 ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-red-600" />
                              <span className="text-red-700 text-xs font-semibold">
                                ↑{kavgChange.toFixed(2)}D
                              </span>
                            </>
                          ) : (
                            <>
                              <Minus className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 text-xs font-semibold">Stable</span>
                            </>
                          )}
                        </div>
                      )}
                      {!prevEntry && <span className="text-gray-500 text-xs">Baseline</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Linking Treatment Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          <span>Corneal Cross-Linking (CXL) Treatment</span>
        </h4>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={currentCXL.performed}
              onChange={(e) =>
                setCurrentCXL((prev: any) => ({ ...prev, performed: e.target.checked }))
              }
              disabled={!canEdit}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="font-medium text-gray-900">
              Cross-linking performed for {activeEye}
            </span>
          </label>
        </div>

        {currentCXL.performed && (
          <div className="space-y-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CXL Date</label>
                <input
                  type="date"
                  value={currentCXL.date}
                  onChange={(e) =>
                    setCurrentCXL((prev: any) => ({ ...prev, date: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Protocol</label>
                <select
                  value={currentCXL.protocol}
                  onChange={(e) =>
                    setCurrentCXL((prev: any) => ({ ...prev, protocol: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option>Dresden Protocol (Standard)</option>
                  <option>Accelerated CXL</option>
                  <option>Epi-on (Trans-epithelial)</option>
                  <option>Iontophoresis CXL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UVA Power (mW/cm²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentCXL.uvaPower}
                  onChange={(e) =>
                    setCurrentCXL((prev: any) => ({
                      ...prev,
                      uvaPower: parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exposure Time (min)
                </label>
                <input
                  type="number"
                  value={currentCXL.exposureTime}
                  onChange={(e) =>
                    setCurrentCXL((prev: any) => ({
                      ...prev,
                      exposureTime: parseInt(e.target.value) || 0,
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Density (J/cm²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentCXL.energyDensity}
                  onChange={(e) =>
                    setCurrentCXL((prev: any) => ({
                      ...prev,
                      energyDensity: parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-600 mt-1">Standard: 5.4 J/cm²</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Outcome</label>
                <select
                  value={currentCXL.outcome}
                  onChange={(e) =>
                    setCurrentCXL((prev: any) => ({ ...prev, outcome: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select outcome</option>
                  <option>Progression halted</option>
                  <option>Regression (improvement)</option>
                  <option>Continued progression</option>
                  <option>Too early to assess</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complications / Notes
              </label>
              <textarea
                value={currentCXL.complications}
                onChange={(e) =>
                  setCurrentCXL((prev: any) => ({ ...prev, complications: e.target.value }))
                }
                disabled={!canEdit}
                rows={3}
                placeholder="Delayed epithelial healing, corneal haze, infection, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>Follow-up Schedule:</strong> Post-CXL monitoring at 1 week, 1 month, 3
                months, 6 months, and yearly thereafter. Expect demarcation line at 300-350μm depth
                on OCT at 1 month.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-3">CXL Clinical Guidelines</h5>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Indication:</strong> Progressive keratoconus (documented {'>'}1D change or
            pachymetry thinning)
          </p>
          <p>
            <strong>Contraindications:</strong> Pachymetry &lt;400μm, pregnancy, severe dry eye,
            active infection
          </p>
          <p>
            <strong>Success Rate:</strong> ~95% halt progression, ~50% some regression
          </p>
          <p>
            <strong>Dresden Protocol:</strong> 3 mW/cm² × 30 min = 5.4 J/cm² (gold standard)
          </p>
          <p>
            <strong>Accelerated CXL:</strong> 9-30 mW/cm² × 3-10 min (same total energy, faster)
          </p>
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
            <span>Save Keratoconus Data</span>
          </button>
        </div>
      )}
    </div>
  );
}
