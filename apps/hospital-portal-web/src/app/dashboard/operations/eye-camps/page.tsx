'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  Activity,
  FileText,
  Edit,
  Trash2,
  Download,
} from 'lucide-react';

interface EyeCamp {
  id: string;
  name: string;
  location: string;
  village: string;
  district: string;
  state: string;
  campDate: string;
  campType: 'screening' | 'surgical' | 'mixed';
  status: 'planning' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  coordinator: string;
  doctors: string[];
  targetPatients: number;
  registeredPatients: number;
  screenedPatients: number;
  referredForSurgery: number;
  surgeryCompleted: number;
  transportArranged: boolean;
  equipmentList: string[];
  notes?: string;
}

const mockCamps: EyeCamp[] = [
  {
    id: '1',
    name: 'Village Screening Camp - Rampur',
    location: 'Government Primary School, Rampur',
    village: 'Rampur',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    campDate: '2026-02-05',
    campType: 'screening',
    status: 'scheduled',
    coordinator: 'Dr. Meera Sharma',
    doctors: ['Dr. Sharma', 'Dr. Patel'],
    targetPatients: 200,
    registeredPatients: 156,
    screenedPatients: 0,
    referredForSurgery: 0,
    surgeryCompleted: 0,
    transportArranged: true,
    equipmentList: ['Snellen Chart', 'Torch', 'Direct Ophthalmoscope', 'Tonometer'],
    notes: 'Collaboration with local NGO',
  },
  {
    id: '2',
    name: 'Surgical Camp - Bhadohi',
    location: 'District Hospital, Bhadohi',
    village: 'Bhadohi Town',
    district: 'Bhadohi',
    state: 'Uttar Pradesh',
    campDate: '2026-01-28',
    campType: 'surgical',
    status: 'in-progress',
    coordinator: 'Dr. Rajiv Gupta',
    doctors: ['Dr. Gupta', 'Dr. Reddy', 'Dr. Kumar'],
    targetPatients: 50,
    registeredPatients: 48,
    screenedPatients: 48,
    referredForSurgery: 35,
    surgeryCompleted: 22,
    transportArranged: true,
    equipmentList: ['Phaco Machine', 'Microscope', 'IOLs', 'Surgical Kits'],
    notes: 'Free cataract surgery camp',
  },
  {
    id: '3',
    name: 'School Eye Health Program',
    location: 'Multiple Schools - Chandauli',
    village: 'Chandauli',
    district: 'Chandauli',
    state: 'Uttar Pradesh',
    campDate: '2026-01-20',
    campType: 'screening',
    status: 'completed',
    coordinator: 'Dr. Priya Singh',
    doctors: ['Dr. Singh'],
    targetPatients: 500,
    registeredPatients: 487,
    screenedPatients: 487,
    referredForSurgery: 12,
    surgeryCompleted: 12,
    transportArranged: false,
    equipmentList: ['Snellen Chart', 'Auto-refractor', 'Trial Set'],
    notes: 'Spectacles distributed to 85 children',
  },
];

const statusColors: Record<EyeCamp['status'], string> = {
  planning: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const typeColors: Record<EyeCamp['campType'], string> = {
  screening: 'bg-blue-100 text-blue-800',
  surgical: 'bg-purple-100 text-purple-800',
  mixed: 'bg-indigo-100 text-indigo-800',
};

export default function EyeCampsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [camps, setCamps] = useState<EyeCamp[]>(mockCamps);
  const [statusFilter, setStatusFilter] = useState<EyeCamp['status'] | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<EyeCamp['campType'] | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const statistics = {
    totalCamps: camps.length,
    activeCamps: camps.filter(c => c.status === 'in-progress').length,
    upcomingCamps: camps.filter(c => c.status === 'scheduled').length,
    totalPatientsScreened: camps.reduce((sum, c) => sum + c.screenedPatients, 0),
    totalSurgeries: camps.reduce((sum, c) => sum + c.surgeryCompleted, 0),
  };

  const filteredCamps = camps.filter(camp => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || camp.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || camp.campType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <ProtectedRoute requiredPermission="OPERATIONS:EYECAMP:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-600" />
              Eye Camp Management
            </h1>
            <p className="text-gray-600 mt-1">
              Plan, organize, and track outreach eye screening and surgical camps
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/operations/eye-camps/calendar')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              Camp Calendar
            </button>
            <button
              onClick={() => router.push('/dashboard/operations/eye-camps/new')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Plan New Camp
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Camps</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.totalCamps}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Active Camps</p>
                <p className="text-2xl font-bold text-yellow-900">{statistics.activeCamps}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Upcoming</p>
                <p className="text-2xl font-bold text-purple-900">{statistics.upcomingCamps}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Patients Screened</p>
                <p className="text-2xl font-bold text-green-900">{statistics.totalPatientsScreened}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 font-medium">Surgeries Done</p>
                <p className="text-2xl font-bold text-teal-900">{statistics.totalSurgeries}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search camp name, location, district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as EyeCamp['campType'] | 'ALL')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="screening">Screening</option>
                <option value="surgical">Surgical</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EyeCamp['status'] | 'ALL')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="planning">Planning</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Camp Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCamps.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{camp.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{camp.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${typeColors[camp.campType]}`}>
                      {camp.campType}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[camp.status]}`}>
                      {camp.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(camp.campDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{camp.doctors.length} Doctors</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{camp.district}, {camp.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className={camp.transportArranged ? 'text-green-600' : 'text-red-600'}>
                      Transport {camp.transportArranged ? 'Arranged' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{camp.registeredPatients}</p>
                      <p className="text-xs text-gray-500">Registered</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{camp.screenedPatients}</p>
                      <p className="text-xs text-gray-500">Screened</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-600">{camp.referredForSurgery}</p>
                      <p className="text-xs text-gray-500">Referred</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{camp.surgeryCompleted}</p>
                      <p className="text-xs text-gray-500">Surgeries</p>
                    </div>
                  </div>
                  {camp.targetPatients > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Screening Progress</span>
                        <span>{Math.round((camp.screenedPatients / camp.targetPatients) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (camp.screenedPatients / camp.targetPatients) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Coordinator:</span> {camp.coordinator}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push(`/dashboard/operations/eye-camps/${camp.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/operations/eye-camps/${camp.id}/register`)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    Register
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/operations/eye-camps/${camp.id}/edit`)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCamps.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Eye Camps Found</h3>
            <p className="text-gray-600 mb-4">No camps match your current filters</p>
            <button
              onClick={() => router.push('/dashboard/operations/eye-camps/new')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Plan New Camp
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
