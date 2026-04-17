'use client';

import { useState } from 'react';
import { Calculator, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface BiometryData {
  AL: number; // Axial Length (mm)
  K1: number; // Flattest K (D)
  K2: number; // Steepest K (D)
  ACD: number; // Anterior Chamber Depth (mm)
  LT: number; // Lens Thickness (mm)
  WTW: number; // White-to-White (mm)
}

interface IOLCalculatorProps {
  patientId: string;
  biometry: {
    OD: BiometryData;
    OS: BiometryData;
  };
  surgicalEye: 'OD' | 'OS' | 'OU';
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

export default function IOLCalculator({
  patientId,
  biometry,
  surgicalEye,
  onSave,
  canEdit = false,
}: IOLCalculatorProps) {
  const [selectedEye, setSelectedEye] = useState<'OD' | 'OS'>(
    surgicalEye === 'OU' ? 'OD' : surgicalEye
  );
  const [targetRefraction, setTargetRefraction] = useState<number>(0); // Plano
  const [aConstant, setAConstant] = useState<number>(118.4); // Standard A-constant

  // IOL Power Calculation Formulas
  const calculateSRKT = (AL: number, K: number, A: number, targetRx: number): number => {
    // Simplified SRK/T formula
    const L = AL;
    const R = (1.336 - 1) / (K / 1000);
    const Rcornea = R * 1000;
    
    const LensConstant = A;
    const ACD_est = 0.62467 * A - 68.747;
    
    const H = (Rcornea * ACD_est) / (1000 * (Rcornea - ACD_est));
    
    const V = 12 / (L - H);
    const IOL_power = (1336 / (L - H)) - (1.336 / ((1.336 / (K + V)) - (H / 1000)));
    
    return Math.round(IOL_power * 2) / 2; // Round to nearest 0.5D
  };

  const calculateBarrettUniversal = (AL: number, K: number, ACD: number, LT: number, A: number): number => {
    // Simplified Barrett Universal II approximation
    // In production, use actual Barrett formula or API
    const K_avg = K;
    const LF = A - 118.4; // Lens factor adjustment
    
    const IOL_power = 1336 / (AL - (3.3 + (0.1 * (AL - 23.5)) + LF)) - K_avg;
    
    return Math.round(IOL_power * 2) / 2;
  };

  const calculateHaigis = (AL: number, K: number, ACD: number, A: number): number => {
    // Simplified Haigis formula
    const a0 = -1.0; // Haigis constant a0
    const a1 = 0.4; // Haigis constant a1
    const a2 = 0.1; // Haigis constant a2
    
    const d = a0 + (a1 * ACD) + (a2 * AL);
    
    const n = 1.336;
    const nK = n / K;
    const nL = n / (AL - d);
    
    const IOL_power = 1000 * ((nK - nL) / (1 - (d * (nK - nL) / 1000)));
    
    return Math.round(IOL_power * 2) / 2;
  };

  const calculateHolladay = (AL: number, K: number, A: number): number => {
    // Simplified Holladay 1 formula
    const SF = 1.75; // Surgeon factor
    const ACD_const = 0.56;
    
    const ELP = SF + ACD_const + (0.1 * (AL - 23.5)) + (0.1 * (K - 43.5));
    
    const IOL_power = (1336 / (AL - ELP)) - K;
    
    return Math.round(IOL_power * 2) / 2;
  };

  const calculateHofferQ = (AL: number, K: number, A: number): number => {
    // Hoffer Q formula (best for short eyes <22mm)
    const pACD = A - 118.4; // Personalized ACD
    const M = 1.336 / K;
    const V = 12 / (AL - pACD);
    
    const IOL_power = (1000 / (AL - pACD - M)) - (1.336 / ((1.336 / V) - (M / 1000)));
    
    return Math.round(IOL_power * 2) / 2;
  };

  // Calculate IOL powers for selected eye
  const eyeData = selectedEye === 'OD' ? biometry.OD : biometry.OS;
  const K_avg = (eyeData.K1 + eyeData.K2) / 2;

  const iolPowers = {
    SRKT: calculateSRKT(eyeData.AL, K_avg, aConstant, targetRefraction),
    Barrett: calculateBarrettUniversal(eyeData.AL, K_avg, eyeData.ACD, eyeData.LT, aConstant),
    Haigis: calculateHaigis(eyeData.AL, K_avg, eyeData.ACD, aConstant),
    Holladay: calculateHolladay(eyeData.AL, K_avg, aConstant),
    HofferQ: calculateHofferQ(eyeData.AL, K_avg, aConstant),
  };

  // Calculate average recommended IOL power
  const averageIOL = Math.round(
    (Object.values(iolPowers).reduce((sum, power) => sum + power, 0) / Object.keys(iolPowers).length) * 2
  ) / 2;

  // Corneal astigmatism for toric IOL calculation
  const cornealAstigmatism = Math.abs(eyeData.K1 - eyeData.K2);

  // Warnings and recommendations
  const getWarnings = () => {
    const warnings = [];
    
    if (eyeData.AL < 20) {
      warnings.push({
        type: 'error',
        message: 'Very short eye (AL <20mm). Use Hoffer Q or Barrett formula. Consider hyperopic surprise risk.',
      });
    } else if (eyeData.AL < 22) {
      warnings.push({
        type: 'warning',
        message: 'Short eye (AL <22mm). Hoffer Q or Barrett recommended for better accuracy.',
      });
    } else if (eyeData.AL > 26) {
      warnings.push({
        type: 'warning',
        message: 'Long eye (AL >26mm). Use Barrett or Haigis for better accuracy in myopic eyes.',
      });
    } else if (eyeData.AL > 28) {
      warnings.push({
        type: 'error',
        message: 'Very long eye (AL >28mm). Barrett Universal II recommended. Consider myopic surprise risk.',
      });
    }
    
    if (K_avg > 48) {
      warnings.push({
        type: 'warning',
        message: 'High K reading (>48D). Verify keratometry measurements. Check for keratoconus.',
      });
    } else if (K_avg < 40) {
      warnings.push({
        type: 'warning',
        message: 'Low K reading (<40D). Verify keratometry measurements. Check for previous refractive surgery.',
      });
    }
    
    if (cornealAstigmatism > 1.5) {
      warnings.push({
        type: 'info',
        message: `High astigmatism (${cornealAstigmatism.toFixed(2)}D). Consider toric IOL for optimal visual outcome.`,
      });
    }
    
    if (Math.abs(biometry.OD.AL - biometry.OS.AL) > 0.3) {
      warnings.push({
        type: 'error',
        message: 'Large AL difference between eyes (>0.3mm). Verify measurements - possible measurement error.',
      });
    }
    
    return warnings;
  };

  const warnings = getWarnings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          IOL Power Calculator - Multi-Formula Comparison
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

      {/* Biometry Input Summary */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-bold text-blue-900 mb-4">Biometry Data - {selectedEye}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-md p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">Axial Length</p>
            <p className="text-lg font-bold text-blue-900">{eyeData.AL.toFixed(2)} mm</p>
          </div>
          <div className="bg-white rounded-md p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">K1 (Flat)</p>
            <p className="text-lg font-bold text-blue-900">{eyeData.K1.toFixed(2)} D</p>
          </div>
          <div className="bg-white rounded-md p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">K2 (Steep)</p>
            <p className="text-lg font-bold text-blue-900">{eyeData.K2.toFixed(2)} D</p>
          </div>
          <div className="bg-white rounded-md p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">K Average</p>
            <p className="text-lg font-bold text-blue-900">{K_avg.toFixed(2)} D</p>
          </div>
          <div className="bg-white rounded-md p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">ACD</p>
            <p className="text-lg font-bold text-blue-900">{eyeData.ACD.toFixed(2)} mm</p>
          </div>
          <div className="bg-white rounded-md p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">Astigmatism</p>
            <p className="text-lg font-bold text-blue-900">{cornealAstigmatism.toFixed(2)} D</p>
          </div>
        </div>
      </div>

      {/* Target Refraction & A-Constant */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Calculation Parameters</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Refraction</label>
            <select
              value={targetRefraction}
              onChange={(e) => setTargetRefraction(parseFloat(e.target.value))}
              disabled={!canEdit}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Plano (0.00D) - Distance Vision</option>
              <option value={-1.0}>-1.00D - Intermediate Vision</option>
              <option value={-1.5}>-1.50D - Reading Vision</option>
              <option value={-2.0}>-2.00D - Near Vision</option>
              <option value={-2.5}>-2.50D - Monovision (Near)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">A-Constant (Lens Constant)</label>
            <input
              type="number"
              value={aConstant}
              onChange={(e) => setAConstant(parseFloat(e.target.value))}
              disabled={!canEdit}
              step={0.1}
              min={115}
              max={122}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="118.4"
            />
            <p className="text-xs text-gray-600 mt-1">Standard: 118.4 (Alcon SA60AT)</p>
          </div>
        </div>
      </div>

      {/* IOL Power Calculation Results */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
          <h4 className="text-lg font-bold text-white">Multi-Formula IOL Power Recommendations</h4>
        </div>

        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Formula</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Best For</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">IOL Power</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Expected Rx</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 bg-white">
              <td className="px-6 py-4 font-semibold text-gray-900">SRK/T</td>
              <td className="px-6 py-4 text-sm text-gray-700">Standard formula, AL 22-26mm</td>
              <td className="px-6 py-4 text-center">
                <span className="text-2xl font-bold text-blue-900">+{iolPowers.SRKT.toFixed(2)}D</span>
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-700">{targetRefraction.toFixed(2)}D</td>
            </tr>

            <tr className="border-b border-gray-200 bg-purple-50">
              <td className="px-6 py-4 font-semibold text-purple-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                Barrett Universal II ⭐
              </td>
              <td className="px-6 py-4 text-sm text-purple-800">
                <strong>Gold standard</strong> - Best overall accuracy
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-2xl font-bold text-purple-900">+{iolPowers.Barrett.toFixed(2)}D</span>
              </td>
              <td className="px-6 py-4 text-center text-sm text-purple-800">{targetRefraction.toFixed(2)}D</td>
            </tr>

            <tr className="border-b border-gray-200 bg-white">
              <td className="px-6 py-4 font-semibold text-gray-900">Haigis</td>
              <td className="px-6 py-4 text-sm text-gray-700">Short/long eyes, uses ACD</td>
              <td className="px-6 py-4 text-center">
                <span className="text-2xl font-bold text-blue-900">+{iolPowers.Haigis.toFixed(2)}D</span>
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-700">{targetRefraction.toFixed(2)}D</td>
            </tr>

            <tr className="border-b border-gray-200 bg-white">
              <td className="px-6 py-4 font-semibold text-gray-900">Holladay 1</td>
              <td className="px-6 py-4 text-sm text-gray-700">Average eyes, good accuracy</td>
              <td className="px-6 py-4 text-center">
                <span className="text-2xl font-bold text-blue-900">+{iolPowers.Holladay.toFixed(2)}D</span>
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-700">{targetRefraction.toFixed(2)}D</td>
            </tr>

            <tr className="border-b border-gray-200 bg-white">
              <td className="px-6 py-4 font-semibold text-gray-900">Hoffer Q</td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <strong>Best for short eyes</strong> (AL &lt;22mm)
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-2xl font-bold text-blue-900">+{iolPowers.HofferQ.toFixed(2)}D</span>
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-700">{targetRefraction.toFixed(2)}D</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-green-50 border-t-2 border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Consensus Recommendation</p>
              <p className="text-xs text-green-700">Average of all formulas</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-900">+{averageIOL.toFixed(2)}D</p>
            </div>
          </div>
        </div>
      </div>

      {/* IOL Power Options Table (±0.5D, ±1.0D) */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-bold text-gray-900 mb-4">IOL Power Options (Barrett Formula)</h4>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">IOL Power</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">Expected Refraction</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Visual Outcome</th>
            </tr>
          </thead>
          <tbody>
            {[-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5].map((offset) => {
              const power = iolPowers.Barrett + offset;
              const expectedRx = targetRefraction - (offset * 0.7); // Approximate
              const isRecommended = offset === 0;

              return (
                <tr key={offset} className={`border-b border-gray-200 ${isRecommended ? 'bg-purple-50' : 'bg-white'}`}>
                  <td className="px-4 py-3">
                    <span className={`text-lg font-bold ${isRecommended ? 'text-purple-900' : 'text-gray-900'}`}>
                      +{power.toFixed(2)}D
                      {isRecommended && ' ⭐'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold text-gray-700">{expectedRx.toFixed(2)}D</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {expectedRx > 0.5 ? 'Hyperopic (distance blur)' : 
                     expectedRx < -0.5 ? 'Myopic (near focus)' : 
                     'Good distance vision'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Toric IOL Recommendation */}
      {cornealAstigmatism > 0.75 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-yellow-900 mb-1">Toric IOL Recommended</h4>
              <p className="text-sm text-yellow-800">
                Corneal astigmatism: <strong>{cornealAstigmatism.toFixed(2)}D</strong>. 
                Consider toric IOL for optimal uncorrected visual acuity. Standard monofocal IOL will require glasses for best vision.
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-yellow-700">
                  • Astigmatism 0.75-1.50D: Optional toric (patient preference)
                </p>
                <p className="text-xs text-yellow-700">
                  • Astigmatism {'>'}1.50D: <strong>Strongly recommend toric IOL</strong>
                </p>
                <p className="text-xs text-yellow-700">
                  • Alternative: Limbal relaxing incisions (LRI) during surgery
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings and Recommendations */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded-md ${
                warning.type === 'error'
                  ? 'bg-red-50 border-red-400'
                  : warning.type === 'warning'
                  ? 'bg-orange-50 border-orange-400'
                  : 'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    warning.type === 'error'
                      ? 'text-red-600'
                      : warning.type === 'warning'
                      ? 'text-orange-600'
                      : 'text-blue-600'
                  }`}
                />
                <p
                  className={`text-sm ${
                    warning.type === 'error'
                      ? 'text-red-800'
                      : warning.type === 'warning'
                      ? 'text-orange-800'
                      : 'text-blue-800'
                  }`}
                >
                  {warning.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() =>
              onSave?.({
                iolPower: averageIOL,
                formula: 'Barrett Universal II',
                targetRefraction,
                eye: selectedEye,
              })
            }
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save IOL Calculation
          </button>
        </div>
      )}
    </div>
  );
}
