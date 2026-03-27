'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Plus,
  Search,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Activity,
  FileText,
  Eye,
  Edit,
  AlertCircle,
  Settings,
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  category: 'diagnostic' | 'surgical' | 'imaging' | 'treatment' | 'other';
  location: string;
  department: string;
  purchaseDate: string;
  warrantyExpiry: string;
  lastServiceDate: string;
  nextServiceDate: string;
  status: 'operational' | 'under-maintenance' | 'breakdown' | 'decommissioned';
  maintenanceStatus: 'up-to-date' | 'due-soon' | 'overdue';
  totalCost: number;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'corrective' | 'calibration' | 'breakdown';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  technician: string;
  vendor?: string;
  cost: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'pending-parts';
  notes?: string;
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Phacoemulsification System',
    model: 'Centurion',
    manufacturer: 'Alcon',
    serialNumber: 'ALN-CEN-2023-001',
    category: 'surgical',
    location: 'OT-1',
    department: 'Operation Theater',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    lastServiceDate: '2026-01-10',
    nextServiceDate: '2026-04-10',
    status: 'operational',
    maintenanceStatus: 'up-to-date',
    totalCost: 5500000,
  },
  {
    id: '2',
    name: 'OCT Scanner',
    model: 'Spectralis',
    manufacturer: 'Heidelberg Engineering',
    serialNumber: 'HE-SPE-2022-001',
    category: 'imaging',
    location: 'Diagnostic Room 1',
    department: 'Diagnostics',
    purchaseDate: '2022-06-20',
    warrantyExpiry: '2025-06-20',
    lastServiceDate: '2025-12-15',
    nextServiceDate: '2026-02-01',
    status: 'operational',
    maintenanceStatus: 'due-soon',
    totalCost: 4500000,
  },
  {
    id: '3',
    name: 'Slit Lamp Biomicroscope',
    model: 'BQ900',
    manufacturer: 'Haag-Streit',
    serialNumber: 'HS-BQ9-2021-003',
    category: 'diagnostic',
    location: 'OPD Room 2',
    department: 'OPD',
    purchaseDate: '2021-03-10',
    warrantyExpiry: '2024-03-10',
    lastServiceDate: '2025-11-20',
    nextServiceDate: '2026-01-20',
    status: 'under-maintenance',
    maintenanceStatus: 'overdue',
    totalCost: 850000,
  },
  {
    id: '4',
    name: 'Fundus Camera',
    model: 'TRC-NW8',
    manufacturer: 'Topcon',
    serialNumber: 'TOP-NW8-2023-001',
    category: 'imaging',
    location: 'Diagnostic Room 2',
    department: 'Diagnostics',
    purchaseDate: '2023-08-01',
    warrantyExpiry: '2026-08-01',
    lastServiceDate: '2026-01-05',
    nextServiceDate: '2026-07-05',
    status: 'operational',
    maintenanceStatus: 'up-to-date',
    totalCost: 2800000,
  },
  {
    id: '5',
    name: 'YAG Laser',
    model: 'LightMed LIGHTlas',
    manufacturer: 'LightMed',
    serialNumber: 'LM-YAG-2024-001',
    category: 'treatment',
    location: 'Laser Room',
    department: 'Treatment',
    purchaseDate: '2024-02-15',
    warrantyExpiry: '2027-02-15',
    lastServiceDate: '2025-12-01',
    nextServiceDate: '2026-06-01',
    status: 'operational',
    maintenanceStatus: 'up-to-date',
    totalCost: 1800000,
  },
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    equipmentId: '3',
    equipmentName: 'Slit Lamp Biomicroscope',
    type: 'corrective',
    description: 'Bulb replacement and optical alignment',
    scheduledDate: '2026-01-28',
    technician: 'Haag-Streit Service',
    vendor: 'Haag-Streit India',
    cost: 15000,
    status: 'in-progress',
    notes: 'Waiting for replacement bulb delivery',
  },
  {
    id: '2',
    equipmentId: '2',
    equipmentName: 'OCT Scanner',
    type: 'preventive',
    description: 'Quarterly preventive maintenance',
    scheduledDate: '2026-02-01',
    technician: 'Heidelberg Service Engineer',
    vendor: 'Heidelberg Engineering India',
    cost: 25000,
    status: 'scheduled',
  },
  {
    id: '3',
    equipmentId: '1',
    equipmentName: 'Phacoemulsification System',
    type: 'calibration',
    description: 'Annual calibration and software update',
    scheduledDate: '2026-01-10',
    completedDate: '2026-01-10',
    technician: 'Alcon Service Team',
    vendor: 'Alcon India',
    cost: 45000,
    status: 'completed',
    notes: 'Software updated to v3.5, all parameters within spec',
  },
];

const statusColors: Record<Equipment['status'], string> = {
  operational: 'bg-green-100 text-green-800',
  'under-maintenance': 'bg-yellow-100 text-yellow-800',
  breakdown: 'bg-red-100 text-red-800',
  decommissioned: 'bg-gray-100 text-gray-800',
};

