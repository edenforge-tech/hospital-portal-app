'use client';

import { useState, useEffect } from 'react';
import { Eye, Glasses, Package, DollarSign, Info, ShoppingCart, Truck } from 'lucide-react';
import { SpectacleDispensingData, RefractionData } from '@/lib/stores/clinical-store';
import { useAuthStore } from '@/lib/auth-store';

interface SpectacleDispensingFormProps {
  patientId: string;
  initialData?: SpectacleDispensingData;
  refractionData?: RefractionData;
  onSave: (data: SpectacleDispensingData) => void;
  canEdit: boolean;
}

export default function SpectacleDispensingForm({
  patientId,
  initialData,
  refractionData,
  onSave,
  canEdit,
}: SpectacleDispensingFormProps) {
  const { user } = useAuthStore();

  // Initialize prescription from refraction data if available
  const initializePrescription = () => {
    if (initialData) {
      return {
        OD: initialData.prescriptionOD,
        OS: initialData.prescriptionOS,
        PD: initialData.pupillaryDistance || 63,
      };
    }
    if (refractionData) {
      return {
        OD: {
          sphere: refractionData.finalRxOD.sphere,
          cylinder: refractionData.finalRxOD.cylinder,
          axis: refractionData.finalRxOD.axis,
          add: refractionData.nearAddOD || 0,
        },
        OS: {
          sphere: refractionData.finalRxOS.sphere,
          cylinder: refractionData.finalRxOS.cylinder,
          axis: refractionData.finalRxOS.axis,
          add: refractionData.nearAddOS || 0,
        },
        PD: 63, // Default PD
      };
    }
    return {
      OD: { sphere: 0, cylinder: 0, axis: 0, add: 0 },
      OS: { sphere: 0, cylinder: 0, axis: 0, add: 0 },
      PD: 63,
    };
  };

  const prescription = initializePrescription();

  const [formData, setFormData] = useState<SpectacleDispensingData>({
    patientId,
    dispensingDate: initialData?.dispensingDate || new Date(),
    dispenserId: initialData?.dispenserId || user?.id || '',
    
    // Prescription
    prescriptionOD: prescription.OD,
    prescriptionOS: prescription.OS,
    pupillaryDistance: prescription.PD,
    
    // Frame Selection
    frameType: initialData?.frameType || 'Full Rim',
    frameMaterial: initialData?.frameMaterial || 'Metal',
    frameModel: initialData?.frameModel || '',
    frameColor: initialData?.frameColor || '',
    frameSize: initialData?.frameSize || 'Medium (52-54mm)',
    frameCost: initialData?.frameCost || 0,
    
    // Lens Options
    lensType: initialData?.lensType || 'Single Vision',
    lensMaterial: initialData?.lensMaterial || 'CR-39 Plastic',
    lensIndex: initialData?.lensIndex || '1.50 (Standard)',
    antiReflective: initialData?.antiReflective || false,
    photochromic: initialData?.photochromic || false,
    polarized: initialData?.polarized || false,
    blueLight: initialData?.blueLight || false,
    scratchResistant: initialData?.scratchResistant || true,
    uvProtection: initialData?.uvProtection || true,
    lensCost: initialData?.lensCost || 0,
    
    // Pricing
    totalCost: initialData?.totalCost || 0,
    insuranceCovered: initialData?.insuranceCovered || false,
    amountPaid: initialData?.amountPaid || 0,
    
    // Order Tracking
    orderStatus: initialData?.orderStatus || 'Quote',
    orderDate: initialData?.orderDate,
    expectedDeliveryDate: initialData?.expectedDeliveryDate,
    actualDeliveryDate: initialData?.actualDeliveryDate,
    
    notes: initialData?.notes || '',
  });

  // Pricing configuration
  const pricing = {
    frames: {
      'Budget Line': 50,
      'Standard Line': 100,
      'Premium Line': 200,
      'Designer Line': 350,
    },
    lensTypes: {
      'Single Vision': 100,
      'Bifocal': 150,
      'Progressive (Standard)': 250,
      'Progressive (Premium)': 400,
      'Progressive (Digital HD)': 550,
    },
    lensIndex: {
      '1.50 (Standard)': 0,
      '1.56 (Mid-Index)': 30,
      '1.60 (Thin)': 60,
      '1.67 (Ultra-Thin)': 100,
      '1.74 (Super-Thin)': 150,
    },
    coatings: {
      antiReflective: 50,
      photochromic: 80,
      polarized: 100,
      blueLight: 40,
      scratchResistant: 20,
      uvProtection: 0, // Usually included
    },
  };

  // Auto-calculate total cost
  useEffect(() => {
    let total = formData.frameCost + formData.lensCost;
    
    // Add coating costs
    if (formData.antiReflective) total += pricing.coatings.antiReflective;
    if (formData.photochromic) total += pricing.coatings.photochromic;
    if (formData.polarized) total += pricing.coatings.polarized;
    if (formData.blueLight) total += pricing.coatings.blueLight;
    if (formData.scratchResistant) total += pricing.coatings.scratchResistant;
    
    setFormData((prev) => ({ ...prev, totalCost: total }));
  }, [
    formData.frameCost,
    formData.lensCost,
    formData.antiReflective,
    formData.photochromic,
    formData.polarized,
    formData.blueLight,
    formData.scratchResistant,
  ]);

  // Update lens cost when lens type or index changes
  const updateLensCost = (lensType: string, lensIndex: string) => {
    const baseCost = pricing.lensTypes[lensType as keyof typeof pricing.lensTypes] || 100;
    const indexCost = pricing.lensIndex[lensIndex as keyof typeof pricing.lensIndex] || 0;
    setFormData((prev) => ({ ...prev, lensCost: baseCost + indexCost }));
  };

  useEffect(() => {
    updateLensCost(formData.lensType, formData.lensIndex);
  }, [formData.lensType, formData.lensIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Format prescription display
  const formatRx = (rx: { sphere: number; cylinder: number; axis: number; add?: number }) => {
    let formatted = '';
    
    // Sphere
    formatted += rx.sphere >= 0 ? `+${rx.sphere.toFixed(2)}` : `${rx.sphere.toFixed(2)}`;
    
    // Cylinder and axis
    if (rx.cylinder !== 0) {
      formatted += ` / ${rx.cylinder >= 0 ? '+' : ''}${rx.cylinder.toFixed(2)} × ${rx.axis}°`;
    } else {
      formatted += ' DS'; // Diopter Sphere (no cylinder)
    }
    
    // Add power (for bifocals/progressives)
    if (rx.add && rx.add > 0) {
      formatted += ` | Add: +${rx.add.toFixed(2)}`;
    }
    
    return formatted;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prescription Section */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Prescription Details
        </h3>

        {/* Prescription Display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">OD (Right Eye)</h4>
            <p className="font-mono text-sm text-blue-900">{formatRx(formData.prescriptionOD)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
            <h4 className="text-sm font-semibold text-green-900 mb-2">OS (Left Eye)</h4>
            <p className="font-mono text-sm text-green-900">{formatRx(formData.prescriptionOS)}</p>
          </div>
        </div>

        {/* Manual Prescription Entry */}
        <details className="bg-white rounded-lg border border-purple-200 p-4">
          <summary className="cursor-pointer font-semibold text-sm text-purple-900">
            Edit Prescription (Click to expand)
          </summary>
          <div className="mt-4 space-y-4">
            {/* OD Entry */}
            <div>
              <h5 className="text-sm font-semibold text-blue-900 mb-2">OD (Right Eye)</h5>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sphere</label>
                  <input
                    type="number"
                    value={formData.prescriptionOD.sphere}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prescriptionOD: { ...formData.prescriptionOD, sphere: parseFloat(e.target.value) },
                      })
                    }
                    step="0.25"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cylinder</label>
                  <input
                    type="number"
                    value={formData.prescriptionOD.cylinder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prescriptionOD: { ...formData.prescriptionOD, cylinder: parseFloat(e.target.value) },
                      })
                    }
                    step="0.25"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Axis (°)</label>
                  <input
                    type="number"
                    value={formData.prescriptionOD.axis}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prescriptionOD: { ...formData.prescriptionOD, axis: parseInt(e.target.value) },
                      })
                    }
                    min="0"
                    max="180"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Add</label>
                  <input
                    type="number"
                    value={formData.prescriptionOD.add || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prescriptionOD: { ...formData.prescriptionOD, add: parseFloat(e.target.value) },
                      })
                    }
                    step="0.25"
                    min="0"
                    max="3.5"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>

            {/* OS Entry */}
            <div>
              <h5 className="text-sm font-semibold text-green-900 mb-2">OS (Left Eye)</h5>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sphere</label>
                  <input
                    type="number"
                    value={formData.prescriptionOS.sphere}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prescriptionOS: { ...formData.prescriptionOS, sphere: parseFloat(e.target.value) },
                      })
                    }
                    step="0.25"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cylinder</label>
                  <input
                    type="number"
                    value={formData.prescriptionOS.cylinder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prescriptionOS: { ...formData.prescriptionOS, cylinder: parseFloat(e.target.value) },
                      })
                    }
                    step="0.25"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Axis (°)</label>
                  <input
                    type="number"
                    value={formData.prescriptionOS.axis}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prescriptionOS: { ...formData.prescriptionOS, axis: parseInt(e.target.value) },
                      })
                    }
                    min="0"
                    max="180"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Add</label>
                  <input
                    type="number"
                    value={formData.prescriptionOS.add || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prescriptionOS: { ...formData.prescriptionOS, add: parseFloat(e.target.value) },
                      })
                    }
                    step="0.25"
                    min="0"
                    max="3.5"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>

            {/* PD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pupillary Distance (PD) - mm
              </label>
              <input
                type="number"
                value={formData.pupillaryDistance}
                onChange={(e) => setFormData({ ...formData, pupillaryDistance: parseFloat(e.target.value) })}
                step="0.5"
                min="50"
                max="75"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                disabled={!canEdit}
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 58-68 mm (average ~63 mm)</p>
            </div>
          </div>
        </details>
      </div>

      {/* Frame Selection */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
          <Glasses className="w-5 h-5 mr-2" />
          Frame Selection
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frame Type</label>
            <select
              value={formData.frameType}
              onChange={(e) => setFormData({ ...formData, frameType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={!canEdit}
            >
              <option value="Full Rim">Full Rim (Classic)</option>
              <option value="Semi-Rimless">Semi-Rimless (Top only)</option>
              <option value="Rimless">Rimless (Minimalist)</option>
              <option value="Browline">Browline (Retro)</option>
              <option value="Aviator">Aviator (Sunglasses style)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frame Material</label>
            <select
              value={formData.frameMaterial}
              onChange={(e) => setFormData({ ...formData, frameMaterial: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={!canEdit}
            >
              <option value="Metal">Metal (Lightweight)</option>
              <option value="Titanium">Titanium (Premium, hypoallergenic)</option>
              <option value="Acetate">Acetate (Plastic, durable)</option>
              <option value="TR90">TR90 (Flexible, sports)</option>
              <option value="Stainless Steel">Stainless Steel (Corrosion-resistant)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frame Size</label>
            <select
              value={formData.frameSize}
              onChange={(e) => setFormData({ ...formData, frameSize: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={!canEdit}
            >
              <option value="Small (48-50mm)">Small (48-50mm)</option>
              <option value="Medium (52-54mm)">Medium (52-54mm)</option>
              <option value="Large (56-58mm)">Large (56-58mm)</option>
              <option value="Extra Large (60mm+)">Extra Large (60mm+)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frame Model/Brand</label>
            <input
              type="text"
              value={formData.frameModel}
              onChange={(e) => setFormData({ ...formData, frameModel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frame Color</label>
            <input
              type="text"
              value={formData.frameColor}
              onChange={(e) => setFormData({ ...formData, frameColor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frame Cost ($)</label>
            <input
              type="number"
              value={formData.frameCost}
              onChange={(e) => setFormData({ ...formData, frameCost: parseFloat(e.target.value) })}
              step="10"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              disabled={!canEdit}
            />
          </div>
        </div>

        {/* Frame Price Guide */}
        <div className="mt-4 bg-white rounded-lg border border-orange-200 p-3">
          <p className="text-xs font-semibold text-orange-900 mb-2">Frame Price Guide:</p>
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-700">
            <div>Budget: $50</div>
            <div>Standard: $100</div>
            <div>Premium: $200</div>
            <div>Designer: $350+</div>
          </div>
        </div>
      </div>

      {/* Lens Options */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Lens Options & Coatings
        </h3>

        {/* Lens Type & Material */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lens Type</label>
            <select
              value={formData.lensType}
              onChange={(e) => setFormData({ ...formData, lensType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!canEdit}
            >
              <option value="Single Vision">Single Vision ($100)</option>
              <option value="Bifocal">Bifocal ($150)</option>
              <option value="Progressive (Standard)">Progressive - Standard ($250)</option>
              <option value="Progressive (Premium)">Progressive - Premium ($400)</option>
              <option value="Progressive (Digital HD)">Progressive - Digital HD ($550)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lens Material</label>
            <select
              value={formData.lensMaterial}
              onChange={(e) => setFormData({ ...formData, lensMaterial: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!canEdit}
            >
              <option value="CR-39 Plastic">CR-39 Plastic (Standard)</option>
              <option value="Polycarbonate">Polycarbonate (Impact-resistant)</option>
              <option value="Trivex">Trivex (Lightweight, impact-resistant)</option>
              <option value="High-Index">High-Index (Thin for high Rx)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lens Index (Thickness)</label>
            <select
              value={formData.lensIndex}
              onChange={(e) => setFormData({ ...formData, lensIndex: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!canEdit}
            >
              <option value="1.50 (Standard)">1.50 Standard (+$0)</option>
              <option value="1.56 (Mid-Index)">1.56 Mid-Index (+$30)</option>
              <option value="1.60 (Thin)">1.60 Thin (+$60)</option>
              <option value="1.67 (Ultra-Thin)">1.67 Ultra-Thin (+$100)</option>
              <option value="1.74 (Super-Thin)">1.74 Super-Thin (+$150)</option>
            </select>
          </div>
        </div>

        {/* Coatings & Treatments */}
        <div className="grid grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.antiReflective}
              onChange={(e) => setFormData({ ...formData, antiReflective: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700">Anti-Reflective (+$50)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.photochromic}
              onChange={(e) => setFormData({ ...formData, photochromic: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700">Photochromic/Transitions (+$80)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.polarized}
              onChange={(e) => setFormData({ ...formData, polarized: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700">Polarized (+$100)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.blueLight}
              onChange={(e) => setFormData({ ...formData, blueLight: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700">Blue Light Filter (+$40)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.scratchResistant}
              onChange={(e) => setFormData({ ...formData, scratchResistant: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700">Scratch-Resistant (+$20)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.uvProtection}
              onChange={(e) => setFormData({ ...formData, uvProtection: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={!canEdit}
            />
            <span className="text-sm text-gray-700">UV Protection (Included)</span>
          </label>
        </div>

        {/* Lens Cost Display */}
        <div className="mt-4 bg-white rounded-lg border-2 border-blue-300 p-4">
          <p className="text-sm font-semibold text-blue-900">
            Base Lens Cost: <span className="font-mono">${formData.lensCost.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Pricing Summary
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Frame Cost:</span>
            <span className="font-mono">${formData.frameCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Base Lens Cost:</span>
            <span className="font-mono">${formData.lensCost.toFixed(2)}</span>
          </div>
          {formData.antiReflective && (
            <div className="flex justify-between text-blue-700">
              <span>Anti-Reflective Coating:</span>
              <span className="font-mono">+${pricing.coatings.antiReflective.toFixed(2)}</span>
            </div>
          )}
          {formData.photochromic && (
            <div className="flex justify-between text-blue-700">
              <span>Photochromic/Transitions:</span>
              <span className="font-mono">+${pricing.coatings.photochromic.toFixed(2)}</span>
            </div>
          )}
          {formData.polarized && (
            <div className="flex justify-between text-blue-700">
              <span>Polarized:</span>
              <span className="font-mono">+${pricing.coatings.polarized.toFixed(2)}</span>
            </div>
          )}
          {formData.blueLight && (
            <div className="flex justify-between text-blue-700">
              <span>Blue Light Filter:</span>
              <span className="font-mono">+${pricing.coatings.blueLight.toFixed(2)}</span>
            </div>
          )}
          {formData.scratchResistant && (
            <div className="flex justify-between text-blue-700">
              <span>Scratch-Resistant:</span>
              <span className="font-mono">+${pricing.coatings.scratchResistant.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t-2 border-gray-300 pt-2 mt-2"></div>
          <div className="flex justify-between text-lg font-bold text-green-900">
            <span>Total Cost:</span>
            <span className="font-mono">${formData.totalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.insuranceCovered}
                onChange={(e) => setFormData({ ...formData, insuranceCovered: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                disabled={!canEdit}
              />
              <span className="text-sm font-medium text-gray-700">Insurance Coverage</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid ($)</label>
            <input
              type="number"
              value={formData.amountPaid}
              onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) })}
              step="10"
              min="0"
              max={formData.totalCost}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              disabled={!canEdit}
            />
          </div>
        </div>

        {/* Balance Due */}
        {formData.amountPaid < formData.totalCost && (
          <div className="mt-3 bg-yellow-100 border border-yellow-300 rounded-md p-3">
            <p className="text-sm font-semibold text-yellow-900">
              Balance Due: <span className="font-mono">${(formData.totalCost - formData.amountPaid).toFixed(2)}</span>
            </p>
          </div>
        )}
      </div>

      {/* Order Tracking */}
      <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Order Tracking
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
            <select
              value={formData.orderStatus}
              onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!canEdit}
            >
              <option value="Quote">Quote (Not Ordered)</option>
              <option value="Ordered">Ordered (Sent to Lab)</option>
              <option value="In Progress">In Progress (Being Made)</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Delivered">Delivered to Patient</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
            <input
              type="date"
              value={
                formData.orderDate instanceof Date
                  ? formData.orderDate.toISOString().split('T')[0]
                  : formData.orderDate
                  ? new Date(formData.orderDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => setFormData({ ...formData, orderDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery</label>
            <input
              type="date"
              value={
                formData.expectedDeliveryDate instanceof Date
                  ? formData.expectedDeliveryDate.toISOString().split('T')[0]
                  : formData.expectedDeliveryDate
                  ? new Date(formData.expectedDeliveryDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Actual Delivery</label>
            <input
              type="date"
              value={
                formData.actualDeliveryDate instanceof Date
                  ? formData.actualDeliveryDate.toISOString().split('T')[0]
                  : formData.actualDeliveryDate
                  ? new Date(formData.actualDeliveryDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => setFormData({ ...formData, actualDeliveryDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!canEdit}
            />
          </div>
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
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Spectacle Dispensing Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                <strong>PD Measurement:</strong> Critical for proper lens centration. Measure monocular PD for
                progressive lenses (distance vs near).
              </li>
              <li>
                <strong>Lens Index Selection:</strong> Higher Rx needs higher index (1.67+). Polycarbonate for
                children/sports (impact-resistant).
              </li>
              <li>
                <strong>Progressive Lenses:</strong> Measure segment height. Digital HD progressives have wider fields
                of view. Corridor length varies by frame size.
              </li>
              <li>
                <strong>Anti-Reflective:</strong> Essential for night driving, computer use. Reduces glare and
                improves cosmetics (no reflections).
              </li>
              <li>
                <strong>Photochromic:</strong> Transitions darken outdoors (UV-activated). Does not work in car
                (windshield blocks UV). Consider polarized for driving.
              </li>
              <li>
                <strong>Warranty & Adjustments:</strong> Standard 1-year warranty. Schedule follow-up for frame
                adjustments after 1-2 weeks of wear.
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
            onClick={() => setFormData({ ...formData, orderStatus: 'Quote' })}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          >
            Save as Quote
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Save & Place Order
          </button>
        </div>
      )}
    </form>
  );
}
