// Todo #8: Branch Map View & Capacity Dashboard
'use client';

import { useState, useEffect } from 'react';
import { MapPin, Activity, Bed, Users, TrendingUp, Phone, Mail, Clock, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  email: string;
  totalBeds: number;
  availableBeds: number;
  currentPatients: number;
  staffOnDuty: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  status: 'Operational' | 'Limited' | 'Closed';
  emergencySupport24x7: boolean;
}

export default function BranchMapView() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'dashboard'>('map');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    // In production: const response = await branchesApi.getAllWithCapacity();
    const mockBranches: Branch[] = [
      {
        id: '1',
        name: 'Main Hospital - Downtown',
        address: '123 Medical Center Dr',
        city: 'New York',
        state: 'NY',
        latitude: 40.7128,
        longitude: -74.0060,
        phoneNumber: '+1-555-1234',
        email: 'downtown@hospital.com',
        totalBeds: 150,
        availableBeds: 45,
        currentPatients: 105,
        staffOnDuty: 82,
        operatingHoursStart: '00:00',
        operatingHoursEnd: '23:59',
        status: 'Operational',
        emergencySupport24x7: true,
      },
      {
        id: '2',
        name: 'Uptown Eye Clinic',
        address: '456 Vision St',
        city: 'New York',
        state: 'NY',
        latitude: 40.7580,
        longitude: -73.9855,
        phoneNumber: '+1-555-5678',
        email: 'uptown@hospital.com',
        totalBeds: 50,
        availableBeds: 18,
        currentPatients: 32,
        staffOnDuty: 25,
        operatingHoursStart: '08:00',
        operatingHoursEnd: '18:00',
        status: 'Operational',
        emergencySupport24x7: false,
      },
    ];
    setBranches(mockBranches);
    setLoading(false);
  };

  const getCapacityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 30) return 'text-green-600';
    if (percentage > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Operational: 'bg-green-100 text-green-800 border-green-300',
      Limited: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Closed: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status as keyof typeof colors] || colors.Operational;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Branch Locations & Capacity</h2>
            <p className="text-sm text-gray-600">Real-time capacity and staff availability</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="h-[600px] rounded-lg overflow-hidden border-2 border-gray-200">
          {/* In production, use react-leaflet or Google Maps */}
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Interactive Map View</p>
              <p className="text-sm text-gray-500 mt-2">
                Install <code className="bg-white px-2 py-1 rounded">react-leaflet</code> or <code className="bg-white px-2 py-1 rounded">@react-google-maps/api</code>
              </p>
              <div className="mt-6 space-y-2">
                {branches.map((branch) => (
                  <div key={branch.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-left">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{branch.name}</p>
                        <p className="text-sm text-gray-600">{branch.city}, {branch.state}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(branch.status)}`}>
                        {branch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard View */}
      {viewMode === 'dashboard' && (
        <div className="space-y-6">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{branch.name}</h3>
                  <p className="text-sm text-gray-600">{branch.address}, {branch.city}, {branch.state}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {branch.phoneNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {branch.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {branch.operatingHoursStart} - {branch.operatingHoursEnd}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${getStatusColor(branch.status)}`}>
                    {branch.status}
                  </span>
                  {branch.emergencySupport24x7 && (
                    <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold border-2 border-purple-300 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      24/7 Emergency
                    </span>
                  )}
                </div>
              </div>

              {/* Capacity Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Bed className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Beds</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{branch.totalBeds}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Bed className="w-5 h-5" />
                    <span className="text-sm font-medium">Available Beds</span>
                  </div>
                  <p className={`text-3xl font-bold ${getCapacityColor(branch.availableBeds, branch.totalBeds)}`}>
                    {branch.availableBeds}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((branch.availableBeds / branch.totalBeds) * 100)}% available
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Activity className="w-5 h-5" />
                    <span className="text-sm font-medium">Current Patients</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{branch.currentPatients}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((branch.currentPatients / branch.totalBeds) * 100)}% occupancy
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Staff On Duty</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{branch.staffOnDuty}</p>
                </div>
              </div>

              {/* Utilization Chart */}
              <div className="mt-4 bg-white rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Bed Utilization</h4>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${(branch.currentPatients / branch.totalBeds) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-900">
                    {branch.currentPatients} / {branch.totalBeds} ({Math.round((branch.currentPatients / branch.totalBeds) * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Branch</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Beds</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Available</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patients</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Staff</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Occupancy</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{branch.name}</p>
                      <p className="text-sm text-gray-600">{branch.city}, {branch.state}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(branch.status)}`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{branch.totalBeds}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${getCapacityColor(branch.availableBeds, branch.totalBeds)}`}>
                      {branch.availableBeds}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{branch.currentPatients}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{branch.staffOnDuty}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${(branch.currentPatients / branch.totalBeds) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {Math.round((branch.currentPatients / branch.totalBeds) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {branch.operatingHoursStart} - {branch.operatingHoursEnd}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