const maintenanceStatusColors: Record<Equipment['maintenanceStatus'], string> = {
  'up-to-date': 'bg-green-100 text-green-800',
  'due-soon': 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
};

const categoryIcons: Record<Equipment['category'], React.ReactNode> = {
  diagnostic: <Eye className="h-4 w-4" />,
  surgical: <Wrench className="h-4 w-4" />,
  imaging: <Activity className="h-4 w-4" />,
  treatment: <Settings className="h-4 w-4" />,
  other: <Settings className="h-4 w-4" />,
};

const recordTypeColors: Record<MaintenanceRecord['type'], string> = {
  preventive: 'bg-blue-100 text-blue-800',
  corrective: 'bg-orange-100 text-orange-800',
  calibration: 'bg-purple-100 text-purple-800',
  breakdown: 'bg-red-100 text-red-800',
};

export default function BiomedicalPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(mockMaintenanceRecords);
  const [activeTab, setActiveTab] = useState<'equipment' | 'maintenance' | 'calendar'>('equipment');
  const [categoryFilter, setCategoryFilter] = useState<Equipment['category'] | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<Equipment['status'] | 'ALL'>('ALL');

  const statistics = {
    totalEquipment: equipment.length,
    operational: equipment.filter(e => e.status === 'operational').length,
    underMaintenance: equipment.filter(e => e.status === 'under-maintenance').length,
    maintenanceOverdue: equipment.filter(e => e.maintenanceStatus === 'overdue').length,
    maintenanceDueSoon: equipment.filter(e => e.maintenanceStatus === 'due-soon').length,
    totalAssetValue: equipment.reduce((sum, e) => sum + e.totalCost, 0),
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <ProtectedRoute requiredPermission="OPERATIONS:BIOMEDICAL:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wrench className="h-8 w-8 text-blue-600" />
              Biomedical Engineering
            </h1>
            <p className="text-gray-600 mt-1">
              Equipment maintenance, calibration tracking, and asset management
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/operations/biomedical/maintenance-schedule')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              Maintenance Schedule
            </button>
            <button
              onClick={() => router.push('/dashboard/operations/biomedical/new-equipment')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Equipment
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Equipment</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.totalEquipment}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Operational</p>
                <p className="text-2xl font-bold text-green-900">{statistics.operational}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Under Maintenance</p>
                <p className="text-2xl font-bold text-yellow-900">{statistics.underMaintenance}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Service Due Soon</p>
                <p className="text-2xl font-bold text-orange-900">{statistics.maintenanceDueSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{statistics.maintenanceOverdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Asset Value</p>
                <p className="text-2xl font-bold text-purple-900">₹{(statistics.totalAssetValue / 10000000).toFixed(1)}Cr</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('equipment')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'equipment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Equipment Register
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'maintenance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Wrench className="h-4 w-4 inline mr-2" />
                Maintenance Records
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'calendar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Service Calendar
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
                    placeholder="Search equipment, serial number, manufacturer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {activeTab === 'equipment' && (
                <>
                  <div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="diagnostic">Diagnostic</option>
                      <option value="surgical">Surgical</option>
                      <option value="imaging">Imaging</option>
                      <option value="treatment">Treatment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Status</option>
                      <option value="operational">Operational</option>
                      <option value="under-maintenance">Under Maintenance</option>
                      <option value="breakdown">Breakdown</option>
                      <option value="decommissioned">Decommissioned</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Equipment Tab */}
            {activeTab === 'equipment' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Equipment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Maintenance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Next Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEquipment.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {categoryIcons[item.category]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-600">{item.manufacturer} - {item.model}</div>
                              <div className="text-xs text-gray-500">S/N: {item.serialNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.location}</div>
                          <div className="text-xs text-gray-500">{item.department}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${maintenanceStatusColors[item.maintenanceStatus]}`}>
                            {item.maintenanceStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.nextServiceDate}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/operations/biomedical/${item.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/operations/biomedical/${item.id}/service`)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Wrench className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/operations/biomedical/${item.id}/edit`)}
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

            {/* Maintenance Records Tab */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4">
                {maintenanceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.equipmentName}</h3>
                        <p className="text-sm text-gray-600">{record.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${recordTypeColors[record.type]}`}>
                          {record.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          record.status === 'completed' ? 'bg-green-100 text-green-800' :
                          record.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Scheduled</p>
                        <p className="text-sm font-medium">{record.scheduledDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Technician</p>
                        <p className="text-sm font-medium">{record.technician}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Vendor</p>
                        <p className="text-sm font-medium">{record.vendor || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cost</p>
                        <p className="text-sm font-medium">₹{record.cost.toLocaleString()}</p>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">{record.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Service Calendar</h3>
                <p className="text-gray-600 mb-4">View scheduled maintenance in calendar format</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Open Calendar View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
