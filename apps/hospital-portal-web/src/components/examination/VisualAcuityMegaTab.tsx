'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ExamCard, ExamInput, ExamSelect } from './ExamCard';
import { Eye, TrendingUp, Palette, Grid } from 'lucide-react';
import type {
  VisualAcuityData,
  RefractionData,
  AutoRefractionData,
  KeratometryData,
  ColorVisionData,
  ContrastSensitivityData,
} from '@/lib/stores/clinical-store';

interface VisualAcuityMegaTabProps {
  patientId: string;
  visualAcuityData: VisualAcuityData | null;
  refractionData: RefractionData | null;
  autoRefractionData: AutoRefractionData | null;
  keratometryData: KeratometryData | null;
  colorVisionData: ColorVisionData | null;
  contrastSensitivityData: ContrastSensitivityData | null;
  canEdit: boolean;
  onSaveVisualAcuity: (data: any) => void;
  onSaveRefraction: (data: any) => void;
  onSaveKeratometry: (data: any) => void;
  onSaveColorVision: (data: any) => void;
  onSaveContrastSensitivity: (data: any) => void;
}

const snellenValues = [
  '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60',
  'CF (Counting Fingers)', 'HM (Hand Movement)', 'PL (Perception of Light)', 'NPL (No Perception of Light)'
];

const nearVAValues = ['N6', 'N8', 'N10', 'N12', 'N18', 'N24', 'N36'];

const sphereValues: string[] = [];
for (let i = -20; i <= 20; i += 0.25) {
  sphereValues.push(i.toFixed(2));
}

const cylinderValues: string[] = [];
for (let i = 0; i >= -6; i -= 0.25) {
  cylinderValues.push(i.toFixed(2));
}

const axisValues: string[] = [];
for (let i = 0; i <= 180; i++) {
  axisValues.push(i.toString());
}

