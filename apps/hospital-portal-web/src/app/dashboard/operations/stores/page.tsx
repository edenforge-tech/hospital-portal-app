'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Plus,
  Search,
  Package,
  Box,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Eye,
  Edit,
  Download,
  Upload,
  Filter,
  ArrowUpDown,
  Pill,
  Glasses,
  Activity,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'iols' | 'consumables' | 'equipment' | 'medications' | 'optical';
  subcategory: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  location: string;
  expiryDate?: string;
  lastReceived: string;
  status: 'adequate' | 'low' | 'critical' | 'out-of-stock';
}

interface IOLInventory {
  id: string;
  manufacturer: string;
  model: string;
  power: string;
  type: 'monofocal' | 'multifocal' | 'toric' | 'extended-depth';
  material: string;
  quantity: number;
  lotNumber: string;
  expiryDate: string;
  price: number;
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Phaco Cassettes (Alcon)',
    category: 'consumables',
    subcategory: 'Surgical Consumables',
    sku: 'PH-CAS-001',
    currentStock: 45,
    reorderLevel: 20,
    maxStock: 100,
    unit: 'pcs',
    unitPrice: 2500,
    supplier: 'Alcon India',
    location: 'Store A - Shelf 3',
    lastReceived: '2026-01-15',
    status: 'adequate',
  },
  {
    id: '2',
    name: 'Viscoelastic (Healon)',
    category: 'consumables',
    subcategory: 'OVD',
    sku: 'VE-HEA-001',
    currentStock: 12,
    reorderLevel: 15,
    maxStock: 50,
    unit: 'vials',
    unitPrice: 3500,
    supplier: 'Johnson & Johnson',
    location: 'Cold Storage',
    expiryDate: '2026-06-30',
    lastReceived: '2026-01-10',
    status: 'low',
  },
  {
    id: '3',
    name: 'Diamond Knife 3.0mm',
    category: 'equipment',
    subcategory: 'Surgical Instruments',
    sku: 'DK-300-001',
    currentStock: 3,
    reorderLevel: 2,
    maxStock: 10,
    unit: 'pcs',
    unitPrice: 45000,
    supplier: 'Katena',
    location: 'OT Store',
    lastReceived: '2025-12-01',
    status: 'adequate',
  },
  {
    id: '4',
    name: 'Tropicamide 1% Eye Drops',
    category: 'medications',
    subcategory: 'Mydriatics',
    sku: 'MD-TRO-001',
    currentStock: 5,
    reorderLevel: 20,
    maxStock: 100,
    unit: 'bottles',
    unitPrice: 85,
    supplier: 'Sun Pharma',
    location: 'Pharmacy Store',
    expiryDate: '2026-12-31',
    lastReceived: '2026-01-20',
    status: 'critical',
  },
];

const mockIOLs: IOLInventory[] = [
  {
    id: '1',
    manufacturer: 'Alcon',
    model: 'SN60WF (AcrySof IQ)',
    power: '+21.0D',
    type: 'monofocal',
    material: 'Hydrophobic Acrylic',
    quantity: 5,
    lotNumber: 'LOT-2024-A001',
    expiryDate: '2027-06-30',
    price: 8500,
  },
  {
    id: '2',
    manufacturer: 'Alcon',
    model: 'SN60WF (AcrySof IQ)',
    power: '+22.0D',
    type: 'monofocal',
    material: 'Hydrophobic Acrylic',
    quantity: 8,
    lotNumber: 'LOT-2024-A002',
    expiryDate: '2027-06-30',
    price: 8500,
  },
  {
    id: '3',
    manufacturer: 'Johnson & Johnson',
    model: 'Tecnis ZCB00',
    power: '+20.5D',
    type: 'monofocal',
    material: 'Hydrophobic Acrylic',
    quantity: 3,
    lotNumber: 'LOT-2024-J001',
    expiryDate: '2027-08-15',
    price: 9000,
  },
  {
    id: '4',
    manufacturer: 'Alcon',
    model: 'PanOptix TFNT00',
    power: '+21.5D',
    type: 'multifocal',
    material: 'Hydrophobic Acrylic',
    quantity: 2,
    lotNumber: 'LOT-2024-A003',
    expiryDate: '2027-06-30',
    price: 45000,
  },
  {
    id: '5',
    manufacturer: 'Alcon',
    model: 'AcrySof Toric SN6AT',
    power: '+22.0D / Cyl 1.5D',
    type: 'toric',
    material: 'Hydrophobic Acrylic',
    quantity: 4,
    lotNumber: 'LOT-2024-A004',
    expiryDate: '2027-05-30',
    price: 25000,
  },
];

