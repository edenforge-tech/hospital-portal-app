'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  Droplet,
  Activity,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
} from 'lucide-react';
import { ContactLensData, KeratometryData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';

interface ContactLensFormProps {
  patientId: string;
  initialData?: ContactLensData;
  keratometryData?: KeratometryData;
  onSave: (data: ContactLensData) => void;
  canEdit: boolean;
}

export default function ContactLensForm({
  patientId,
  initialData,
  keratometryData,
  onSave,
  canEdit,
}: ContactLensFormProps) {
  const { user } = useAuthStore();

  // Calculate recommended base curve from keratometry
  const calculateBaseCurve = (avgK: number, lensType: string) => {
    // Soft lens: typically 0.8-1.0mm flatter than corneal curvature
    // RGP lens: typically 0.05-0.1mm flatter than flattest K
    
    // Convert K (diopters) to radius (mm): r = 337.5 / K
    const radius = 337.5 / avgK;
    
    if (lensType === 'Soft' || lensType === 'Soft Toric' || lensType === 'Soft Multifocal') {
      return parseFloat((radius + 0.9).toFixed(2)); // 0.9mm flatter for soft lenses
    } else if (lensType === 'RGP' || lensType === 'RGP Toric' || lensType === 'RGP Multifocal') {
      return parseFloat((radius + 0.1).toFixed(2)); // 0.1mm flatter for RGP
    }
    return parseFloat(radius.toFixed(2));
  };

  // Initialize base curves from keratometry if available
  const initializeBaseCurves = () => {
    if (initialData) {
      return {
        OD: initialData.baseCurveOD,
        OS: initialData.baseCurveOS,
      };
    }
    if (keratometryData) {
      const avgKOD = (keratometryData.k1OD + keratometryData.k2OD) / 2;
      const avgKOS = (keratometryData.k1OS + keratometryData.k2OS) / 2;
      return {
        OD: calculateBaseCurve(avgKOD, 'Soft'),
        OS: calculateBaseCurve(avgKOS, 'Soft'),
      };
    }
    return { OD: 8.4, OS: 8.4 }; // Default soft lens BC
  };

  const baseCurves = initializeBaseCurves();

  const [formData, setFormData] = useState<ContactLensData>({
    patientId,
    fittingDate: initialData?.fittingDate || new Date(),
    fitterId: initialData?.fitterId || user?.id || '',

    // Lens Type & Material
    lensType: initialData?.lensType || 'Soft',
    lensMaterial: initialData?.lensMaterial || 'Silicone Hydrogel',
    lensBrand: initialData?.lensBrand || 'Acuvue Oasys',
    wearSchedule: initialData?.wearSchedule || 'Daily Wear',
    replacementSchedule: initialData?.replacementSchedule || 'Daily Disposable',

    // OD Parameters
    baseCurveOD: baseCurves.OD,
    diameterOD: initialData?.diameterOD || 14.0,
    powerOD: initialData?.powerOD || 0,
    cylinderOD: initialData?.cylinderOD || 0,
    axisOD: initialData?.axisOD || 0,
    addPowerOD: initialData?.addPowerOD || 0,

    // OS Parameters
    baseCurveOS: baseCurves.OS,
    diameterOS: initialData?.diameterOS || 14.0,
    powerOS: initialData?.powerOS || 0,
    cylinderOS: initialData?.cylinderOS || 0,
    axisOS: initialData?.axisOS || 0,
    addPowerOS: initialData?.addPowerOS || 0,

    // Fit Assessment
    fitStatus: initialData?.fitStatus || 'Trial Lens Dispensed',
    movementOD: initialData?.movementOD || 'Optimal (1-2mm)',
    movementOS: initialData?.movementOS || 'Optimal (1-2mm)',
    centrationOD: initialData?.centrationOD || 'Centered',
    centrationOS: initialData?.centrationOS || 'Centered',
    coverageOD: initialData?.coverageOD || 'Full coverage',
    coverageOS: initialData?.coverageOS || 'Full coverage',

    // Clinical Assessment
    comfortLevel: initialData?.comfortLevel || 8,
    visionQuality: initialData?.visionQuality || 8,
    overRefractionOD: initialData?.overRefractionOD || 0,
    overRefractionOS: initialData?.overRefractionOS || 0,

    // Patient Education
    insertionTraining: initialData?.insertionTraining || false,
    removalTraining: initialData?.removalTraining || false,
    careInstructions: initialData?.careInstructions || false,
    wearScheduleEducation: initialData?.wearScheduleEducation || false,

    // Complications
    complications: initialData?.complications || [],

    // Follow-up
    nextFollowUpDate: initialData?.nextFollowUpDate,
    followUpSchedule: initialData?.followUpSchedule || '1 Day',

    notes: initialData?.notes || '',
  });

  // Auto-update base curves when lens type changes
  const handleLensTypeChange = (newLensType: string) => {
    if (keratometryData) {
      const avgKOD = (keratometryData.k1OD + keratometryData.k2OD) / 2;
      const avgKOS = (keratometryData.k1OS + keratometryData.k2OS) / 2;
      setFormData({
        ...formData,
        lensType: newLensType,
        baseCurveOD: calculateBaseCurve(avgKOD, newLensType),
        baseCurveOS: calculateBaseCurve(avgKOS, newLensType),
      });
    } else {
      setFormData({
        ...formData,
        lensType: newLensType,
        baseCurveOD: newLensType.includes('RGP') ? 7.8 : 8.4,
        baseCurveOS: newLensType.includes('RGP') ? 7.8 : 8.4,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Determine if advanced parameters should be shown
  const showToricParams = formData.lensType.includes('Toric');
  const showMultifocalParams = formData.lensType.includes('Multifocal');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lens Type & Material Section */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Lens Type & Material
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lens Type</label>
            <select
              value={formData.lensType}
              onChange={(e) => handleLensTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!canEdit}
            >
              <option value="Soft">Soft (Spherical)</option>
              <option value="Soft Toric">Soft Toric (Astigmatism)</option>
              <option value="Soft Multifocal">Soft Multifocal (Presbyopia)</option>
              <option value="RGP">RGP (Rigid Gas Permeable)</option>
              <option value="RGP Toric">RGP Toric</option>
              <option value="RGP Multifocal">RGP Multifocal</option>
              <option value="Hybrid">Hybrid (SynergEyes)</option>
              <option value="Scleral">Scleral Lens</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lens Material</label>
            <select
              value={formData.lensMaterial}
              onChange={(e) => setFormData({ ...formData, lensMaterial: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!canEdit}
            >
              {formData.lensType.includes('RGP') || formData.lensType.includes('Hybrid') ? (
                <>
                  <option value="Boston XO">Boston XO (Dk 100)</option>
                  <option value="Boston XO2">Boston XO2 (Dk 141)</option>
                  <option value="Menicon Z">Menicon Z (Dk 163)</option>
                  <option value="Optimum Extreme">Optimum Extreme (Dk 100)</option>
                  <option value="Paragon HDS">Paragon HDS (Dk 100)</option>
                </>
              ) : (
                <>
                  <option value="Silicone Hydrogel">Silicone Hydrogel (High Dk/t)</option>
                  <option value="Hydrogel">Hydrogel (Standard)</option>
                  <option value="Hydrogel High Water">Hydrogel High Water ({'>'}50%)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lens Brand</label>
            <input
              type="text"
              value={formData.lensBrand}
              onChange={(e) => setFormData({ ...formData, lensBrand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wear Schedule</label>
            <select
              value={formData.wearSchedule}
              onChange={(e) => setFormData({ ...formData, wearSchedule: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!canEdit}
            >
              <option value="Daily Wear">Daily Wear (Remove nightly)</option>
              <option value="Extended Wear">Extended Wear (Up to 7 days)</option>
              <option value="Continuous Wear">Continuous Wear (Up to 30 days)</option>
              <option value="Flexible Wear">Flexible Wear (Occasional overnight)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Replacement Schedule</label>
            <select
              value={formData.replacementSchedule}
              onChange={(e) => setFormData({ ...formData, replacementSchedule: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!canEdit}
            >
              <option value="Daily Disposable">Daily Disposable</option>
              <option value="Bi-Weekly">Bi-Weekly (2 weeks)</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly (3 months)</option>
              <option value="Annual">Annual (RGP typical)</option>
            </select>
          </div>
        </div>
      </div>

      {/* OD (Right Eye) Parameters */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          OD (Right Eye) Lens Parameters
        </h3>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Curve (mm)</label>
            <input
              type="number"
              value={formData.baseCurveOD}
              onChange={(e) => setFormData({ ...formData, baseCurveOD: parseFloat(e.target.value) })}
              step="0.1"
              min="6.0"
              max="10.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              disabled={!canEdit}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.lensType.includes('RGP') ? 'RGP: 7.0-8.5mm' : 'Soft: 8.0-9.0mm'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diameter (mm)</label>
            <input
              type="number"
              value={formData.diameterOD}
              onChange={(e) => setFormData({ ...formData, diameterOD: parseFloat(e.target.value) })}
              step="0.1"
              min="8.0"
              max="16.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              disabled={!canEdit}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.lensType.includes('RGP') ? 'RGP: 9.0-10.0mm' : 'Soft: 13.8-14.5mm'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Power (D)</label>
            <input
              type="number"
              value={formData.powerOD}
              onChange={(e) => setFormData({ ...formData, powerOD: parseFloat(e.target.value) })}
              step="0.25"
              min="-20"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              disabled={!canEdit}
            />
            <p className="text-xs text-gray-500 mt-1">Sphere power</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Over-Refraction (D)</label>
            <input
              type="number"
              value={formData.overRefractionOD}
              onChange={(e) => setFormData({ ...formData, overRefractionOD: parseFloat(e.target.value) })}
              step="0.25"
              min="-5"
              max="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              disabled={!canEdit}
            />
            <p className="text-xs text-gray-500 mt-1">Residual Rx</p>
          </div>

          {/* Toric Parameters */}
          {showToricParams && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cylinder (D)</label>
                <input
                  type="number"
                  value={formData.cylinderOD}
                  onChange={(e) => setFormData({ ...formData, cylinderOD: parseFloat(e.target.value) })}
                  step="0.25"
                  min="-6"
                  max="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Axis (°)</label>
                <input
                  type="number"
                  value={formData.axisOD}
                  onChange={(e) => setFormData({ ...formData, axisOD: parseInt(e.target.value) })}
                  min="0"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  disabled={!canEdit}
                />
              </div>
            </>
          )}

          {/* Multifocal Parameters */}
          {showMultifocalParams && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Power (D)</label>
              <input
                type="number"
                value={formData.addPowerOD}
                onChange={(e) => setFormData({ ...formData, addPowerOD: parseFloat(e.target.value) })}
                step="0.25"
                min="0"
                max="3.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                disabled={!canEdit}
              />
            </div>
          )}
        </div>

        {/* OD Fit Assessment */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">Fit Assessment (OD)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Movement</label>
              <select
                value={formData.movementOD}
                onChange={(e) => setFormData({ ...formData, movementOD: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!canEdit}
              >
                <option value="Minimal (<0.5mm)">Minimal (&lt;0.5mm) - Too tight</option>
                <option value="Optimal (1-2mm)">Optimal (1-2mm) - Good fit</option>
                <option value="Excessive (>3mm)">Excessive (&gt;3mm) - Too loose</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Centration</label>
              <select
                value={formData.centrationOD}
                onChange={(e) => setFormData({ ...formData, centrationOD: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!canEdit}
              >
                <option value="Centered">Centered</option>
                <option value="Decentered Superior">Decentered Superior</option>
                <option value="Decentered Inferior">Decentered Inferior</option>
                <option value="Decentered Temporal">Decentered Temporal</option>
                <option value="Decentered Nasal">Decentered Nasal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coverage</label>
              <select
                value={formData.coverageOD}
                onChange={(e) => setFormData({ ...formData, coverageOD: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!canEdit}
              >
                <option value="Full coverage">Full coverage</option>
                <option value="Partial coverage">Partial coverage</option>
                <option value="Limbal edge visible">Limbal edge visible</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* OS (Left Eye) Parameters */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          OS (Left Eye) Lens Parameters
        </h3>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Curve (mm)</label>
            <input
              type="number"
              value={formData.baseCurveOS}
              onChange={(e) => setFormData({ ...formData, baseCurveOS: parseFloat(e.target.value) })}
              step="0.1"
              min="6.0"
              max="10.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              disabled={!canEdit}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.lensType.includes('RGP') ? 'RGP: 7.0-8.5mm' : 'Soft: 8.0-9.0mm'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diameter (mm)</label>
            <input
              type="number"
              value={formData.diameterOS}
              onChange={(e) => setFormData({ ...formData, diameterOS: parseFloat(e.target.value) })}
              step="0.1"
              min="8.0"
              max="16.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              disabled={!canEdit}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.lensType.includes('RGP') ? 'RGP: 9.0-10.0mm' : 'Soft: 13.8-14.5mm'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Power (D)</label>
            <input
              type="number"
              value={formData.powerOS}
              onChange={(e) => setFormData({ ...formData, powerOS: parseFloat(e.target.value) })}
              step="0.25"
              min="-20"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              disabled={!canEdit}
            />
            <p className="text-xs text-gray-500 mt-1">Sphere power</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Over-Refraction (D)</label>
            <input
              type="number"
              value={formData.overRefractionOS}
              onChange={(e) => setFormData({ ...formData, overRefractionOS: parseFloat(e.target.value) })}
              step="0.25"
              min="-5"
              max="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              disabled={!canEdit}
            />
            <p className="text-xs text-gray-500 mt-1">Residual Rx</p>
          </div>

          {/* Toric Parameters */}
          {showToricParams && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cylinder (D)</label>
                <input
                  type="number"
                  value={formData.cylinderOS}
                  onChange={(e) => setFormData({ ...formData, cylinderOS: parseFloat(e.target.value) })}
                  step="0.25"
                  min="-6"
                  max="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Axis (°)</label>
                <input
                  type="number"
                  value={formData.axisOS}
                  onChange={(e) => setFormData({ ...formData, axisOS: parseInt(e.target.value) })}
                  min="0"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                  disabled={!canEdit}
                />
              </div>
            </>
          )}

          {/* Multifocal Parameters */}
          {showMultifocalParams && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Power (D)</label>
              <input
                type="number"
                value={formData.addPowerOS}
                onChange={(e) => setFormData({ ...formData, addPowerOS: parseFloat(e.target.value) })}
                step="0.25"
                min="0"
                max="3.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                disabled={!canEdit}
              />
            </div>
          )}
        </div>

        {/* OS Fit Assessment */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <h4 className="text-sm font-semibold text-green-900 mb-3">Fit Assessment (OS)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Movement</label>
              <select
                value={formData.movementOS}
                onChange={(e) => setFormData({ ...formData, movementOS: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!canEdit}
              >
                <option value="Minimal (<0.5mm)">Minimal (&lt;0.5mm) - Too tight</option>
                <option value="Optimal (1-2mm)">Optimal (1-2mm) - Good fit</option>
                <option value="Excessive (>3mm)">Excessive (&gt;3mm) - Too loose</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Centration</label>
              <select
                value={formData.centrationOS}
                onChange={(e) => setFormData({ ...formData, centrationOS: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!canEdit}
              >
                <option value="Centered">Centered</option>
                <option value="Decentered Superior">Decentered Superior</option>
                <option value="Decentered Inferior">Decentered Inferior</option>
                <option value="Decentered Temporal">Decentered Temporal</option>
                <option value="Decentered Nasal">Decentered Nasal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coverage</label>
              <select
                value={formData.coverageOS}
                onChange={(e) => setFormData({ ...formData, coverageOS: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!canEdit}
              >
                <option value="Full coverage">Full coverage</option>
                <option value="Partial coverage">Partial coverage</option>
                <option value="Limbal edge visible">Limbal edge visible</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Assessment */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Clinical Assessment
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fit Status</label>
            <select
              value={formData.fitStatus}
              onChange={(e) => setFormData({ ...formData, fitStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={!canEdit}
            >
              <option value="Trial Lens Dispensed">Trial Lens Dispensed</option>
              <option value="Successful Fit">Successful Fit</option>
              <option value="Re-fit Required">Re-fit Required</option>
              <option value="Not Suitable for CL">Not Suitable for Contact Lenses</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comfort Level (1-10)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                value={formData.comfortLevel}
                onChange={(e) => setFormData({ ...formData, comfortLevel: parseInt(e.target.value) })}
                min="1"
                max="10"
                className="flex-1"
                disabled={!canEdit}
              />
              <span className="text-lg font-bold text-orange-900 w-8">{formData.comfortLevel}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.comfortLevel >= 8
                ? 'Excellent'
                : formData.comfortLevel >= 6
                ? 'Good'
                : formData.comfortLevel >= 4
                ? 'Fair'
                : 'Poor'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vision Quality (1-10)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                value={formData.visionQuality}
                onChange={(e) => setFormData({ ...formData, visionQuality: parseInt(e.target.value) })}
                min="1"
                max="10"
                className="flex-1"
                disabled={!canEdit}
              />
              <span className="text-lg font-bold text-orange-900 w-8">{formData.visionQuality}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.visionQuality >= 8
                ? 'Excellent'
                : formData.visionQuality >= 6
                ? 'Good'
                : formData.visionQuality >= 4
                ? 'Fair'
                : 'Poor'}
            </p>
          </div>
        </div>
      </div>

      {/* Complications Tracker */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Complications Tracker
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            'GPC (Giant Papillary Conjunctivitis)',
            'Corneal Infiltrates',
            'Corneal Ulcer',
            'Dry Eye Syndrome',
            'Over-wear Syndrome',
            'Protein Deposits',
            'Lipid Deposits',
            'Neovascularization',
            'Corneal Edema',
            'Allergic Reaction',
            'Red Eye (CLARE)',
            'Microbial Keratitis',
          ].map((complication) => (
            <label key={complication} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.complications.includes(complication)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      complications: [...formData.complications, complication],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      complications: formData.complications.filter((c) => c !== complication),
                    });
                  }
                }}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                disabled={!canEdit}
              />
              <span className="text-sm text-gray-700">{complication}</span>
            </label>
          ))}
        </div>

        {formData.complications.length > 0 && (
          <div className="mt-4 bg-white border-2 border-red-300 rounded-md p-3">
            <p className="text-sm font-semibold text-red-900 mb-2">
              ⚠️ {formData.complications.length} Complication(s) Detected
            </p>
            <p className="text-xs text-red-700">
              Immediate action required. Consider discontinuing lens wear, prescribing treatment, or
              referring to specialist.
            </p>
          </div>
        )}
      </div>

      {/* Patient Education */}
      <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Patient Education & Training
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.insertionTraining}
              onChange={(e) => setFormData({ ...formData, insertionTraining: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700 font-medium">Insertion Training Completed</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.removalTraining}
              onChange={(e) => setFormData({ ...formData, removalTraining: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700 font-medium">Removal Training Completed</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.careInstructions}
              onChange={(e) => setFormData({ ...formData, careInstructions: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700 font-medium">Care Instructions Provided</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.wearScheduleEducation}
              onChange={(e) => setFormData({ ...formData, wearScheduleEducation: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700 font-medium">Wear Schedule Explained</span>
          </label>
        </div>

        {(!formData.insertionTraining ||
          !formData.removalTraining ||
          !formData.careInstructions ||
          !formData.wearScheduleEducation) && (
          <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-md p-3">
            <p className="text-sm font-semibold text-yellow-900">
              ⚠️ Patient Education Incomplete
            </p>
            <p className="text-xs text-yellow-700">
              Ensure all training checkboxes are completed before dispensing contact lenses.
            </p>
          </div>
        )}
      </div>

      {/* Follow-up Schedule */}
      <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-teal-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Follow-up Schedule
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Schedule</label>
            <select
              value={formData.followUpSchedule}
              onChange={(e) => setFormData({ ...formData, followUpSchedule: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={!canEdit}
            >
              <option value="1 Day">1 Day (Initial fit check)</option>
              <option value="1 Week">1 Week</option>
              <option value="1 Month">1 Month</option>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months (Annual check)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Next Follow-up Date</label>
            <input
              type="date"
              value={
                formData.nextFollowUpDate instanceof Date
                  ? formData.nextFollowUpDate.toISOString().split('T')[0]
                  : formData.nextFollowUpDate
                  ? new Date(formData.nextFollowUpDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => setFormData({ ...formData, nextFollowUpDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="mt-4 bg-white border border-teal-200 rounded-md p-3">
          <p className="text-sm font-semibold text-teal-900 mb-2">Follow-up Protocol:</p>
          <ul className="text-xs text-teal-800 space-y-1 list-disc list-inside">
            <li>1 Day: Check fit, comfort, vision, lens handling</li>
            <li>1 Week: Assess adaptation, wearing time, ocular health</li>
            <li>1 Month: Full evaluation, lens condition, compliance</li>
            <li>3-6 Months: Routine monitoring, annual comprehensive exam</li>
          </ul>
        </div>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!canEdit}
        />
      </div>

      {/* Clinical Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Contact Lens Fitting Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                <strong>Base Curve Selection:</strong> Soft lenses 0.8-1.0mm flatter than K. RGP lenses
                0.05-0.1mm flatter than flattest K. Steep fit = minimal movement, flat fit = excessive
                movement.
              </li>
              <li>
                <strong>Optimal Movement:</strong> Soft lenses 1-2mm, RGP lenses 1-1.5mm on blink. Assess
                with push-up test and blink test. Centration critical for toric and multifocal lenses.
              </li>
              <li>
                <strong>Toric Lens Stability:</strong> Check axis orientation with slit lamp. Rotate lens to
                verify return to position. Acceptable rotation ≤5°. Consider prism ballast or thin zones for
                stabilization.
              </li>
              <li>
                <strong>Multifocal Success Factors:</strong> Manage expectations (adaptation 1-2 weeks). Add
                power starts +0.75 to +1.00D (age 40-45), increases with age. Simultaneous vs alternating
                designs.
              </li>
              <li>
                <strong>Red Flags:</strong> Corneal staining (tight lens, hypoxia), limbal injection
                (neovascularization), mucus discharge (GPC), blurred vision (over-refraction needed),
                excessive tearing (allergy).
              </li>
              <li>
                <strong>Follow-up Schedule:</strong> New fits: 1 day, 1 week, 1 month. Established wearers:
                Annual comprehensive exam. GPC/complications: More frequent monitoring until resolved.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, fitStatus: 'Trial Lens Dispensed' })}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          >
            Save as Trial
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Save Contact Lens Data
          </button>
        </div>
      )}
    </form>
  );
}
