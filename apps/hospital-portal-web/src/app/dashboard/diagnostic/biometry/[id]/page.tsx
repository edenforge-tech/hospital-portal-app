'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ArrowLeft, Save, Calculator, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import biometryApi, { BiometryRecord, IOLCalculationRequest, IOLCalculationResult } from '@/lib/api/biometry.api';

interface BiometryData {
  id?: string;
  patientId: string;
  eye: 'OD' | 'OS';
  
  // Biometry Measurements
  axialLength: number;
  k1: number; // Flat K
  k2: number; // Steep K
  k1Axis: number;
  acd: number; // Anterior Chamber Depth
  lensThickness?: number;
  whiteToWhite?: number;
  
  // Device Info
  device: string;
  deviceModel?: string;
  snr?: number; // Signal to Noise Ratio
  
  // Target Refraction
  targetRefraction: number;
  
  // Exam Info
  examinationDate: string;
  examinerId: string;
  notes?: string;
}

export default function BiometryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [formData, setFormData] = useState<BiometryData>({
    patientId: '',
    eye: 'OD',
    axialLength: 23.5,
    k1: 43.0,
    k2: 44.0,
    k1Axis: 180,
    acd: 3.0,
    lensThickness: 4.5,
    whiteToWhite: 12.0,
    device: 'IOLMaster 700',
    targetRefraction: 0,
    examinationDate: new Date().toISOString().split('T')[0],
    examinerId: 'current-user-id', // TODO: Get from auth
  });

  const [iolResults, setIolResults] = useState<IOLCalculationResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(isNew);

  // Validation flags
  const alValid = formData.axialLength >= 20 && formData.axialLength <= 30;
  const kValid = formData.k1 >= 35 && formData.k1 <= 50 && formData.k2 >= 35 && formData.k2 <= 50;
  const acdValid = formData.acd >= 2 && formData.acd <= 4.5;

  useEffect(() => {
    if (!isNew) {
      fetchBiometryData();
    }
  }, [params.id]);

  const fetchBiometryData = async () => {
    try {
      const data = await biometryApi.getById(params.id as string);
      setFormData({
        ...data,
        examinationDate: data.examinationDate.split('T')[0], // Format date
      });
      
      // If IOL calculations exist, load them
      if (data.iolCalculations && data.iolCalculations.length > 0) {
        setIolResults(data.iolCalculations);
      }
    } catch (error) {
      console.error('Failed to fetch biometry data:', error);
      toast.error('Failed to load biometry data');
    }
  };

  const calculateIOL = async () => {
    if (!alValid || !kValid || !acdValid) {
      toast.error('Please correct invalid measurements before calculating IOL');
      return;
    }

    setIsCalculating(true);
    try {
      const calculationRequest: IOLCalculationRequest = {
        axialLength: formData.axialLength,
        k1: formData.k1,
        k2: formData.k2,
        acd: formData.acd,
        lensThickness: formData.lensThickness,
        targetRefraction: formData.targetRefraction,
      };

      const results = await biometryApi.calculateAllFormulas(calculationRequest);
      setIolResults(results);
      toast.success('IOL calculations complete');
    } catch (error) {
      console.error('IOL calculation failed:', error);
      toast.error('Failed to calculate IOL power');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return;
    }

    if (!alValid || !kValid || !acdValid) {
      toast.error('Please correct invalid measurements');
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        iolCalculations: iolResults.length > 0 ? iolResults : undefined,
        calculatedIOL: iolResults.length > 0 ? iolResults[0].iolPower : undefined,
        selectedFormula: iolResults.length > 0 ? iolResults[0].formula : undefined,
      };

      if (isNew) {
        await biometryApi.create(dataToSave);
        toast.success('Biometry data created successfully');
      } else {
        await biometryApi.update(params.id as string, dataToSave);
        toast.success('Biometry data updated successfully');
      }
      
      router.push('/dashboard/diagnostic/biometry');
    } catch (error) {
      console.error('Failed to save biometry data:', error);
      toast.error('Failed to save biometry data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:EDIT">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Eye className="h-8 w-8 text-blue-600" />
                {isNew ? 'New Biometry Measurement' : 'Edit Biometry Data'}
              </h1>
              <p className="text-gray-600 mt-1">
                Enter biometry measurements and calculate IOL power
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={calculateIOL}
              disabled={isCalculating}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="h-5 w-5" />
              {isCalculating ? 'Calculating...' : 'Calculate IOL'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Biometry Data Entry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            {showPatientSearch && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Patient Selection Required</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  Please select a patient from the patient list before entering biometry data.
                </p>
                <button
                  onClick={() => router.push('/dashboard/patients')}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  → Go to Patient List
                </button>
              </div>
            )}

            {/* Eye Selection & Date */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eye
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, eye: 'OD' })}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                        formData.eye === 'OD'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      OD (Right Eye)
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, eye: 'OS' })}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                        formData.eye === 'OS'
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      OS (Left Eye)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Examination Date
                  </label>
                  <input
                    type="date"
                    value={formData.examinationDate}
                    onChange={(e) => setFormData({ ...formData, examinationDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Primary Measurements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Measurements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Axial Length (AL) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.axialLength}
                      onChange={(e) => setFormData({ ...formData, axialLength: parseFloat(e.target.value) })}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !alValid ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      mm
                    </span>
                  </div>
                  {!alValid && (
                    <p className="text-red-500 text-xs mt-1">Normal range: 20-30 mm</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Normal: 22.5 - 24.5 mm</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anterior Chamber Depth (ACD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.acd}
                      onChange={(e) => setFormData({ ...formData, acd: parseFloat(e.target.value) })}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !acdValid ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      mm
                    </span>
                  </div>
                  {!acdValid && (
                    <p className="text-red-500 text-xs mt-1">Normal range: 2-4.5 mm</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Normal: 2.5 - 3.5 mm</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    K1 (Flat K) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.k1}
                      onChange={(e) => setFormData({ ...formData, k1: parseFloat(e.target.value) })}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !kValid ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      D
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Normal: 42 - 46 D</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    K2 (Steep K) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.k2}
                      onChange={(e) => setFormData({ ...formData, k2: parseFloat(e.target.value) })}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !kValid ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      D
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Normal: 42 - 46 D</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    K1 Axis
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={formData.k1Axis}
                      onChange={(e) => setFormData({ ...formData, k1Axis: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      °
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corneal Astigmatism
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={`${(formData.k2 - formData.k1).toFixed(2)} D`}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {formData.k2 - formData.k1 > 0.75 ? 'Significant astigmatism - consider Toric IOL' : 'Low astigmatism'}
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Measurements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Optional Measurements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lens Thickness (LT)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.lensThickness || ''}
                      onChange={(e) => setFormData({ ...formData, lensThickness: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      mm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    White-to-White (WTW)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.whiteToWhite || ''}
                      onChange={(e) => setFormData({ ...formData, whiteToWhite: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      mm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SNR (Signal to Noise Ratio)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.snr || ''}
                    onChange={(e) => setFormData({ ...formData, snr: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.device}
                    onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="IOLMaster 700">IOLMaster 700 (Zeiss)</option>
                    <option value="IOLMaster 500">IOLMaster 500 (Zeiss)</option>
                    <option value="Lenstar LS 900">Lenstar LS 900 (Haag-Streit)</option>
                    <option value="AL-Scan">AL-Scan (Nidek)</option>
                    <option value="OA-2000">OA-2000 (Tomey)</option>
                    <option value="A-Scan Ultrasound">A-Scan Ultrasound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Refraction
                  </label>
                  <select
                    value={formData.targetRefraction}
                    onChange={(e) => setFormData({ ...formData, targetRefraction: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="0">Emmetropia (0.00 D)</option>
                    <option value="-0.5">Mild Myopia (-0.50 D)</option>
                    <option value="-1.0">Moderate Myopia (-1.00 D)</option>
                    <option value="-1.5">Monovision (-1.50 D)</option>
                    <option value="0.5">Mild Hyperopia (+0.50 D)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or observations..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Right Column - IOL Calculation Results */}
          <div className="space-y-6">
            {iolResults.length > 0 ? (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">IOL Calculation Results</h2>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  
                  <div className="space-y-3">
                    {iolResults.map((result, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{result.formula}</span>
                          <span className="text-2xl font-bold text-blue-600">
                            +{result.iolPower.toFixed(2)} D
                          </span>
                        </div>
                        {result.aConstant && (
                          <div className="text-xs text-gray-500">
                            A-constant: {result.aConstant}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Predicted SE: {result.predictedRefraction >= 0 ? '+' : ''}{result.predictedRefraction.toFixed(2)} D
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Consensus Recommendation */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Recommended IOL Power</span>
                      </div>
                      <div className="text-3xl font-bold text-green-900">
                        +{iolResults[0]?.iolPower.toFixed(2)} D
                      </div>
                      <p className="text-green-700 text-sm mt-2">
                        Based on SRK-T formula (most commonly used)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Toric IOL Assessment */}
                {formData.k2 - formData.k1 > 0.75 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-800 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">Toric IOL Recommended</span>
                    </div>
                    <p className="text-amber-700 text-sm">
                      Corneal astigmatism of {(formData.k2 - formData.k1).toFixed(2)} D detected. 
                      Consider Toric IOL to correct astigmatism.
                    </p>
                    <div className="mt-3 text-sm text-amber-800">
                      <div>Steep axis: {formData.k1Axis}°</div>
                      <div>Flat axis: {(formData.k1Axis + 90) % 180}°</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No IOL Calculations Yet</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Enter biometry measurements and click "Calculate IOL" to see results
                  </p>
                  <button
                    onClick={calculateIOL}
                    disabled={!alValid || !kValid || !acdValid}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Calculate IOL Now
                  </button>
                </div>
              </div>
            )}

            {/* Quick Reference */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">📊 Formula Selection Guide</h3>
              <div className="space-y-2 text-xs text-blue-800">
                <div><span className="font-medium">SRK-T:</span> Best for normal eyes (AL 22-26 mm)</div>
                <div><span className="font-medium">Barrett:</span> Highly accurate, minimal systematic error</div>
                <div><span className="font-medium">Holladay:</span> Good for high myopia/hyperopia</div>
                <div><span className="font-medium">Haigis:</span> Uses ACD, good for short eyes</div>
                <div><span className="font-medium">Hoffer Q:</span> Best for short eyes (AL {'<'}22 mm)</div>
                <div><span className="font-medium">Hill-RBF:</span> AI-based, pattern recognition</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
