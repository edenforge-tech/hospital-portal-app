'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  Plus, Search, Calendar, Clock, User, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, XCircle, Stethoscope, Activity
} from 'lucide-react';

interface Surgery {
  id: string;
  patientMRN: string;
  patientName: string;
  patientAge: number;
  surgeryType: string;
  surgeon: string;
  anesthesiologist: string;
  otRoom: string;
  scheduledTime: string;
  estimatedDuration: number;
  status: 'scheduled' | 'pre-op' | 'in-progress' | 'post-op' | 'completed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'emergency';
  preOpCleared: boolean;
  consentSigned: boolean;
  iolDetails?: string;
  notes?: string;
}

interface OTRoom {
  id: string;
  name: string;
  status: 'available' | 'in-use' | 'cleaning' | 'maintenance';
  currentSurgery?: string;
  nextAvailable?: string;
}

interface Surgeon {
  id: string;
  name: string;
  specialty: string;
  availableSlots: string[];
  surgeriesToday: number;
}

const mockSurgeries: Surgery[] = [
  {
    id: '1',
    patientMRN: 'MRN-2024-0456',
    patientName: 'Rajesh Kumar',
    patientAge: 65,
    surgeryType: 'Phacoemulsification + IOL',
    surgeon: 'Dr. Sharma',
    anesthesiologist: 'Dr. Anesthesia',
    otRoom: 'OT-1',
    scheduledTime: '2024-01-15T09:00:00',
    estimatedDuration: 45,
    status: 'completed',
    priority: 'routine',
    preOpCleared: true,
    consentSigned: true,
    iolDetails: 'Alcon SN60WF +21.5D',
  },
  {
    id: '2',
    patientMRN: 'MRN-2024-0789',
    patientName: 'Sunita Devi',
    patientAge: 58,
    surgeryType: 'Trabeculectomy',
    surgeon: 'Dr. Patel',
    anesthesiologist: 'Dr. Anesthesia',
    otRoom: 'OT-2',
    scheduledTime: '2024-01-15T09:30:00',
    estimatedDuration: 60,
    status: 'in-progress',
    priority: 'urgent',
    preOpCleared: true,
    consentSigned: true,
    notes: 'Mitomycin-C application planned',
  },
  {
    id: '3',
    patientMRN: 'MRN-2024-0234',
    patientName: 'Mohammed Ali',
    patientAge: 72,
    surgeryType: 'Pars Plana Vitrectomy',
    surgeon: 'Dr. Gupta',
    anesthesiologist: 'Dr. Anesthesia',
    otRoom: 'OT-1',
    scheduledTime: '2024-01-15T10:30:00',
    estimatedDuration: 90,
    status: 'pre-op',
    priority: 'routine',
    preOpCleared: true,
    consentSigned: true,
    notes: 'RD repair with silicone oil',
  },
  {
    id: '4',
    patientMRN: 'MRN-2024-0567',
    patientName: 'Lakshmi Narayanan',
    patientAge: 45,
    surgeryType: 'Pterygium Excision',
    surgeon: 'Dr. Sharma',
    anesthesiologist: '-',
    otRoom: 'Minor OT',
    scheduledTime: '2024-01-15T11:00:00',
    estimatedDuration: 30,
    status: 'scheduled',
    priority: 'routine',
    preOpCleared: true,
    consentSigned: false,
    notes: 'Conjunctival autograft planned',
  },
  {
    id: '5',
    patientMRN: 'MRN-2024-0890',
    patientName: 'Arun Prakash',
    patientAge: 68,
    surgeryType: 'Phacoemulsification + IOL',
    surgeon: 'Dr. Sharma',
    anesthesiologist: 'Dr. Anesthesia',
    otRoom: 'OT-1',
    scheduledTime: '2024-01-15T14:00:00',
    estimatedDuration: 45,
    status: 'scheduled',
    priority: 'routine',
    preOpCleared: false,
    consentSigned: true,
    iolDetails: 'Tecnis ZCB00 +20.0D',
  },
];

