'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Plus,
  Search,
  Truck,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Navigation,
  Users,
  Calendar,
  Radio,
} from 'lucide-react';

interface Ambulance {
  id: string;
  vehicleNumber: string;
  type: 'basic' | 'advanced' | 'patient-transport';
  status: 'available' | 'on-call' | 'en-route' | 'at-location' | 'returning' | 'maintenance';
  driver: string;
  driverPhone: string;
  currentLocation?: string;
  lastService: string;
  fuelLevel: number;
  equipment: string[];
}

interface TransportRequest {
  id: string;
  patientName: string;
  patientMRN: string;
  requestType: 'emergency' | 'scheduled' | 'discharge' | 'camp-pickup';
  pickupLocation: string;
  destination: string;
  requestTime: string;
  scheduledTime?: string;
  status: 'pending' | 'assigned' | 'en-route' | 'completed' | 'cancelled';
  assignedAmbulance?: string;
  priority: 'critical' | 'urgent' | 'routine';
  notes?: string;
  requester: string;
  contactPhone: string;
}

const mockAmbulances: Ambulance[] = [
  {
    id: '1',
    vehicleNumber: 'UP-32-AB-1234',
    type: 'advanced',
    status: 'available',
    driver: 'Ramesh Kumar',
    driverPhone: '+91 98765 43210',
    currentLocation: 'Hospital Campus',
    lastService: '2026-01-15',
    fuelLevel: 85,
    equipment: ['Stretcher', 'Oxygen Cylinder', 'First Aid Kit', 'Cardiac Monitor'],
  },
  {
    id: '2',
    vehicleNumber: 'UP-32-CD-5678',
    type: 'patient-transport',
    status: 'on-call',
    driver: 'Suresh Yadav',
    driverPhone: '+91 98765 43211',
    currentLocation: 'En-route to Rampur',
    lastService: '2026-01-10',
    fuelLevel: 60,
    equipment: ['Stretcher', 'Wheelchair', 'First Aid Kit'],
  },
  {
    id: '3',
    vehicleNumber: 'UP-32-EF-9012',
    type: 'basic',
    status: 'maintenance',
    driver: 'Vijay Singh',
    driverPhone: '+91 98765 43212',
    lastService: '2025-12-20',
    fuelLevel: 40,
    equipment: ['Stretcher', 'First Aid Kit'],
  },
];

const mockRequests: TransportRequest[] = [
  {
    id: '1',
    patientName: 'Rajesh Sharma',
    patientMRN: 'MRN-2024-001',
    requestType: 'emergency',
    pickupLocation: 'Rampur Village, Near Hanuman Temple',
    destination: 'Eye Hospital - Emergency',
    requestTime: '2026-01-28T10:30:00',
    status: 'assigned',
    assignedAmbulance: 'UP-32-AB-1234',
    priority: 'critical',
    notes: 'Chemical injury to eyes - requires immediate attention',
    requester: 'Dr. Sharma',
    contactPhone: '+91 98765 11111',
  },
  {
    id: '2',
    patientName: 'Sunita Devi',
    patientMRN: 'MRN-2024-002',
    requestType: 'camp-pickup',
    pickupLocation: 'Bhadohi Eye Camp',
    destination: 'Eye Hospital - Cataract Ward',
    requestTime: '2026-01-28T08:00:00',
    scheduledTime: '2026-01-28T14:00:00',
    status: 'pending',
    priority: 'routine',
    notes: 'Post-screening referral for cataract surgery',
    requester: 'Camp Coordinator',
    contactPhone: '+91 98765 22222',
  },
  {
    id: '3',
    patientName: 'Amit Kumar',
    patientMRN: 'MRN-2024-003',
    requestType: 'discharge',
    pickupLocation: 'Eye Hospital - Room 305',
    destination: 'Chandauli, Varanasi Road',
    requestTime: '2026-01-28T09:00:00',
    scheduledTime: '2026-01-28T16:00:00',
    status: 'pending',
    priority: 'routine',
    notes: 'Post-vitrectomy discharge',
    requester: 'Ward Nurse',
    contactPhone: '+91 98765 33333',
  },
];

const ambulanceStatusColors: Record<Ambulance['status'], string> = {
  available: 'bg-green-100 text-green-800',
  'on-call': 'bg-blue-100 text-blue-800',
  'en-route': 'bg-yellow-100 text-yellow-800',
  'at-location': 'bg-purple-100 text-purple-800',
  returning: 'bg-indigo-100 text-indigo-800',
  maintenance: 'bg-gray-100 text-gray-800',
};

