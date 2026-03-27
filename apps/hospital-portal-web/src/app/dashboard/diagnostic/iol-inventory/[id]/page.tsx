'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ArrowLeft, Save, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import iolInventoryApi, { IOLInventoryItem, StockAdjustment } from '@/lib/api/iol-inventory.api';

export default function IOLDetailPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [formData, setFormData] = useState<Partial<IOLInventoryItem>>({
    model: '',
    manufacturer: '',
    sku: '',
    type: 'MONOFOCAL',
    material: 'Acrylic',
    aConstant: 118.4,
    powerRangeMin: 10,
    powerRangeMax: 30,
    powerIncrement: 0.5,
    opticDiameter: 6.0,
    overallDiameter: 13.0,
    currentStock: 0,
    minimumStock: 10,
    reorderQuantity: 50,
    unitPrice: 0,
    status: 'active',
  });

  const [stockAdjustment, setStockAdjustment] = useState<{
    quantity: number;
    type: 'ADDITION' | 'USAGE' | 'RETURN' | 'DAMAGE' | 'ADJUSTMENT';
    reason: string;
    batchNumber: string;
  }>({
    quantity: 0,
    type: 'ADDITION',
    reason: '',
    batchNumber: '',
  });

  const [showStockAdjustment, setShowStockAdjustment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchItemData();
    }
  }, [params.id]);

  const fetchItemData = async () => {
    try {
      const data = await iolInventoryApi.getById(params.id as string);
      setFormData(data);
    } catch (error) {
      console.error('Failed to fetch IOL data:', error);
      toast.error('Failed to load IOL data');
    }
  };

  const handleSave = async () => {
    if (!formData.model || !formData.manufacturer || !formData.sku) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        await iolInventoryApi.create(formData);
        toast.success('IOL model created successfully');
      } else {
        await iolInventoryApi.update(params.id as string, formData);
        toast.success('IOL model updated successfully');
      }
      
      router.push('/dashboard/diagnostic/iol-inventory');
    } catch (error) {
      console.error('Failed to save IOL data:', error);
      toast.error('Failed to save IOL data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!stockAdjustment.quantity || !stockAdjustment.reason) {
      toast.error('Please enter quantity and reason');
      return;
    }

    try {
      const adjustmentQuantity = (stockAdjustment.type === 'USAGE' || stockAdjustment.type === 'DAMAGE') 
        ? -stockAdjustment.quantity 
        : stockAdjustment.quantity;

      await iolInventoryApi.adjustStock({
        itemId: params.id as string,
        quantity: adjustmentQuantity,
        type: stockAdjustment.type,
        reason: stockAdjustment.reason,
        batchNumber: stockAdjustment.batchNumber || undefined,
      });

      toast.success('Stock adjusted successfully');
      setShowStockAdjustment(false);
      setStockAdjustment({ quantity: 0, type: 'ADDITION', reason: '', batchNumber: '' });
      fetchItemData(); // Refresh data
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      toast.error('Failed to adjust stock');
    }
  };

  const stockPercentage = formData.minimumStock 
    ? Math.min((formData.currentStock! / (formData.minimumStock * 3)) * 100, 100)
    : 0;

  return (
    <ProtectedRoute requiredPermission="INVENTORY:IOL:EDIT">
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
                <Package className="h-8 w-8 text-blue-600" />
                {isNew ? 'Add IOL Model' : 'Edit IOL Model'}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage IOL specifications and inventory
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {!isNew && (
              <button
                onClick={() => setShowStockAdjustment(!showStockAdjustment)}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <TrendingUp className="h-5 w-5" />
                Adjust Stock
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., AcrySof IQ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select manufacturer</option>
                    <option value="Alcon">Alcon</option>
                    <option value="Johnson & Johnson Vision">Johnson & Johnson Vision</option>
                    <option value="Bausch + Lomb">Bausch + Lomb</option>
                    <option value="Carl Zeiss">Carl Zeiss</option>
                    <option value="Hoya">Hoya</option>
                    <option value="Rayner">Rayner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., SN60WF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IOL Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MONOFOCAL">Monofocal</option>
                    <option value="MULTIFOCAL">Multifocal</option>
                    <option value="TORIC">Toric</option>
                    <option value="EDOF">EDOF (Extended Depth of Focus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Acrylic">Acrylic</option>
                    <option value="Silicone">Silicone</option>
                    <option value="PMMA">PMMA</option>
                    <option value="Hydrophobic">Hydrophobic Acrylic</option>
                    <option value="Hydrophilic">Hydrophilic Acrylic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    A-Constant
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.aConstant}
                    onChange={(e) => setFormData({ ...formData, aConstant: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Optical Properties */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Optical Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Power (D)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.powerRangeMin}
                    onChange={(e) => setFormData({ ...formData, powerRangeMin: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Power (D)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.powerRangeMax}
                    onChange={(e) => setFormData({ ...formData, powerRangeMax: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Power Increment (D)
                  </label>
                  <select
                    value={formData.powerIncrement}
                    onChange={(e) => setFormData({ ...formData, powerIncrement: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0.5">0.5 D</option>
                    <option value="1.0">1.0 D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Optic Diameter (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.opticDiameter}
                    onChange={(e) => setFormData({ ...formData, opticDiameter: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Diameter (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.overallDiameter}
                    onChange={(e) => setFormData({ ...formData, overallDiameter: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Stock Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!isNew}
                  />
                  {!isNew && (
                    <p className="text-xs text-gray-500 mt-1">Use "Adjust Stock" to change current stock</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reorder Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.reorderQuantity}
                    onChange={(e) => setFormData({ ...formData, reorderQuantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Shelf A-3"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional information about this IOL model..."
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Stock Status */}
            {!isNew && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Status</h2>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-900">{formData.currentStock}</p>
                    <p className="text-sm text-gray-600">Units in Stock</p>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${
                        formData.currentStock === 0 ? 'bg-red-600' :
                        formData.currentStock! <= formData.minimumStock! ? 'bg-amber-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${stockPercentage}%` }}
                    ></div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Minimum:</span>
                      <span className="font-medium">{formData.minimumStock} units</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Total Value:</span>
                      <span className="font-medium">${(formData.currentStock! * formData.unitPrice!).toFixed(2)}</span>
                    </div>
                  </div>

                  {formData.currentStock! <= formData.minimumStock! && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm font-semibold">Low Stock Alert</span>
                      </div>
                      <p className="text-amber-700 text-xs mt-1">
                        Stock is below minimum level. Consider reordering {formData.reorderQuantity} units.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stock Adjustment Form */}
            {showStockAdjustment && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjust Stock</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjustment Type
                    </label>
                    <select
                      value={stockAdjustment.type}
                      onChange={(e) => setStockAdjustment({ ...stockAdjustment, type: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ADDITION">Addition (Receive Stock)</option>
                      <option value="USAGE">Usage (Surgery)</option>
                      <option value="DAMAGE">Damage/Loss</option>
                      <option value="RETURN">Return to Supplier</option>
                      <option value="ADJUSTMENT">Manual Adjustment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={stockAdjustment.quantity}
                      onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      value={stockAdjustment.batchNumber}
                      onChange={(e) => setStockAdjustment({ ...stockAdjustment, batchNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason
                    </label>
                    <textarea
                      value={stockAdjustment.reason}
                      onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Reason for adjustment..."
                    />
                  </div>

                  <button
                    onClick={handleStockAdjustment}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit Adjustment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