const mockOTRooms: OTRoom[] = [
  { id: '1', name: 'OT-1 (Main)', status: 'in-use', currentSurgery: 'Phaco + IOL', nextAvailable: '10:00 AM' },
  { id: '2', name: 'OT-2 (Retina)', status: 'in-use', currentSurgery: 'Trabeculectomy', nextAvailable: '10:30 AM' },
  { id: '3', name: 'OT-3 (Laser)', status: 'available' },
  { id: '4', name: 'Minor OT', status: 'cleaning', nextAvailable: '10:45 AM' },
];

const mockSurgeons: Surgeon[] = [
  { id: '1', name: 'Dr. Sharma', specialty: 'Cataract & Cornea', availableSlots: ['14:00', '15:00', '16:00'], surgeriesToday: 3 },
  { id: '2', name: 'Dr. Patel', specialty: 'Glaucoma', availableSlots: ['11:00', '14:30'], surgeriesToday: 2 },
  { id: '3', name: 'Dr. Gupta', specialty: 'Retina & Vitreous', availableSlots: ['15:00'], surgeriesToday: 2 },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export default function OTSchedulePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [filterSurgeon, setFilterSurgeon] = useState<string>('ALL');
  const [filterOT, setFilterOT] = useState<string>('ALL');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'pre-op': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-green-100 text-green-800 animate-pulse',
      'post-op': 'bg-purple-100 text-purple-800',
      'completed': 'bg-gray-100 text-gray-600',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}>{status.replace('-', ' ')}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      'routine': 'bg-gray-100 text-gray-600',
      'urgent': 'bg-orange-100 text-orange-800',
      'emergency': 'bg-red-200 text-red-900',
    };
    return <span className={`px-2 py-0.5 text-xs rounded ${styles[priority]}`}>{priority}</span>;
  };

  const getOTStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'in-use': return 'bg-red-500';
      case 'cleaning': return 'bg-yellow-500';
      case 'maintenance': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const filteredSurgeries = mockSurgeries.filter(s => {
    const matchesSurgeon = filterSurgeon === 'ALL' || s.surgeon === filterSurgeon;
    const matchesOT = filterOT === 'ALL' || s.otRoom === filterOT;
    return matchesSurgeon && matchesOT;
  });

  // Statistics
  const totalSurgeries = mockSurgeries.length;
  const completedSurgeries = mockSurgeries.filter(s => s.status === 'completed').length;
  const inProgressSurgeries = mockSurgeries.filter(s => s.status === 'in-progress').length;
  const pendingClearance = mockSurgeries.filter(s => !s.preOpCleared).length;

  return (
    <ProtectedRoute requiredPermission="OPERATIONS:OT:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              OT Schedule
            </h1>
            <p className="text-gray-600 mt-1">
              Surgery scheduling and operation theater management
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/operations/ot/schedule/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Schedule Surgery
          </button>
        </div>

        {/* Date Navigation & View Toggle */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="text-lg font-semibold">{selectedDate.toLocaleDateString('en-IN', { weekday: 'long' })}</p>
              <p className="text-2xl font-bold text-blue-600">
                {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setSelectedDate(new Date())}
              className="ml-4 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              Today
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Statistics & OT Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics */}
          <div className="lg:col-span-2 grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Surgeries</p>
                  <p className="text-2xl font-bold text-blue-900">{totalSurgeries}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{completedSurgeries}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-purple-900">{inProgressSurgeries}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending Clearance</p>
                  <p className="text-2xl font-bold text-yellow-900">{pendingClearance}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* OT Room Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">OT Room Status</h3>
            <div className="space-y-2">
              {mockOTRooms.map(room => (
                <div key={room.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getOTStatusColor(room.status)}`}></div>
                    <span className="font-medium text-sm">{room.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {room.currentSurgery ? (
                      <span className="text-red-600">{room.currentSurgery}</span>
                    ) : room.status === 'available' ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span>Next: {room.nextAvailable}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={filterSurgeon}
            onChange={(e) => setFilterSurgeon(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Surgeons</option>
            {mockSurgeons.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <select
            value={filterOT}
            onChange={(e) => setFilterOT(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All OT Rooms</option>
            {mockOTRooms.map(r => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* Time Header */}
                <div className="flex border-b bg-gray-50">
                  <div className="w-32 flex-shrink-0 p-3 font-medium text-gray-600 border-r">OT Room</div>
                  {timeSlots.map(time => (
                    <div key={time} className="flex-1 p-2 text-center text-xs font-medium text-gray-500 border-r">
                      {time}
                    </div>
                  ))}
                </div>

                {/* OT Room Rows */}
                {mockOTRooms.map(room => (
                  <div key={room.id} className="flex border-b hover:bg-gray-50">
                    <div className="w-32 flex-shrink-0 p-3 font-medium text-gray-900 border-r bg-gray-50">
                      {room.name}
                    </div>
                    <div className="flex-1 relative h-16">
                      {/* Surgery blocks */}
                      {filteredSurgeries
                        .filter(s => s.otRoom === room.name)
                        .map(surgery => {
                          const startTime = new Date(surgery.scheduledTime);
                          const startHour = startTime.getHours();
                          const startMinute = startTime.getMinutes();
                          const startSlotIndex = timeSlots.findIndex(t => {
                            const [h, m] = t.split(':').map(Number);
                            return h === startHour && m === startMinute;
                          });
                          const widthSlots = Math.ceil(surgery.estimatedDuration / 30);
                          
                          if (startSlotIndex === -1) return null;
                          
                          const statusColors: Record<string, string> = {
                            'scheduled': 'bg-blue-200 border-blue-400',
                            'pre-op': 'bg-yellow-200 border-yellow-400',
                            'in-progress': 'bg-green-200 border-green-400',
                            'post-op': 'bg-purple-200 border-purple-400',
                            'completed': 'bg-gray-200 border-gray-400',
                            'cancelled': 'bg-red-200 border-red-400 line-through',
                          };

                          return (
                            <div
                              key={surgery.id}
                              className={`absolute top-1 bottom-1 rounded border-2 ${statusColors[surgery.status]} cursor-pointer hover:opacity-80 overflow-hidden`}
                              style={{
                                left: `${(startSlotIndex / timeSlots.length) * 100}%`,
                                width: `${(widthSlots / timeSlots.length) * 100}%`,
                              }}
                              title={`${surgery.patientName} - ${surgery.surgeryType}`}
                            >
                              <div className="p-1 text-xs">
                                <p className="font-semibold truncate">{surgery.patientName}</p>
                                <p className="truncate text-gray-600">{surgery.surgeryType}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surgery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surgeon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OT Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clearance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSurgeries.map(surgery => (
                  <tr key={surgery.id} className={`hover:bg-gray-50 ${surgery.status === 'in-progress' ? 'bg-green-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(surgery.scheduledTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-gray-500">{surgery.estimatedDuration} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{surgery.patientName}</div>
                      <div className="text-xs text-gray-500">{surgery.patientMRN} • {surgery.patientAge}y</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{surgery.surgeryType}</div>
                      {surgery.iolDetails && (
                        <div className="text-xs text-blue-600">{surgery.iolDetails}</div>
                      )}
                      {getPriorityBadge(surgery.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{surgery.surgeon}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{surgery.otRoom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(surgery.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <span title={surgery.preOpCleared ? "Pre-op cleared" : "Pending clearance"}>
                          {surgery.preOpCleared ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </span>
                        <span title={surgery.consentSigned ? "Consent signed" : "Consent pending"}>
                          {surgery.consentSigned ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                      <button className="text-gray-600 hover:text-gray-800">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Surgeon Availability */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Surgeon Availability Today</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockSurgeons.map(surgeon => (
              <div key={surgeon.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{surgeon.name}</p>
                    <p className="text-sm text-gray-500">{surgeon.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Surgeries Today:</span>
                  <span className="font-medium">{surgeon.surgeriesToday}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Available Slots:</p>
                  <div className="flex flex-wrap gap-1">
                    {surgeon.availableSlots.map(slot => (
                      <span key={slot} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
