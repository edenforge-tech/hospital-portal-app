'use client';

import { useState, useEffect } from 'react';
import { Grid, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface VisualFieldData {
  date: string;
  mdOD: number;
  mdOS: number;
  psdOD: number;
  psdOS: number;
  vfiOD: number;
  vfiOS: number;
  ghtOD: 'WNL' | 'BNL' | 'ONL';
  ghtOS: 'WNL' | 'BNL' | 'ONL';
  falsePositivesOD: number;
  falseNegativesOD: number;
  fixationLossesOD: number;
  falsePositivesOS: number;
  falseNegativesOS: number;
  fixationLossesOS: number;
}

interface VisualFieldAnalysisProps {
  patientId: string;
  currentMD: { OD: number; OS: number };
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

export default function VisualFieldAnalysis({
  patientId,
  currentMD,
  onSave,
  canEdit = false,
}: VisualFieldAnalysisProps) {
  const [vfHistory, setVFHistory] = useState<VisualFieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEye, setSelectedEye] = useState<'OD' | 'OS'>('OD');

  useEffect(() => {
    const loadVFHistory = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        const mockHistory: VisualFieldData[] = [
          {
            date: '2023-01-15',
            mdOD: -2.5, mdOS: -1.8,
            psdOD: 2.1, psdOS: 1.9,
            vfiOD: 95, vfiOS: 97,
            ghtOD: 'WNL', ghtOS: 'WNL',
            falsePositivesOD: 2, falseNegativesOD: 1, fixationLossesOD: 0,
            falsePositivesOS: 1, falseNegativesOS: 0, fixationLossesOS: 1,
          },
          {
            date: '2023-07-20',
            mdOD: -4.2, mdOS: -3.1,
            psdOD: 3.5, psdOS: 2.8,
            vfiOD: 90, vfiOS: 93,
            ghtOD: 'BNL', ghtOS: 'WNL',
            falsePositivesOD: 1, falseNegativesOD: 2, fixationLossesOD: 1,
            falsePositivesOS: 0, falseNegativesOS: 1, fixationLossesOS: 0,
          },
          {
            date: '2024-01-15',
            mdOD: -6.8, mdOS: -4.5,
            psdOD: 5.2, psdOS: 3.6,
            vfiOD: 82, vfiOS: 88,
            ghtOD: 'BNL', ghtOS: 'BNL',
            falsePositivesOD: 3, falseNegativesOD: 1, fixationLossesOD: 2,
            falsePositivesOS: 2, falseNegativesOS: 0, fixationLossesOS: 1,
          },
          {
            date: '2024-07-20',
            mdOD: -9.3, mdOS: -6.2,
            psdOD: 7.1, psdOS: 4.8,
            vfiOD: 75, vfiOS: 82,
            ghtOD: 'ONL', ghtOS: 'BNL',
            falsePositivesOD: 2, falseNegativesOD: 3, fixationLossesOD: 1,
            falsePositivesOS: 1, falseNegativesOS: 2, fixationLossesOS: 0,
          },
          {
            date: '2025-01-15',
            mdOD: -11.8, mdOS: -7.9,
            psdOD: 8.9, psdOS: 6.1,
            vfiOD: 68, vfiOS: 76,
            ghtOD: 'ONL', ghtOS: 'ONL',
            falsePositivesOD: 1, falseNegativesOD: 2, fixationLossesOD: 0,
            falsePositivesOS: 0, falseNegativesOS: 1, fixationLossesOS: 1,
          },
          {
            date: '2026-01-27',
            mdOD: currentMD.OD, mdOS: currentMD.OS,
            psdOD: 9.5, psdOS: 6.8,
            vfiOD: 62, vfiOS: 72,
            ghtOD: 'ONL', ghtOS: 'ONL',
            falsePositivesOD: 2, falseNegativesOD: 1, fixationLossesOD: 1,
            falsePositivesOS: 1, falseNegativesOS: 0, fixationLossesOS: 0,
          },
        ];

        setVFHistory(mockHistory);
      } catch (error) {
        console.error('Failed to load visual field history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVFHistory();
  }, [patientId, currentMD]);

  const calculateProgression = () => {
    if (vfHistory.length < 2) return null;

    const yearsSpan = (new Date(vfHistory[vfHistory.length - 1].date).getTime() - 
                       new Date(vfHistory[0].date).getTime()) / 
                       (1000 * 60 * 60 * 24 * 365.25);

    const mdChangeOD = vfHistory[vfHistory.length - 1].mdOD - vfHistory[0].mdOD;
    const mdChangeOS = vfHistory[vfHistory.length - 1].mdOS - vfHistory[0].mdOS;

    const mdSlopeOD = Math.round((mdChangeOD / yearsSpan) * 100) / 100;
    const mdSlopeOS = Math.round((mdChangeOS / yearsSpan) * 100) / 100;

    const vfiChangeOD = vfHistory[vfHistory.length - 1].vfiOD - vfHistory[0].vfiOD;
    const vfiChangeOS = vfHistory[vfHistory.length - 1].vfiOS - vfHistory[0].vfiOS;

    const vfiSlopeOD = Math.round((vfiChangeOD / yearsSpan) * 100) / 100;
    const vfiSlopeOS = Math.round((vfiChangeOS / yearsSpan) * 100) / 100;

    // Time to blindness projection (very simplified)
    const currentVFI_OD = vfHistory[vfHistory.length - 1].vfiOD;
    const currentVFI_OS = vfHistory[vfHistory.length - 1].vfiOS;
    
    const yearsToBlindnessOD = vfiSlopeOD < 0 ? Math.abs(currentVFI_OD / vfiSlopeOD) : Infinity;
    const yearsToBlindnessOS = vfiSlopeOS < 0 ? Math.abs(currentVFI_OS / vfiSlopeOS) : Infinity;

    return {
      mdSlopeOD,
      mdSlopeOS,
      vfiSlopeOD,
      vfiSlopeOS,
      yearsToBlindnessOD,
      yearsToBlindnessOS,
    };
  };

  const progression = calculateProgression();

  const getSeverityLevel = (md: number) => {
    if (md > -6) return { level: 'Early', color: 'text-yellow-900 bg-yellow-50 border-yellow-200' };
    if (md >= -12) return { level: 'Moderate', color: 'text-orange-900 bg-orange-50 border-orange-200' };
    return { level: 'Severe', color: 'text-red-900 bg-red-50 border-red-200' };
  };

  const getGHTColor = (ght: string) => {
    switch (ght) {
      case 'WNL': return 'bg-green-100 text-green-900 border-green-300';
      case 'BNL': return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'ONL': return 'bg-red-100 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-900 border-gray-300';
    }
  };

  const getGHTLabel = (ght: string) => {
    switch (ght) {
      case 'WNL': return 'Within Normal Limits';
      case 'BNL': return 'Borderline';
      case 'ONL': return 'Outside Normal Limits';
      default: return 'Unknown';
    }
  };

  const isReliableTest = (fp: number, fn: number, fl: number) => {
    return fp <= 15 && fn <= 15 && fl <= 20;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentVF = vfHistory[vfHistory.length - 1];
  const severityOD = getSeverityLevel(currentVF.mdOD);
  const severityOS = getSeverityLevel(currentVF.mdOS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Grid className="w-5 h-5 mr-2 text-purple-600" />
          Visual Field Progression Analysis
        </h3>

        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedEye('OD')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              selectedEye === 'OD' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            OD (Right Eye)
          </button>
          <button
            onClick={() => setSelectedEye('OS')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              selectedEye === 'OS' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            OS (Left Eye)
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`border-2 rounded-lg p-4 ${severityOD.color}`}>
          <h4 className="text-sm font-semibold mb-3">OD (Right Eye) - Current Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Mean Deviation:</span>
              <span className="text-lg font-bold">{currentVF.mdOD} dB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Severity:</span>
              <span className="text-sm font-bold">{severityOD.level} Glaucoma</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">VFI:</span>
              <span className="text-lg font-bold">{currentVF.vfiOD}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">PSD:</span>
              <span className="text-lg font-bold">{currentVF.psdOD} dB</span>
            </div>
          </div>
        </div>

        <div className={`border-2 rounded-lg p-4 ${severityOS.color}`}>
          <h4 className="text-sm font-semibold mb-3">OS (Left Eye) - Current Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Mean Deviation:</span>
              <span className="text-lg font-bold">{currentVF.mdOS} dB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Severity:</span>
              <span className="text-sm font-bold">{severityOS.level} Glaucoma</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">VFI:</span>
              <span className="text-lg font-bold">{currentVF.vfiOS}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">PSD:</span>
              <span className="text-lg font-bold">{currentVF.psdOS} dB</span>
            </div>
          </div>
        </div>
      </div>

      {/* GHT Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`border-2 rounded-lg p-4 ${getGHTColor(currentVF.ghtOD)}`}>
          <h4 className="text-sm font-semibold mb-2">GHT - OD</h4>
          <p className="text-lg font-bold">{getGHTLabel(currentVF.ghtOD)}</p>
        </div>
        <div className={`border-2 rounded-lg p-4 ${getGHTColor(currentVF.ghtOS)}`}>
          <h4 className="text-sm font-semibold mb-2">GHT - OS</h4>
          <p className="text-lg font-bold">{getGHTLabel(currentVF.ghtOS)}</p>
        </div>
      </div>

      {/* Test Reliability */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Test Reliability Indices</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold mb-2">OD (Right Eye)</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>False Positives:</span>
                <span className={`font-bold ${currentVF.falsePositivesOD > 15 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentVF.falsePositivesOD}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>False Negatives:</span>
                <span className={`font-bold ${currentVF.falseNegativesOD > 15 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentVF.falseNegativesOD}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fixation Losses:</span>
                <span className={`font-bold ${currentVF.fixationLossesOD > 20 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentVF.fixationLossesOD}%
                </span>
              </div>
            </div>
            {isReliableTest(currentVF.falsePositivesOD, currentVF.falseNegativesOD, currentVF.fixationLossesOD) ? (
              <p className="mt-2 text-xs text-green-700 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Reliable Test
              </p>
            ) : (
              <p className="mt-2 text-xs text-red-700 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unreliable Test
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-600 font-semibold mb-2">OS (Left Eye)</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>False Positives:</span>
                <span className={`font-bold ${currentVF.falsePositivesOS > 15 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentVF.falsePositivesOS}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>False Negatives:</span>
                <span className={`font-bold ${currentVF.falseNegativesOS > 15 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentVF.falseNegativesOS}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fixation Losses:</span>
                <span className={`font-bold ${currentVF.fixationLossesOS > 20 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentVF.fixationLossesOS}%
                </span>
              </div>
            </div>
            {isReliableTest(currentVF.falsePositivesOS, currentVF.falseNegativesOS, currentVF.fixationLossesOS) ? (
              <p className="mt-2 text-xs text-green-700 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Reliable Test
              </p>
            ) : (
              <p className="mt-2 text-xs text-red-700 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unreliable Test
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MD Progression Chart */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Mean Deviation (MD) Progression</h4>
        <div className="relative h-64 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 p-4">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600 font-mono py-4">
            <span>0</span>
            <span>-6</span>
            <span>-12</span>
            <span>-18</span>
            <span>-24</span>
          </div>

          {/* Severity zones */}
          <div className="absolute left-12 right-4 top-4 bottom-4 flex flex-col">
            <div className="flex-1 bg-yellow-50 border-b border-yellow-200"></div>
            <div className="flex-1 bg-orange-50 border-b border-orange-200"></div>
            <div className="flex-1 bg-red-50"></div>
          </div>

          {/* Data points */}
          <div className="absolute left-12 right-4 top-4 bottom-4 flex justify-between items-end">
            {vfHistory.map((vf, index) => {
              const mdValue = selectedEye === 'OD' ? vf.mdOD : vf.mdOS;
              const heightPercent = ((24 + mdValue) / 24) * 100;

              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-4 h-4 rounded-full cursor-pointer ${
                      selectedEye === 'OD' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                    } relative group`}
                    style={{ position: 'absolute', bottom: `${heightPercent}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {mdValue} dB
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-mono mt-auto">
                    {new Date(vf.date).toLocaleDateString('en-GB', { year: '2-digit', month: 'short' })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progression Statistics */}
      {progression && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h4 className="text-sm font-bold text-purple-900 mb-4">Progression Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-semibold text-purple-700 mb-2">OD (Right Eye)</h5>
              <div className="space-y-2 bg-white rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-900">MD Slope:</span>
                  <span className={`text-sm font-bold flex items-center ${
                    progression.mdSlopeOD < -1 ? 'text-red-600' : progression.mdSlopeOD < -0.5 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {progression.mdSlopeOD > 0 && '+'}
                    {progression.mdSlopeOD} dB/year
                    {progression.mdSlopeOD < -1 ? <TrendingDown className="w-4 h-4 ml-1" /> : <TrendingUp className="w-4 h-4 ml-1" />}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-900">VFI Slope:</span>
                  <span className={`text-sm font-bold ${
                    progression.vfiSlopeOD < -2 ? 'text-red-600' : progression.vfiSlopeOD < -1 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {progression.vfiSlopeOD > 0 && '+'}
                    {progression.vfiSlopeOD}%/year
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-900">Time to 0% VFI:</span>
                  <span className="text-sm font-bold text-purple-900">
                    {progression.yearsToBlindnessOD === Infinity
                      ? 'Stable'
                      : `${Math.round(progression.yearsToBlindnessOD)} years`}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-purple-700 mb-2">OS (Left Eye)</h5>
              <div className="space-y-2 bg-white rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-900">MD Slope:</span>
                  <span className={`text-sm font-bold flex items-center ${
                    progression.mdSlopeOS < -1 ? 'text-red-600' : progression.mdSlopeOS < -0.5 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {progression.mdSlopeOS > 0 && '+'}
                    {progression.mdSlopeOS} dB/year
                    {progression.mdSlopeOS < -1 ? <TrendingDown className="w-4 h-4 ml-1" /> : <TrendingUp className="w-4 h-4 ml-1" />}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-900">VFI Slope:</span>
                  <span className={`text-sm font-bold ${
                    progression.vfiSlopeOS < -2 ? 'text-red-600' : progression.vfiSlopeOS < -1 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {progression.vfiSlopeOS > 0 && '+'}
                    {progression.vfiSlopeOS}%/year
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-900">Time to 0% VFI:</span>
                  <span className="text-sm font-bold text-purple-900">
                    {progression.yearsToBlindnessOS === Infinity
                      ? 'Stable'
                      : `${Math.round(progression.yearsToBlindnessOS)} years`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Recommendation */}
          <div className="mt-4 pt-4 border-t-2 border-purple-200">
            <h5 className="text-xs font-semibold text-purple-900 mb-2">Clinical Recommendation:</h5>
            <p className="text-sm text-purple-800">
              {progression.mdSlopeOD < -1 || progression.mdSlopeOS < -1 ? (
                <>
                  <strong className="text-red-700">Rapid Progression Detected:</strong> Consider escalating therapy 
                  (laser trabeculoplasty, incisional surgery) or lowering target IOP. Perform more frequent visual field testing (every 3-4 months).
                </>
              ) : progression.mdSlopeOD < -0.5 || progression.mdSlopeOS < -0.5 ? (
                <>
                  <strong className="text-orange-700">Moderate Progression:</strong> Re-evaluate current treatment regimen. 
                  Consider adding medications or laser therapy. Monitor every 4-6 months.
                </>
              ) : (
                <>
                  <strong className="text-green-700">Stable Visual Fields:</strong> Continue current treatment. 
                  Monitor annually or as clinically indicated. Maintain current target IOP.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Visual Field Map Placeholder */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Grid className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 font-semibold mb-2">Visual Field Maps</p>
        <p className="text-sm text-gray-500">Gray-scale and Pattern Deviation maps will be displayed here</p>
        <p className="text-xs text-gray-400 mt-1">(Integration with VF testing equipment - Phase 2)</p>
      </div>
    </div>
  );
}
