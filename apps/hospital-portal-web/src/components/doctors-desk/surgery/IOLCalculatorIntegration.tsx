'use client';

import { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BiometryData {
  AL: number; // Axial Length (mm)
  K1: number; // Flattest K (D)
  K2: number; // Steepest K (D)
  ACD: number; // Anterior Chamber Depth (mm)
  LT: number; // Lens Thickness (mm)
  WTW: number; // White-to-White (mm)
}

interface IOLCalculatorIntegrationProps {
  patientId: string;
  eye: 'OD' | 'OS';
  onIOLPowerCalculated: (power: number, formula: string) => void;
}

export default function IOLCalculatorIntegration({
  patientId,
  eye,
  onIOLPowerCalculated,
}: IOLCalculatorIntegrationProps) {
  const [biometry, setBiometry] = useState<BiometryData>({
    AL: 23.5,
    K1: 43.0,
    K2: 44.0,
    ACD: 3.2,
    LT: 4.5,
    WTW: 12.0,
  });
  const [targetRefraction, setTargetRefraction] = useState<number>(0);
  const [aConstant, setAConstant] = useState<number>(118.4);
  const [loading, setLoading] = useState(false);
  const [calculatedPowers, setCalculatedPowers] = useState<{
    [formula: string]: number;
  }>({});
  const [selectedFormula, setSelectedFormula] = useState<string>('Barrett Universal II');

  useEffect(() => {
    // Auto-fetch biometry data when component mounts
    fetchBiometryData();
  }, [patientId, eye]);

  const fetchBiometryData = async () => {
    try {
      setLoading(true);
      // Simulate API call to fetch biometry data
      // In production: const response = await biometryApi.getLatestBiometry(patientId, eye);
      
      // For now, use default values (would be replaced with actual API call)
      toast.success('Biometry data loaded (using default values for demo)');
    } catch (error) {
      console.error('Error fetching biometry:', error);
      toast.error('Could not load biometry data. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSRKT = (AL: number, K: number, A: number): number => {
    // Simplified SRK/T formula
    const L = AL;
    const R = (1.336 - 1) / (K / 1000);
    const Rcornea = R * 1000;
    const ACD_est = 0.62467 * A - 68.747;
    const H = (Rcornea * ACD_est) / (1000 * (Rcornea - ACD_est));
    const V = 12 / (L - H);
    const IOL_power = (1336 / (L - H)) - (1.336 / ((1.336 / (K + V)) - (H / 1000)));
    return Math.round(IOL_power * 2) / 2;
  };

  const calculateBarrettUniversal = (AL: number, K: number, ACD: number): number => {
    // Simplified Barrett approximation
    const K_avg = K;
    const LF = aConstant - 118.4;
    const IOL_power = 1336 / (AL - (3.3 + (0.1 * (AL - 23.5)) + LF)) - K_avg;
    return Math.round(IOL_power * 2) / 2;
  };

  const calculateHaigis = (AL: number, K: number, ACD: number): number => {
    const a0 = -1.0, a1 = 0.4, a2 = 0.1;
    const d = a0 + (a1 * ACD) + (a2 * AL);
    const n = 1.336;
    const nK = n / K;
    const nL = n / (AL - d);
    const IOL_power = 1000 * ((nK - nL) / (1 - (d * (nK - nL) / 1000)));
    return Math.round(IOL_power * 2) / 2;
  };

  const calculateHolladay = (AL: number, K: number): number => {
    const SF = 1.75;
    const ACD_const = 0.56;
    const ELP = SF + ACD_const + (0.1 * (AL - 23.5)) + (0.1 * (K - 43.5));
    const IOL_power = (1336 / (AL - ELP)) - K;
    return Math.round(IOL_power * 2) / 2;
  };

  const calculateHofferQ = (AL: number, K: number): number => {
    const pACD = aConstant - 118.4;
    const M = 1.336 / K;
    const V = 12 / (AL - pACD);
    const IOL_power = (1336 / (AL - pACD)) - (1.336 / (M - (pACD / 1000) - (V / 1000)));
    return Math.round(IOL_power * 2) / 2;
  };

  const handleCalculate = () => {
    const K_avg = (biometry.K1 + biometry.K2) / 2;

    const powers = {
      'SRK/T': calculateSRKT(biometry.AL, K_avg, aConstant),
      'Barrett Universal II': calculateBarrettUniversal(biometry.AL, K_avg, biometry.ACD),
      'Haigis': calculateHaigis(biometry.AL, K_avg, biometry.ACD),
      'Holladay 1': calculateHolladay(biometry.AL, K_avg),
      'Hoffer Q': calculateHofferQ(biometry.AL, K_avg),
    };

    setCalculatedPowers(powers);
    
    // Auto-select recommended power (Barrett Universal II as default)
    const recommendedPower = powers['Barrett Universal II'];
    onIOLPowerCalculated(recommendedPower, 'Barrett Universal II');
    
    toast.success('IOL power calculated');
  };

  const handleSelectFormula = (formula: string) => {
    setSelectedFormula(formula);
    onIOLPowerCalculated(calculatedPowers[formula], formula);
  };

  // Validation
  const hasValidBiometry = biometry.AL >= 20 && biometry.AL <= 30 && biometry.K1 > 0 && biometry.K2 > 0;
  const showALWarning = biometry.AL < 22 || biometry.AL > 27;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">IOL Power Calculator</h3>
        <button
          onClick={fetchBiometryData}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Fetch Latest Biometry</span>
        </button>
      </div>

      {/* Biometry Input */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Axial Length (AL) - mm
          </label>
          <input
            type="number"
            step="0.01"
            value={biometry.AL}
            onChange={(e) => setBiometry({ ...biometry, AL: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Flattest K (K1) - D
          </label>
          <input
            type="number"
            step="0.25"
            value={biometry.K1}
            onChange={(e) => setBiometry({ ...biometry, K1: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Steepest K (K2) - D
          </label>
          <input
            type="number"
            step="0.25"
            value={biometry.K2}
            onChange={(e) => setBiometry({ ...biometry, K2: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ACD - mm
          </label>
          <input
            type="number"
            step="0.01"
            value={biometry.ACD}
            onChange={(e) => setBiometry({ ...biometry, ACD: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Target Refraction & A-Constant */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Refraction
          </label>
          <select
            value={targetRefraction}
            onChange={(e) => setTargetRefraction(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="0">Plano (0.00)</option>
            <option value="-0.5">-0.50 D</option>
            <option value="-1.0">-1.00 D</option>
            <option value="-1.5">-1.50 D</option>
            <option value="-2.0">-2.00 D</option>
            <option value="0.5">+0.50 D</option>
            <option value="1.0">+1.00 D</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            A-Constant
          </label>
          <input
            type="number"
            step="0.1"
            value={aConstant}
            onChange={(e) => setAConstant(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Warnings */}
      {showALWarning && (
        <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Warning:</strong> Unusual axial length detected. 
            {biometry.AL < 22 && ' Short eye - Consider Hoffer Q formula.'}
            {biometry.AL > 27 && ' Long eye - Results may be less accurate.'}
          </div>
        </div>
      )}

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={!hasValidBiometry}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <Calculator className="h-5 w-5" />
        <span>Calculate IOL Power</span>
      </button>

      {/* Results */}
      {Object.keys(calculatedPowers).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Calculated IOL Powers</span>
          </h4>
          <div className="border rounded-lg overflow-hidden">
            {Object.entries(calculatedPowers).map(([formula, power]) => {
              const isSelected = selectedFormula === formula;
              const isRecommended = formula === 'Barrett Universal II';

              return (
                <button
                  key={formula}
                  onClick={() => handleSelectFormula(formula)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left border-b last:border-b-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {formula}
                      {isRecommended && (
                        <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="text-xs text-gray-600 mt-0.5">
                        Selected for surgery
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-bold text-indigo-600">
                    {power > 0 ? '+' : ''}{power.toFixed(2)} D
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-600 italic">
            Note: IOL calculations are for reference only. Always verify independently before surgery.
          </p>
        </div>
      )}
    </div>
  );
}
