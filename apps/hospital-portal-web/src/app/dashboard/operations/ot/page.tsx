'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Eye,
  Edit,
  Printer,
  Stethoscope,
  Activity,
  ClipboardList,
} from 'lucide-react';

interface Surgery {
  id: string;
  patientName: string;
  patientMRN: string;
  surgeryType: string;
  surgeon: string;
  anesthesiologist: string;
  otRoom: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  preOpStatus: 'pending' | 'cleared' | 'hold';
  priority: 'routine' | 'urgent' | 'emergency';
  eye: 'OD' | 'OS' | 'OU';
  iolPower?: string;
  notes?: string;
}

const mockSurgeries: Surgery[] = [
  {
    id: '1',
    patientName: 'Rajesh Kumar',
    patientMRN: 'MRN-2024-001',
    surgeryType: 'Phacoemulsification + IOL',
    surgeon: 'Dr. Sharma',
    anesthesiologist: 'Dr. Patel',
    otRoom: 'OT-1',
    scheduledDate: '2026-01-28',
    scheduledTime: '09:00',
    duration: '45 mins',
    status: 'scheduled',
    preOpStatus: 'cleared',
    priority: 'routine',
    eye: 'OD',
    iolPower: '+21.5D Alcon SN60WF',
    notes: 'Patient cleared for surgery, fasting confirmed',
  },
  {
    id: '2',
    patientName: 'Sunita Devi',
    patientMRN: 'MRN-2024-002',
    surgeryType: 'Trabeculectomy',
    surgeon: 'Dr. Gupta',
    anesthesiologist: 'Dr. Patel',
    otRoom: 'OT-2',
    scheduledDate: '2026-01-28',
    scheduledTime: '10:30',
    duration: '60 mins',
    status: 'in-progress',
    preOpStatus: 'cleared',
    priority: 'urgent',
    eye: 'OS',
    notes: 'IOP uncontrolled on maximum medical therapy',
  },
  {
    id: '3',
    patientName: 'Amit Singh',
    patientMRN: 'MRN-2024-003',
    surgeryType: 'Vitrectomy + ERM Peel',
    surgeon: 'Dr. Reddy',
    anesthesiologist: 'Dr. Kumar',
    otRoom: 'OT-1',
    scheduledDate: '2026-01-28',
    scheduledTime: '14:00',
    duration: '90 mins',
    status: 'scheduled',
    preOpStatus: 'pending',
    priority: 'routine',
    eye: 'OD',
    notes: 'Awaiting anesthesia clearance',
  },
];

const statusColors: Record<Surgery['status'], string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  delayed: 'bg-orange-100 text-orange-800',
};

const priorityColors: Record<Surgery['priority'], string> = {
  routine: 'bg-gray-100 text-gray-800',
  urgent: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
};

const preOpColors: Record<Surgery['preOpStatus'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  cleared: 'bg-green-100 text-green-800',
  hold: 'bg-red-100 text-red-800',
};

export default function OTManagementPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [surgeries, setSurgeries] = useState<Surgery[]>(mockSurgeries);
  const [statusFilter, setStatusFilter] = useState<Surgery['status'] | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOT, setSelectedOT] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const otRooms = ['OT-1', 'OT-2', 'OT-3', 'Minor OT'];

  const statistics = {
    totalScheduled: surgeries.filter(s => s.scheduledDate === dateFilter).length,
    completed: surgeries.filter(s => s.status === 'completed' && s.scheduledDate === dateFilter).length,
    inProgress: surgeries.filter(s => s.status === 'in-progress').length,
    pendingClearance: surgeries.filter(s => s.preOpStatus === 'pending').length,
  };

  const filteredSurgeries = surgeries.filter(surgery => {
    const matchesSearch =
      surgery.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surgery.patientMRN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surgery.surgeon.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || surgery.status === statusFilter;
    const matchesDate = surgery.scheduledDate === dateFilter;
    const matchesOT = selectedOT === 'ALL' || surgery.otRoom === selectedOT;
    return matchesSearch && matchesStatus && matchesDate && matchesOT;
  });

  return (
    <ProtectedRoute requiredPermission="OPERATIONS:OT:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              Operation Theater Management
            </h1>
            <p className="text-gray-600 mt-1">
              Schedule surgeries, manage OT allocation, and track pre-op status
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/operations/ot/schedule')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              View Schedule
            </button>
            <button
              onClick={() => router.push('/dashboard/operations/ot/new')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Schedule Surgery
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Today's Surgeries</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.totalScheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{statistics.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{statistics.inProgress}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Clearance</p>
                <p className="text-2xl font-bold text-orange-900">{statistics.pendingClearance}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* OT Room Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {otRooms.map((room) => {
            const currentSurgery = surgeries.find(
              s => s.otRoom === room && s.status === 'in-progress'
            );
            return (
              <div
                key={room}
                className={`p-4 rounded-lg border ${
                  currentSurgery
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{room}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      currentSurgery ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {currentSurgery ? 'In Use' : 'Available'}
                  </span>
                </div>
                {currentSurgery ? (
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{currentSurgery.patientName}</p>
                    <p className="text-gray-600">{currentSurgery.surgeryType}</p>
                    <p className="text-gray-500">{currentSurgery.surgeon}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No surgery in progress</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search patient, MRN, surgeon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={selectedOT}
                onChange={(e) => setSelectedOT(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All OT Rooms</option>
                {otRooms.map((room) => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Surgery['status'] | 'ALL')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Surgery List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time / OT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surgery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surgeon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pre-Op
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSurgeries.map((surgery) => (
                  <tr key={surgery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {surgery.scheduledTime}
                          </div>
                          <div className="text-xs text-gray-500">
                            {surgery.otRoom} • {surgery.duration}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {surgery.patientName}
                        </div>
                        <div className="text-xs text-gray-500">{surgery.patientMRN}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {surgery.surgeryType}
                        </div>
                        <div className="text-xs text-gray-500">
                          Eye: {surgery.eye}
                          {surgery.iolPower && ` • IOL: ${surgery.iolPower}`}
                        </div>
                        <span
                          className={`inline-flex text-xs px-2 py-0.5 rounded-full mt-1 ${
                            priorityColors[surgery.priority]
                          }`}
                        >
                          {surgery.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {surgery.surgeon}
                        </div>
                        <div className="text-xs text-gray-500">
                          {surgery.anesthesiologist}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${
                          preOpColors[surgery.preOpStatus]
                        }`}
                      >
                        {surgery.preOpStatus === 'cleared' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {surgery.preOpStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {surgery.preOpStatus === 'hold' && <XCircle className="h-3 w-3 mr-1" />}
                        {surgery.preOpStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${
                          statusColors[surgery.status]
                        }`}
                      >
                        {surgery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/operations/ot/${surgery.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/operations/ot/${surgery.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/operations/ot/${surgery.id}/checklist`)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Pre-Op Checklist"
                        >
                          <ClipboardList className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSurgeries.length === 0 && (
            <div className="p-12 text-center">
              <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Surgeries Found</h3>
              <p className="text-gray-600">No surgeries match your current filters</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