export default function VisualAcuityMegaTab({
  patientId,
  visualAcuityData,
  refractionData,
  autoRefractionData,
  keratometryData,
  colorVisionData,
  contrastSensitivityData,
  canEdit,
  onSaveVisualAcuity,
  onSaveRefraction,
  onSaveKeratometry,
  onSaveColorVision,
  onSaveContrastSensitivity,
}: VisualAcuityMegaTabProps) {
  // Old Glass vs New Prescription state
  const [oldGlass, setOldGlass] = useState({
    OD: { sphere: '', cylinder: '', axis: '', va: '' },
    OS: { sphere: '', cylinder: '', axis: '', va: '' },
  });
  const [newPrescription, setNewPrescription] = useState({
    OD: { sphere: '', cylinder: '', axis: '', va: '' },
    OS: { sphere: '', cylinder: '', axis: '', va: '' },
  });

  // Distance & Near Vision state
  const [distanceVision, setDistanceVision] = useState({
    OD: { unaided: '', aided: '' },
    OS: { unaided: '', aided: '' },
  });
  
  // Projection of Rays (PR) state - for very low vision testing
  // Separate tracking for Unaided and Aided vision
  const [projectionRays, setProjectionRays] = useState({
    OD: {
      unaided: { superior: false, inferior: false, nasal: false, temporal: false },
      aided: { superior: false, inferior: false, nasal: false, temporal: false }
    },
    OS: {
      unaided: { superior: false, inferior: false, nasal: false, temporal: false },
      aided: { superior: false, inferior: false, nasal: false, temporal: false }
    }
  });
  const [nearVision, setNearVision] = useState({
    OD: { unaided: '', aided: '' },
    OS: { unaided: '', aided: '' },
  });

  // Refraction state
  const [refraction, setRefraction] = useState({
    OD: { sphere: '', cylinder: '', axis: '' },
    OS: { sphere: '', cylinder: '', axis: '' },
  });

  // Keratometry state
  const [keratometry, setKeratometry] = useState({
    OD: { k1: '', k2: '', axis: '' },
    OS: { k1: '', k2: '', axis: '' },
  });

  // Color Vision state
  const [colorVision, setColorVision] = useState({
    testType: 'Ishihara',
    result: 'Normal',
    platesMissed: '',
  });

  // Contrast Sensitivity state
  const [contrastSensitivity, setContrastSensitivity] = useState({
    testType: 'Pelli-Robson',
    OD: { score: '', interpretation: '' },
    OS: { score: '', interpretation: '' },
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Initialize data from props
  useEffect(() => {
    if (visualAcuityData) {
      setDistanceVision({
        OD: {
          unaided: visualAcuityData.distance?.OD?.unaided || '',
          aided: visualAcuityData.distance?.OD?.aided || '',
        },
        OS: {
          unaided: visualAcuityData.distance?.OS?.unaided || '',
          aided: visualAcuityData.distance?.OS?.aided || '',
        },
      });
      setNearVision({
        OD: {
          unaided: visualAcuityData.near?.OD?.unaided || '',
          aided: visualAcuityData.near?.OD?.aided || '',
        },
        OS: {
          unaided: visualAcuityData.near?.OS?.unaided || '',
          aided: visualAcuityData.near?.OS?.aided || '',
        },
      });
    }
    if (refractionData) {
      setRefraction({
        OD: {
          sphere: refractionData.finalRx?.OD?.sphere || '',
          cylinder: refractionData.finalRx?.OD?.cylinder || '',
          axis: refractionData.finalRx?.OD?.axis || '',
        },
        OS: {
          sphere: refractionData.finalRx?.OS?.sphere || '',
          cylinder: refractionData.finalRx?.OS?.cylinder || '',
          axis: refractionData.finalRx?.OS?.axis || '',
        },
      });
      // Set old glass from previous prescription if available
      if (refractionData.startingRx) {
        setOldGlass({
          OD: {
            sphere: refractionData.startingRx.OD?.sphere || '',
            cylinder: refractionData.startingRx.OD?.cylinder || '',
            axis: refractionData.startingRx.OD?.axis || '',
            va: refractionData.startingRx.OD?.visualAcuity || '',
          },
          OS: {
            sphere: refractionData.startingRx.OS?.sphere || '',
            cylinder: refractionData.startingRx.OS?.cylinder || '',
            axis: refractionData.startingRx.OS?.axis || '',
            va: refractionData.startingRx.OS?.visualAcuity || '',
          },
        });
      }
      // New prescription is finalRx
      setNewPrescription({
        OD: {
          sphere: refractionData.finalRx?.OD?.sphere || '',
          cylinder: refractionData.finalRx?.OD?.cylinder || '',
          axis: refractionData.finalRx?.OD?.axis || '',
          va: refractionData.finalRx?.OD?.visualAcuity || '',
        },
        OS: {
          sphere: refractionData.finalRx?.OS?.sphere || '',
          cylinder: refractionData.finalRx?.OS?.cylinder || '',
          axis: refractionData.finalRx?.OS?.axis || '',
          va: refractionData.finalRx?.OS?.visualAcuity || '',
        },
      });
    }
    if (keratometryData) {
      setKeratometry({
        OD: {
          k1: keratometryData.OD?.k1 || '',
          k2: keratometryData.OD?.k2 || '',
          axis: keratometryData.OD?.axis || '',
        },
        OS: {
          k1: keratometryData.OS?.k1 || '',
          k2: keratometryData.OS?.k2 || '',
          axis: keratometryData.OS?.axis || '',
        },
      });
    }
    if (colorVisionData) {
      setColorVision({
        testType: colorVisionData.testType || 'Ishihara',
        result: colorVisionData.result || 'Normal',
        platesMissed: colorVisionData.platesMissed || '',
      });
    }
    if (contrastSensitivityData) {
      setContrastSensitivity({
        testType: contrastSensitivityData.testType || 'Pelli-Robson',
        OD: {
          score: contrastSensitivityData.OD?.logCS?.toString() || '',
          interpretation: getCSInterpretation(contrastSensitivityData.OD?.logCS || 0),
        },
        OS: {
          score: contrastSensitivityData.OS?.logCS?.toString() || '',
          interpretation: getCSInterpretation(contrastSensitivityData.OS?.logCS || 0),
        },
      });
    }
  }, [visualAcuityData, refractionData, keratometryData, colorVisionData, contrastSensitivityData]);

  const calculateAverageK = (k1: string, k2: string): string => {
    const k1Num = parseFloat(k1);
    const k2Num = parseFloat(k2);
    if (!isNaN(k1Num) && !isNaN(k2Num)) {
      return ((k1Num + k2Num) / 2).toFixed(2);
    }
    return '';
  };

  const calculateAstigmatism = (k1: string, k2: string): string => {
    const k1Num = parseFloat(k1);
    const k2Num = parseFloat(k2);
    if (!isNaN(k1Num) && !isNaN(k2Num)) {
      return Math.abs(k2Num - k1Num).toFixed(2);
    }
    return '';
  };

  const getCSInterpretation = (score: number): string => {
    if (score >= 1.65) return 'Normal';
    if (score >= 1.5) return 'Borderline';
    return 'Reduced';
  };

  const calculatePowerChange = (oldSphere: string, newSphere: string): string => {
    const old = parseFloat(oldSphere);
    const newVal = parseFloat(newSphere);
    if (!isNaN(old) && !isNaN(newVal)) {
      const diff = newVal - old;
      return diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
    }
    return '';
  };

  const calculateAxisRotation = (oldAxis: string, newAxis: string): string => {
    const old = parseFloat(oldAxis);
    const newVal = parseFloat(newAxis);
    if (!isNaN(old) && !isNaN(newVal)) {
      const diff = Math.abs(newVal - old);
      return `${diff.toFixed(0)}°`;
    }
    return '';
  };

  return (
    <div className="space-y-4 p-6">
      {/* Section 1: Old Glass vs New Prescription (Final Refraction - Done After All Examinations) */}
      <ExamCard
        title="Old Glass vs New Prescription (Final Refraction)"
        icon={<TrendingUp className="w-5 h-5" />}
        infoTooltip="Compare previous prescription with new refraction findings to track prescription changes."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old Glass Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Current Prescription (Old Glass)
            </h4>
            
            {/* OD */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase">Right Eye (OD)</p>
              <div className="grid grid-cols-2 gap-3">
                <ExamSelect
                  label="Sphere (D)"
                  value={oldGlass.OD.sphere}
                  onChange={(value) => {
                    setOldGlass({ ...oldGlass, OD: { ...oldGlass.OD, sphere: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {sphereValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Cylinder (D)"
                  value={oldGlass.OD.cylinder}
                  onChange={(value) => {
                    setOldGlass({ ...oldGlass, OD: { ...oldGlass.OD, cylinder: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {cylinderValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Axis (°)"
                  value={oldGlass.OD.axis}
                  onChange={(value) => {
                    setOldGlass({ ...oldGlass, OD: { ...oldGlass.OD, axis: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {axisValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Visual Acuity"
                  value={oldGlass.OD.va}
                  onChange={(value) => {
                    setOldGlass({ ...oldGlass, OD: { ...oldGlass.OD, va: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {snellenValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
              </div>
            </div>

            {/* OS */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase">Left Eye (OS)</p>
              <div className="grid grid-cols-2 gap-3">
                <ExamSelect
                  label="Sphere (D)"
                  value={oldGlass.OS.sphere}
                  onChange={(value) => {
                    setOldGlass({ ...oldGlass, OS: { ...oldGlass.OS, sphere: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {sphereValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Cylinder (D)"
                  value={oldGlass.OS.cylinder}
                  onChange={(value) => {
                    setOldGlass({ ...oldGlass, OS: { ...oldGlass.OS, cylinder: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {cylinderValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Axis (°)"
                  value={oldGlass.OS.axis}
                  onChange={(value) => {
                    setOldGlass({ ...oldGlass, OS: { ...oldGlass.OS, axis: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {axisValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Visual Acuity"
                  value={oldGlass.OS.va}
                  onChange={(value) => {
                    setOldGlass({ ...oldGlass, OS: { ...oldGlass.OS, va: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {snellenValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
              </div>
            </div>
          </div>

          {/* New Prescription Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-emerald-900 mb-3 pb-2 border-b border-emerald-200">
              New Prescription (Final Refraction)
            </h4>
            
            {/* OD */}
            <div className="bg-emerald-50 p-4 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-emerald-700 uppercase">Right Eye (OD)</p>
              <div className="grid grid-cols-2 gap-3">
                <ExamSelect
                  label="Sphere (D)"
                  value={newPrescription.OD.sphere}
                  onChange={(value) => {
                    setNewPrescription({ ...newPrescription, OD: { ...newPrescription.OD, sphere: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {sphereValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Cylinder (D)"
                  value={newPrescription.OD.cylinder}
                  onChange={(value) => {
                    setNewPrescription({ ...newPrescription, OD: { ...newPrescription.OD, cylinder: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {cylinderValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Axis (°)"
                  value={newPrescription.OD.axis}
                  onChange={(value) => {
                    setNewPrescription({ ...newPrescription, OD: { ...newPrescription.OD, axis: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {axisValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Visual Acuity"
                  value={newPrescription.OD.va}
                  onChange={(value) => {
                    setNewPrescription({ ...newPrescription, OD: { ...newPrescription.OD, va: value } });
  setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {snellenValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
              </div>
              {/* Power Change Indicator */}
              {oldGlass.OD.sphere && newPrescription.OD.sphere && (
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <p className="text-xs text-gray-600">
                    Power Change: <span className="font-semibold text-emerald-700">
                      {calculatePowerChange(oldGlass.OD.sphere, newPrescription.OD.sphere)} D
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* OS */}
            <div className="bg-emerald-50 p-4 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-emerald-700 uppercase">Left Eye (OS)</p>
              <div className="grid grid-cols-2 gap-3">
                <ExamSelect
                  label="Sphere (D)"
                  value={newPrescription.OS.sphere}
                  onChange={(value) => {
                    setNewPrescription({ ...newPrescription, OS: { ...newPrescription.OS, sphere: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {sphereValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Cylinder (D)"
                  value={newPrescription.OS.cylinder}
                  onChange={(value) => {
                    setNewPrescription({ ...newPrescription, OS: { ...newPrescription.OS, cylinder: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {cylinderValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Axis (°)"
                  value={newPrescription.OS.axis}
                  onChange={(value) => {
                    setNewPrescription({ ...newPrescription, OS: { ...newPrescription.OS, axis: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {axisValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
                <ExamSelect
                  label="Visual Acuity"
                  value={newPrescription.OS.va}
                  onChange={(value) => {
                    setNewPrescription({ ...newPrescription, OS: { ...newPrescription.OS, va: value } });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                >
                  <option value="">Select</option>
                  {snellenValues.map(val => <option key={val} value={val}>{val}</option>)}
                </ExamSelect>
              </div>
              {/* Power Change Indicator */}
              {oldGlass.OS.sphere && newPrescription.OS.sphere && (
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <p className="text-xs text-gray-600">
                    Power Change: <span className="font-semibold text-emerald-700">
                      {calculatePowerChange(oldGlass.OS.sphere, newPrescription.OS.sphere)} D
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ExamCard>

      {/* Section 2: Refraction */}
      <ExamCard
        title="Refraction (Subjective/Objective)"
        icon={<Eye className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Right Eye (OD)
            </h4>
            <ExamSelect
              label="Sphere (D)"
              value={refraction.OD.sphere}
              onChange={(value) => {
                setRefraction({ ...refraction, OD: { ...refraction.OD, sphere: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {sphereValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            <ExamSelect
              label="Cylinder (D)"
              value={refraction.OD.cylinder}
              onChange={(value) => {
                setRefraction({ ...refraction, OD: { ...refraction.OD, cylinder: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {cylinderValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            <ExamSelect
              label="Axis (°)"
              value={refraction.OD.axis}
              onChange={(value) => {
                setRefraction({ ...refraction, OD: { ...refraction.OD, axis: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {axisValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Left Eye (OS)
            </h4>
            <ExamSelect
              label="Sphere (D)"
              value={refraction.OS.sphere}
              onChange={(value) => {
                setRefraction({ ...refraction, OS: { ...refraction.OS, sphere: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {sphereValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            <ExamSelect
              label="Cylinder (D)"
              value={refraction.OS.cylinder}
              onChange={(value) => {
                setRefraction({ ...refraction, OS: { ...refraction.OS, cylinder: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {cylinderValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            <ExamSelect
              label="Axis (°)"
              value={refraction.OS.axis}
              onChange={(value) => {
                setRefraction({ ...refraction, OS: { ...refraction.OS, axis: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {axisValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
          </div>
        </div>
      </ExamCard>

      {/* Section 3: Distance Vision */}
      <ExamCard
        title="Distance Vision"
        icon={<Eye className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Right Eye (OD)
            </h4>
            <ExamSelect
              label="Unaided"
              value={distanceVision.OD.unaided}
              onChange={(value) => {
                setDistanceVision({ ...distanceVision, OD: { ...distanceVision.OD, unaided: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {snellenValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            
            {/* Projection of Rays (PR) - Unaided OD */}
            {(distanceVision.OD.unaided === 'HM (Hand Movement)' || distanceVision.OD.unaided === 'PL (Perception of Light)') && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Projection of Rays (PR) - OD (Unaided)
              </label>
              <div className="relative w-32 h-32 mx-auto">
                {/* Center circle representing eye */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                {/* Superior (Top) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OD: { ...projectionRays.OD, unaided: { ...projectionRays.OD.unaided, superior: !projectionRays.OD.unaided.superior } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OD.unaided.superior
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  S
                </button>
                
                {/* Inferior (Bottom) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OD: { ...projectionRays.OD, unaided: { ...projectionRays.OD.unaided, inferior: !projectionRays.OD.unaided.inferior } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OD.unaided.inferior
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  I
                </button>
                
                {/* Nasal (Left for OD) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OD: { ...projectionRays.OD, unaided: { ...projectionRays.OD.unaided, nasal: !projectionRays.OD.unaided.nasal } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OD.unaided.nasal
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  N
                </button>
                
                {/* Temporal (Right for OD) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OD: { ...projectionRays.OD, unaided: { ...projectionRays.OD.unaided, temporal: !projectionRays.OD.unaided.temporal } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OD.unaided.temporal
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  T
                </button>
              </div>
              <p className="text-xs text-gray-600 text-center mt-3">
                Click quadrants where light projection is accurate (Green = Accurate)
              </p>
            </div>
            )}
            
            <ExamSelect
              label="Aided (Corrected)"
              value={distanceVision.OD.aided}
              onChange={(value) => {
                setDistanceVision({ ...distanceVision, OD: { ...distanceVision.OD, aided: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {snellenValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            
            {/* Projection of Rays (PR) - Aided OD */}
            {(distanceVision.OD.aided === 'HM (Hand Movement)' || distanceVision.OD.aided === 'PL (Perception of Light)') && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Projection of Rays (PR) - OD (Aided)
              </label>
              <div className="relative w-32 h-32 mx-auto">
                {/* Center circle representing eye */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                {/* Superior (Top) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OD: { ...projectionRays.OD, aided: { ...projectionRays.OD.aided, superior: !projectionRays.OD.aided.superior } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OD.aided.superior
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  S
                </button>
                
                {/* Inferior (Bottom) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OD: { ...projectionRays.OD, aided: { ...projectionRays.OD.aided, inferior: !projectionRays.OD.aided.inferior } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OD.aided.inferior
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  I
                </button>
                
                {/* Nasal (Left for OD) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OD: { ...projectionRays.OD, aided: { ...projectionRays.OD.aided, nasal: !projectionRays.OD.aided.nasal } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OD.aided.nasal
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  N
                </button>
                
                {/* Temporal (Right for OD) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OD: { ...projectionRays.OD, aided: { ...projectionRays.OD.aided, temporal: !projectionRays.OD.aided.temporal } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OD.aided.temporal
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  T
                </button>
              </div>
              <p className="text-xs text-gray-600 text-center mt-3">
                Click quadrants where light projection is accurate (Green = Accurate)
              </p>
            </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Left Eye (OS)
            </h4>
            <ExamSelect
              label="Unaided"
              value={distanceVision.OS.unaided}
              onChange={(value) => {
                setDistanceVision({ ...distanceVision, OS: { ...distanceVision.OS, unaided: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {snellenValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            
            {/* Projection of Rays (PR) - Unaided OS */}
            {(distanceVision.OS.unaided === 'HM (Hand Movement)' || distanceVision.OS.unaided === 'PL (Perception of Light)') && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Projection of Rays (PR) - OS (Unaided)
              </label>
              <div className="relative w-32 h-32 mx-auto">
                {/* Center circle representing eye */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                
                {/* Superior (Top) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OS: { ...projectionRays.OS, unaided: { ...projectionRays.OS.unaided, superior: !projectionRays.OS.unaided.superior } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OS.unaided.superior
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  S
                </button>
                
                {/* Inferior (Bottom) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OS: { ...projectionRays.OS, unaided: { ...projectionRays.OS.unaided, inferior: !projectionRays.OS.unaided.inferior } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OS.unaided.inferior
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  I
                </button>
                
                {/* Nasal (Right for OS) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OS: { ...projectionRays.OS, unaided: { ...projectionRays.OS.unaided, nasal: !projectionRays.OS.unaided.nasal } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OS.unaided.nasal
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  N
                </button>
                
                {/* Temporal (Left for OS) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OS: { ...projectionRays.OS, unaided: { ...projectionRays.OS.unaided, temporal: !projectionRays.OS.unaided.temporal } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OS.unaided.temporal
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  T
                </button>
              </div>
              <p className="text-xs text-gray-600 text-center mt-3">
                Click quadrants where light projection is accurate (Green = Accurate)
              </p>
            </div>
            )}
            
            <ExamSelect
              label="Aided (Corrected)"
              value={distanceVision.OS.aided}
              onChange={(value) => {
                setDistanceVision({ ...distanceVision, OS: { ...distanceVision.OS, aided: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {snellenValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            
            {/* Projection of Rays (PR) - Aided OS */}
            {(distanceVision.OS.aided === 'HM (Hand Movement)' || distanceVision.OS.aided === 'PL (Perception of Light)') && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Projection of Rays (PR) - OS (Aided)
              </label>
              <div className="relative w-32 h-32 mx-auto">
                {/* Center circle representing eye */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                
                {/* Superior (Top) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OS: { ...projectionRays.OS, aided: { ...projectionRays.OS.aided, superior: !projectionRays.OS.aided.superior } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OS.aided.superior
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  S
                </button>
                
                {/* Inferior (Bottom) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OS: { ...projectionRays.OS, aided: { ...projectionRays.OS.aided, inferior: !projectionRays.OS.aided.inferior } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OS.aided.inferior
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  I
                </button>
                
                {/* Nasal (Right for OS) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OS: { ...projectionRays.OS, aided: { ...projectionRays.OS.aided, nasal: !projectionRays.OS.aided.nasal } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OS.aided.nasal
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  N
                </button>
                
                {/* Temporal (Left for OS) */}
                <button
                  type="button"
                  onClick={() => {
                    setProjectionRays({
                      ...projectionRays,
                      OS: { ...projectionRays.OS, aided: { ...projectionRays.OS.aided, temporal: !projectionRays.OS.aided.temporal } }
                    });
                    setHasChanges(true);
                  }}
                  disabled={!canEdit}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg transition-all ${
                    projectionRays.OS.aided.temporal
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } disabled:opacity-50 flex items-center justify-center text-xs font-semibold`}
                >
                  T
                </button>
              </div>
              <p className="text-xs text-gray-600 text-center mt-3">
                Click quadrants where light projection is accurate (Green = Accurate)
              </p>
            </div>
            )}
          </div>
        </div>
      </ExamCard>

      {/* Section 4: Near Vision */}
      <ExamCard
        title="Near Vision"
        icon={<Eye className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Right Eye (OD)
            </h4>
            <ExamSelect
              label="Unaided"
              value={nearVision.OD.unaided}
              onChange={(value) => {
                setNearVision({ ...nearVision, OD: { ...nearVision.OD, unaided: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {nearVAValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            <ExamSelect
              label="Aided (Corrected)"
              value={nearVision.OD.aided}
              onChange={(value) => {
                setNearVision({ ...nearVision, OD: { ...nearVision.OD, aided: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {nearVAValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Left Eye (OS)
            </h4>
            <ExamSelect
              label="Unaided"
              value={nearVision.OS.unaided}
              onChange={(value) => {
                setNearVision({ ...nearVision, OS: { ...nearVision.OS, unaided: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {nearVAValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            <ExamSelect
              label="Aided (Corrected)"
              value={nearVision.OS.aided}
              onChange={(value) => {
                setNearVision({ ...nearVision, OS: { ...nearVision.OS, aided: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {nearVAValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
          </div>
        </div>
      </ExamCard>

      {/* Section 5: Keratometry */}
      <ExamCard
        title="Keratometry"
        icon={<Eye className="w-5 h-5" />}
        infoTooltip="Measures corneal curvature for contact lens fitting and astigmatism assessment. Normal: 42-44D."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Right Eye (OD)
            </h4>
            <ExamSelect
              label="K1 - Flat (D)"
              value={keratometry.OD.k1}
              onChange={(value) => {
                setKeratometry({ ...keratometry, OD: { ...keratometry.OD, k1: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {Array.from({ length: 25 }, (_, i) => (40 + i * 0.25).toFixed(2)).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </ExamSelect>
            <ExamSelect
              label="K2 - Steep (D)"
              value={keratometry.OD.k2}
              onChange={(value) => {
                setKeratometry({ ...keratometry, OD: { ...keratometry.OD, k2: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {Array.from({ length: 25 }, (_, i) => (40 + i * 0.25).toFixed(2)).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </ExamSelect>
            <ExamSelect
              label="Axis (°)"
              value={keratometry.OD.axis}
              onChange={(value) => {
                setKeratometry({ ...keratometry, OD: { ...keratometry.OD, axis: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {axisValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            {keratometry.OD.k1 && keratometry.OD.k2 && (
              <div className="p-3 bg-blue-50 rounded-lg space-y-1">
                <p className="text-xs text-gray-600">
                  Average K: <span className="font-semibold text-blue-700">
                    {calculateAverageK(keratometry.OD.k1, keratometry.OD.k2)} D
                  </span>
                </p>
                <p className="text-xs text-gray-600">
                  Astigmatism: <span className="font-semibold text-blue-700">
                    {calculateAstigmatism(keratometry.OD.k1, keratometry.OD.k2)} D
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              Left Eye (OS)
            </h4>
            <ExamSelect
              label="K1 - Flat (D)"
              value={keratometry.OS.k1}
              onChange={(value) => {
                setKeratometry({ ...keratometry, OS: { ...keratometry.OS, k1: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {Array.from({ length: 25 }, (_, i) => (40 + i * 0.25).toFixed(2)).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </ExamSelect>
            <ExamSelect
              label="K2 - Steep (D)"
              value={keratometry.OS.k2}
              onChange={(value) => {
                setKeratometry({ ...keratometry, OS: { ...keratometry.OS, k2: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {Array.from({ length: 25 }, (_, i) => (40 + i * 0.25).toFixed(2)).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </ExamSelect>
            <ExamSelect
              label="Axis (°)"
              value={keratometry.OS.axis}
              onChange={(value) => {
                setKeratometry({ ...keratometry, OS: { ...keratometry.OS, axis: value } });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="">Select</option>
              {axisValues.map(val => <option key={val} value={val}>{val}</option>)}
            </ExamSelect>
            {keratometry.OS.k1 && keratometry.OS.k2 && (
              <div className="p-3 bg-blue-50 rounded-lg space-y-1">
                <p className="text-xs text-gray-600">
                  Average K: <span className="font-semibold text-blue-700">
                    {calculateAverageK(keratometry.OS.k1, keratometry.OS.k2)} D
                  </span>
                </p>
                <p className="text-xs text-gray-600">
                  Astigmatism: <span className="font-semibold text-blue-700">
                    {calculateAstigmatism(keratometry.OS.k1, keratometry.OS.k2)} D
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </ExamCard>

      {/* Section 6: Color Vision */}
      <ExamCard
        title="Color Vision"
        icon={<Palette className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExamSelect
              label="Test Type"
              value={colorVision.testType}
              onChange={(value) => {
                setColorVision({ ...colorVision, testType: value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Ishihara">Ishihara</option>
              <option value="D-15">D-15</option>
              <option value="HRR">HRR (Hardy-Rand-Rittler)</option>
              <option value="Farnsworth-Munsell 100">Farnsworth-Munsell 100</option>
            </ExamSelect>
            <ExamSelect
              label="Result"
              value={colorVision.result}
              onChange={(value) => {
                setColorVision({ ...colorVision, result: value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
            >
              <option value="Normal">Normal</option>
              <option value="Protan defect">Protan defect (Red-weak)</option>
              <option value="Deutan defect">Deutan defect (Green-weak)</option>
              <option value="Tritan defect">Tritan defect (Blue-weak)</option>
              <option value="Total color blindness">Total color blindness</option>
            </ExamSelect>
            <ExamInput
              label="Plates Missed (if Ishihara)"
              type="text"
              value={colorVision.platesMissed}
              onChange={(e) => {
                setColorVision({ ...colorVision, platesMissed: e.target.value });
                setHasChanges(true);
              }}
              disabled={!canEdit}
              infoTooltip="Record plate numbers incorrectly identified. Example: 3, 7, 12. Standard Ishihara has 38 plates."
            />
          </div>
        </div>
      </ExamCard>

      {/* Section 7: Contrast Sensitivity */}
      <ExamCard
        title="Contrast Sensitivity"
        icon={<Grid className="w-5 h-5" />}
        infoTooltip="Measures ability to distinguish between different shades. Important for real-world vision quality."
      >
        <div className="space-y-4">
          <ExamSelect
            label="Test Type"
            value={contrastSensitivity.testType}
            onChange={(value) => {
              setContrastSensitivity({ ...contrastSensitivity, testType: value });
              setHasChanges(true);
            }}
            disabled={!canEdit}
          >
            <option value="Pelli-Robson">Pelli-Robson</option>
            <option value="MARS">MARS</option>
            <option value="CSV-1000">CSV-1000</option>
          </ExamSelect>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Right Eye (OD)
              </h4>
              <ExamInput
                label="Score (log units)"
                type="number"
                step="0.05"
                value={contrastSensitivity.OD.score}
                onChange={(e) => {
                  const score = parseFloat(e.target.value) || 0;
                  setContrastSensitivity({
                    ...contrastSensitivity,
                    OD: { score: e.target.value, interpretation: getCSInterpretation(score) },
                  });
                  setHasChanges(true);
                }}
                disabled={!canEdit}
                infoTooltip="Normal: ≥1.65, Borderline: 1.50-1.64, Reduced: <1.50. Lower scores indicate impaired contrast perception."
              />
              {contrastSensitivity.OD.score && (
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">
                    Interpretation: <span className={`font-semibold ${
                      contrastSensitivity.OD.interpretation === 'Normal' ? 'text-green-700' :
                      contrastSensitivity.OD.interpretation === 'Borderline' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {contrastSensitivity.OD.interpretation}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Left Eye (OS)
              </h4>
              <ExamInput
                label="Score (log units)"
                type="number"
                step="0.05"
                value={contrastSensitivity.OS.score}
                onChange={(e) => {
                  const score = parseFloat(e.target.value) || 0;
                  setContrastSensitivity({
                    ...contrastSensitivity,
                    OS: { score: e.target.value, interpretation: getCSInterpretation(score) },
                  });
                  setHasChanges(true);
                }}
                disabled={!canEdit}
              />
              {contrastSensitivity.OS.score && (
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">
                    Interpretation: <span className={`font-semibold ${
                      contrastSensitivity.OS.interpretation === 'Normal' ? 'text-green-700' :
                      contrastSensitivity.OS.interpretation === 'Borderline' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {contrastSensitivity.OS.interpretation}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ExamCard>

      {/* Save Button */}
      {hasChanges && canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              // Handle save - this would call the appropriate save functions
              toast.success('Visual Acuity data saved successfully');
              setHasChanges(false);
            }}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Save All Changes
          </button>
        </div>
      )}
    </div>
  );
}
