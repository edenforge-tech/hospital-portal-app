'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Plus,
  Search,
  Package,
  Thermometer,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  Calendar,
  Eye,
  Edit,
  RefreshCw,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface SterilizationCycle {
  id: string;
  cycleNumber: string;
  autoclave: string;
  startTime: string;
  endTime: string;
  temperature: number;
  pressure: number;
  duration: number;
  status: 'in-progress' | 'completed' | 'failed';
  operator: string;
  items: SterilizedItem[];
  bIndicator: 'pending' | 'passed' | 'failed';
  chemicalIndicator: 'pending' | 'passed' | 'failed';
}

interface SterilizedItem {
  id: string;
  name: string;
  category: 'surgical' | 'ophthalmic' | 'general';
  quantity: number;
  packNumber: string;
  sterilizationDate: string;
  expiryDate: string;
  status: 'sterile' | 'used' | 'expired' | 'recalled';
  cycleId: string;
  location: string;
}

interface InstrumentInventory {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  sterileQuantity: number;
  inUseQuantity: number;
  forSterilization: number;
  lastSterilized: string;
}

const mockCycles: SterilizationCycle[] = [
  {
    id: '1',
    cycleNumber: 'CYC-2026-0128-001',
    autoclave: 'Autoclave-1 (Main)',
    startTime: '2026-01-28T08:00:00',
    endTime: '2026-01-28T08:45:00',
    temperature: 134,
    pressure: 2.1,
    duration: 45,
    status: 'completed',
    operator: 'Ramesh Kumar',
    bIndicator: 'passed',
    chemicalIndicator: 'passed',
    items: [
      {
        id: 'i1',
        name: 'Phaco Handpiece Set',
        category: 'ophthalmic',
        quantity: 2,
        packNumber: 'PKG-001',
        sterilizationDate: '2026-01-28',
        expiryDate: '2026-02-04',
        status: 'sterile',
        cycleId: '1',
        location: 'OT-1 Store',
      },
      {
        id: 'i2',
        name: 'Cataract Surgery Kit',
        category: 'surgical',
        quantity: 5,
        packNumber: 'PKG-002',
        sterilizationDate: '2026-01-28',
        expiryDate: '2026-02-04',
        status: 'sterile',
        cycleId: '1',
        location: 'OT-1 Store',
      },
    ],
  },
  {
    id: '2',
    cycleNumber: 'CYC-2026-0128-002',
    autoclave: 'Autoclave-2 (Flash)',
    startTime: '2026-01-28T10:30:00',
    endTime: '',
    temperature: 134,
    pressure: 2.1,
    duration: 30,
    status: 'in-progress',
    operator: 'Suresh Yadav',
    bIndicator: 'pending',
    chemicalIndicator: 'pending',
    items: [
      {
        id: 'i3',
        name: 'Vitrectomy Probe Set',
        category: 'ophthalmic',
        quantity: 3,
        packNumber: 'PKG-003',
        sterilizationDate: '2026-01-28',
        expiryDate: '2026-02-04',
        status: 'sterile',
        cycleId: '2',
        location: 'Processing',
      },
    ],
  },
];

const mockInventory: InstrumentInventory[] = [
  {
    id: '1',
    name: 'Phaco Handpiece Set',
    category: 'Ophthalmic - Cataract',
    totalQuantity: 10,
    sterileQuantity: 6,
    inUseQuantity: 2,
    forSterilization: 2,
    lastSterilized: '2026-01-28',
  },
  {
    id: '2',
    name: 'Vitrectomy Instrument Set',
    category: 'Ophthalmic - Retina',
    totalQuantity: 5,
    sterileQuantity: 3,
    inUseQuantity: 1,
    forSterilization: 1,
    lastSterilized: '2026-01-27',
  },
  {
    id: '3',
    name: 'Basic Eye Tray',
    category: 'Ophthalmic - General',
    totalQuantity: 20,
    sterileQuantity: 12,
    inUseQuantity: 4,
    forSterilization: 4,
    lastSterilized: '2026-01-28',
  },
  {
    id: '4',
    name: 'Glaucoma Surgery Set',
    category: 'Ophthalmic - Glaucoma',
    totalQuantity: 6,
    sterileQuantity: 4,
    inUseQuantity: 1,
    forSterilization: 1,
    lastSterilized: '2026-01-27',
  },
];