const requestStatusColors: Record<TransportRequest['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  'en-route': 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors: Record<TransportRequest['priority'], string> = {
  critical: 'bg-red-100 text-red-800',
  urgent: 'bg-orange-100 text-orange-800',
  routine: 'bg-gray-100 text-gray-800',
};

const typeColors: Record<TransportRequest['requestType'], string> = {
  emergency: 'bg-red-100 text-red-800',
  scheduled: 'bg-blue-100 text-blue-800',
  discharge: 'bg-green-100 text-green-800',
  'camp-pickup': 'bg-purple-100 text-purple-800',
};

export default function AmbulancePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [ambulances, setAmbulances] = useState<Ambulance[]>(mockAmbulances);
  const [requests, setRequests] = useState<TransportRequest[]>(mockRequests);
  const [activeTab, setActiveTab] = useState<'fleet' | 'requests' | 'tracking'>('fleet');
  const [statusFilter, setStatusFilter] = useState<TransportRequest['status'] | 'ALL'>('ALL');

  const statistics = {
    totalAmbulances: ambulances.length,
    available: ambulances.filter(a => a.status === 'available').length,
    onDuty: ambulances.filter(a => ['on-call', 'en-route', 'at-location'].includes(a.status)).length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    todayTrips: requests.filter(r => r.requestTime.startsWith('2026-01-28')).length,
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.patientMRN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute requiredPermission="OPERATIONS:AMBULANCE:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Truck className="h-8 w-8 text-blue-600" />
              Ambulance & Transport Services
            </h1>
            <p className="text-gray-600 mt-1">
              Manage ambulance fleet, patient transport, and emergency dispatch
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/operations/ambulance/dispatch')}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Radio className="h-5 w-5" />
              Emergency Dispatch
            </button>
            <button
              onClick={() => router.push('/dashboard/operations/ambulance/new-request')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Transport Request
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Fleet</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.totalAmbulances}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Available</p>
                <p className="text-2xl font-bold text-green-900">{statistics.available}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">On Duty</p>
                <p className="text-2xl font-bold text-yellow-900">{statistics.onDuty}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-900">{statistics.pendingRequests}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Today's Trips</p>
                <p className="text-2xl font-bold text-purple-900">{statistics.todayTrips}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('fleet')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'fleet'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Truck className="h-4 w-4 inline mr-2" />
                Fleet Status
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Transport Requests
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'tracking'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Navigation className="h-4 w-4 inline mr-2" />
                Live Tracking
              </button>
            </nav>
          </div>

          <div className="p-4">
            {/* Fleet Tab */}
            {activeTab === 'fleet' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ambulances.map((ambulance) => (
                  <div
                    key={ambulance.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          ambulance.status === 'available' ? 'bg-green-100' :
                          ambulance.status === 'maintenance' ? 'bg-gray-100' : 'bg-blue-100'
                        }`}>
                          <Truck className={`h-6 w-6 ${
                            ambulance.status === 'available' ? 'text-green-600' :
                            ambulance.status === 'maintenance' ? 'text-gray-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{ambulance.vehicleNumber}</h3>
                          <span className="text-xs text-gray-500 capitalize">{ambulance.type}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${ambulanceStatusColors[ambulance.status]}`}>
                        {ambulance.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{ambulance.driver}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{ambulance.driverPhone}</span>
                      </div>
                      {ambulance.currentLocation && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{ambulance.currentLocation}</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Fuel Level</span>
                        <span>{ambulance.fuelLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            ambulance.fuelLevel > 50 ? 'bg-green-500' :
                            ambulance.fuelLevel > 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${ambulance.fuelLevel}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {ambulance.status === 'available' && (
                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
                          Assign Trip
                        </button>
                      )}
                      <button className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="flex gap-4 items-center mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search patient, MRN, location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="en-route">En Route</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`border rounded-lg p-4 ${
                      request.priority === 'critical' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{request.patientName}</h3>
                          <span className="text-sm text-gray-500">({request.patientMRN})</span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[request.requestType]}`}>
                            {request.requestType}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[request.priority]}`}>
                            {request.priority}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${requestStatusColors[request.status]}`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">From</p>
                        <p className="text-sm text-gray-900 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-red-500" />
                          {request.pickupLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">To</p>
                        <p className="text-sm text-gray-900 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-green-500" />
                          {request.destination}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(request.requestTime).toLocaleTimeString()}
                        </span>
                        {request.assignedAmbulance && (
                          <span className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            {request.assignedAmbulance}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                            Assign Ambulance
                          </button>
                        )}
                        <button className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tracking Tab */}
            {activeTab === 'tracking' && (
              <div className="p-8 text-center">
                <Navigation className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Live GPS Tracking</h3>
                <p className="text-gray-600 mb-4">Track ambulance locations in real-time on map</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Open Live Map
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