const categoryColors: Record<InventoryItem['category'], string> = {
  iols: 'bg-purple-100 text-purple-800',
  consumables: 'bg-blue-100 text-blue-800',
  equipment: 'bg-gray-100 text-gray-800',
  medications: 'bg-green-100 text-green-800',
  optical: 'bg-amber-100 text-amber-800',
};

const statusColors: Record<InventoryItem['status'], string> = {
  adequate: 'bg-green-100 text-green-800',
  low: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-orange-100 text-orange-800',
  'out-of-stock': 'bg-red-100 text-red-800',
};

const iolTypeColors: Record<IOLInventory['type'], string> = {
  monofocal: 'bg-blue-100 text-blue-800',
  multifocal: 'bg-purple-100 text-purple-800',
  toric: 'bg-amber-100 text-amber-800',
  'extended-depth': 'bg-teal-100 text-teal-800',
};

export default function StoresPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [iols, setIOLs] = useState<IOLInventory[]>(mockIOLs);
  const [activeTab, setActiveTab] = useState<'general' | 'iols' | 'medications'>('general');
  const [categoryFilter, setCategoryFilter] = useState<InventoryItem['category'] | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<InventoryItem['status'] | 'ALL'>('ALL');

  const statistics = {
    totalItems: inventory.length,
    lowStockItems: inventory.filter(i => i.status === 'low' || i.status === 'critical').length,
    outOfStock: inventory.filter(i => i.status === 'out-of-stock').length,
    totalIOLs: iols.reduce((sum, iol) => sum + iol.quantity, 0),
    inventoryValue: inventory.reduce((sum, i) => sum + (i.currentStock * i.unitPrice), 0),
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredIOLs = iols.filter(iol =>
    iol.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    iol.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    iol.power.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermission="OPERATIONS:STORES:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              Stores & Inventory Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage surgical consumables, IOLs, equipment, and medications inventory
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/operations/stores/purchase-order')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="h-5 w-5" />
              Purchase Order
            </button>
            <button
              onClick={() => router.push('/dashboard/operations/stores/receive')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              Receive Stock
            </button>
            <button
              onClick={() => router.push('/dashboard/operations/stores/new')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Item
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Items</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-900">{statistics.lowStockItems}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-red-900">{statistics.outOfStock}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">IOLs in Stock</p>
                <p className="text-2xl font-bold text-purple-900">{statistics.totalIOLs}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Inventory Value</p>
                <p className="text-2xl font-bold text-green-900">₹{(statistics.inventoryValue / 100000).toFixed(1)}L</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Box className="h-4 w-4 inline mr-2" />
                General Inventory
              </button>
              <button
                onClick={() => setActiveTab('iols')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'iols'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                IOL Inventory
              </button>
              <button
                onClick={() => setActiveTab('medications')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'medications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Pill className="h-4 w-4 inline mr-2" />
                Medications
              </button>
            </nav>
          </div>

          <div className="p-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search items, SKU, supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {activeTab === 'general' && (
                <>
                  <div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="consumables">Consumables</option>
                      <option value="equipment">Equipment</option>
                      <option value="medications">Medications</option>
                      <option value="optical">Optical</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Status</option>
                      <option value="adequate">Adequate</option>
                      <option value="low">Low Stock</option>
                      <option value="critical">Critical</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                </>
              )}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>

            {/* General Inventory Tab */}
            {activeTab === 'general' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Item / SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.sku}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[item.category]}`}>
                            {item.subcategory}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {item.currentStock} {item.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Reorder: {item.reorderLevel}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                item.currentStock > item.reorderLevel
                                  ? 'bg-green-500'
                                  : item.currentStock > 0
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, (item.currentStock / item.maxStock) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.supplier}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/operations/stores/${item.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/operations/stores/${item.id}/edit`)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* IOL Inventory Tab */}
            {activeTab === 'iols' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Manufacturer / Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Power
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Lot Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Expiry
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIOLs.map((iol) => (
                      <tr key={iol.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{iol.manufacturer}</div>
                            <div className="text-sm text-gray-600">{iol.model}</div>
                            <div className="text-xs text-gray-500">{iol.material}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{iol.power}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${iolTypeColors[iol.type]}`}>
                            {iol.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-900">{iol.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{iol.lotNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{iol.expiryDate}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          ₹{iol.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === 'medications' && (
              <div className="p-8 text-center">
                <Pill className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Medication Inventory</h3>
                <p className="text-gray-600 mb-4">View and manage eye drops, ointments, and oral medications</p>
                <button
                  onClick={() => router.push('/dashboard/pharmacy')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Go to Pharmacy Module
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