const statusColors = {
  'in-progress': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const indicatorColors = {
  pending: 'bg-gray-100 text-gray-800',
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const itemStatusColors = {
  sterile: 'bg-green-100 text-green-800',
  used: 'bg-blue-100 text-blue-800',
  expired: 'bg-red-100 text-red-800',
  recalled: 'bg-orange-100 text-orange-800',
};

export default function CSSDPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cycles, setCycles] = useState<SterilizationCycle[]>(mockCycles);
  const [inventory, setInventory] = useState<InstrumentInventory[]>(mockInventory);
  const [activeTab, setActiveTab] = useState<'cycles' | 'inventory' | 'expiring'>('cycles');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'in-progress' | 'completed' | 'failed'>('ALL');

  const statistics = {
    todayCycles: cycles.filter(c => c.startTime.startsWith('2026-01-28')).length,
    activeCycles: cycles.filter(c => c.status === 'in-progress').length,
    totalSterileItems: inventory.reduce((sum, i) => sum + i.sterileQuantity, 0),
    pendingSterilization: inventory.reduce((sum, i) => sum + i.forSterilization, 0),
    expiringItems: 8, // Mock number
  };

  const filteredCycles = cycles.filter(cycle => {
    const matchesSearch =
      cycle.cycleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cycle.autoclave.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || cycle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute requiredPermission="OPERATIONS:CSSD:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Thermometer className="h-8 w-8 text-blue-600" />
              CSSD - Sterilization Management
            </h1>
            <p className="text-gray-600 mt-1">
              Central Sterile Services Department - Track instrument sterilization cycles
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/operations/cssd/inventory')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Package className="h-5 w-5" />
              Inventory
            </button>
            <button
              onClick={() => router.push('/dashboard/operations/cssd/new-cycle')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Sterilization Cycle
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Today's Cycles</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.todayCycles}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Active Cycles</p>
                <p className="text-2xl font-bold text-yellow-900">{statistics.activeCycles}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Sterile Items</p>
                <p className="text-2xl font-bold text-green-900">{statistics.totalSterileItems}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">For Sterilization</p>
                <p className="text-2xl font-bold text-orange-900">{statistics.pendingSterilization}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Expiring Soon</p>
                <p className="text-2xl font-bold text-red-900">{statistics.expiringItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('cycles')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'cycles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Sterilization Cycles
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Instrument Inventory
              </button>
              <button
                onClick={() => setActiveTab('expiring')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'expiring'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Expiring Items
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
                    placeholder="Search cycle number, autoclave..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {activeTab === 'cycles' && (
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              )}
            </div>

            {/* Cycles Tab Content */}
            {activeTab === 'cycles' && (
              <div className="space-y-4">
                {filteredCycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cycle.cycleNumber}</h3>
                        <p className="text-sm text-gray-600">{cycle.autoclave}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[cycle.status]}`}>
                        {cycle.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Temperature</p>
                        <p className="font-medium text-gray-900">{cycle.temperature}°C</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pressure</p>
                        <p className="font-medium text-gray-900">{cycle.pressure} bar</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900">{cycle.duration} mins</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">B-Indicator</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${indicatorColors[cycle.bIndicator]}`}>
                          {cycle.bIndicator}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Chemical Indicator</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${indicatorColors[cycle.chemicalIndicator]}`}>
                          {cycle.chemicalIndicator}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <p className="text-xs text-gray-500 mb-2">Items in Cycle ({cycle.items.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {cycle.items.map((item) => (
                          <span
                            key={item.id}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                          >
                            {item.name} (x{item.quantity})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">Operator: {cycle.operator}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/operations/cssd/cycle/${cycle.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                          <FileText className="h-4 w-4" />
                          Print Label
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inventory Tab Content */}
            {activeTab === 'inventory' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Instrument
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Sterile
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        In Use
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        For Sterilization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Sterilized
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          {item.totalQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-green-600">{item.sterileQuantity}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-blue-600">{item.inUseQuantity}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-orange-600">{item.forSterilization}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.lastSterilized}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Expiring Tab Content */}
            {activeTab === 'expiring' && (
              <div className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">8 Items Expiring Within 3 Days</h3>
                <p className="text-gray-600 mb-4">Review and re-sterilize items before expiry</p>
                <button className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600">
                  View Expiring Items
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
