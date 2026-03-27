'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Plus, Search, Activity, Eye, Waves, Target, Calendar, Download } from 'lucide-react';

interface UltrasoundScan {
  id: string;
  patientMRN: string;
  patientName: string;
  scanType: 'A-Scan' | 'B-Scan' | 'UBM';
  indication: string;
  scanDate: string;
  technician: string;
  interpretingDoctor: string;
  status: 'pending' | 'completed' | 'reviewed';
  findings?: string;
  axialLength?: number;
  acd?: number;
  lensThickness?: number;
}

const mockScans: UltrasoundScan[] = [
  {
    id: '1',
    patientMRN: 'MRN-2024-0456',
    patientName: 'Rajesh Kumar',
    scanType: 'A-Scan',
    indication: 'Pre-operative biometry for cataract surgery',
    scanDate: '2024-01-15T09:30:00',
    technician: 'Suresh Tech',
    interpretingDoctor: 'Dr. Sharma',
    status: 'completed',
    axialLength: 23.45,
    acd: 3.12,
    lensThickness: 4.56,
    findings: 'Normal axial length. ACD and lens thickness within normal limits. Suitable for IOL calculation.'
  },
  {
    id: '2',
    patientMRN: 'MRN-2024-0789',
    patientName: 'Sunita Devi',
    scanType: 'B-Scan',
    indication: 'Dense cataract - fundus not visible',
    scanDate: '2024-01-15T10:15:00',
    technician: 'Amit Tech',
    interpretingDoctor: 'Dr. Patel',
    status: 'reviewed',
    findings: 'Vitreous clear. Retina attached. No posterior segment pathology. Clear for surgery.'
  },
  {
    id: '3',
    patientMRN: 'MRN-2024-0234',
    patientName: 'Mohammed Ali',
    scanType: 'UBM',
    indication: 'Angle assessment for narrow angle glaucoma',
    scanDate: '2024-01-15T11:00:00',
    technician: 'Priya Tech',
    interpretingDoctor: 'Dr. Gupta',
    status: 'pending',
  },
  {
    id: '4',
    patientMRN: 'MRN-2024-0567',
    patientName: 'Lakshmi Narayanan',
    scanType: 'B-Scan',
    indication: 'Vitreous hemorrhage evaluation',
    scanDate: '2024-01-15T14:30:00',
    technician: 'Suresh Tech',
    interpretingDoctor: 'Dr. Sharma',
    status: 'completed',
    findings: 'Dense vitreous hemorrhage. Possible retinal detachment inferior quadrant - recommend surgical evaluation.'
  },
];

export default function UltrasoundPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [scanTypeFilter, setScanTypeFilter] = useState<'ALL' | 'A-Scan' | 'B-Scan' | 'UBM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'completed' | 'reviewed'>('ALL');

  const filteredScans = mockScans.filter(scan => {
    const matchesSearch = scan.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scan.patientMRN.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = scanTypeFilter === 'ALL' || scan.scanType === scanTypeFilter;
    const matchesStatus = statusFilter === 'ALL' || scan.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending Review</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Completed</span>;
      case 'reviewed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Reviewed</span>;
      default:
        return null;
    }
  };

  const getScanTypeBadge = (type: string) => {
    switch (type) {
      case 'A-Scan':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">A-Scan</span>;
      case 'B-Scan':
        return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">B-Scan</span>;
      case 'UBM':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">UBM</span>;
      default:
        return null;
    }
  };

  // Calculate statistics
  const aScanCount = mockScans.filter(s => s.scanType === 'A-Scan').length;
  const bScanCount = mockScans.filter(s => s.scanType === 'B-Scan').length;
  const ubmCount = mockScans.filter(s => s.scanType === 'UBM').length;
  const pendingCount = mockScans.filter(s => s.status === 'pending').length;

  return (
    <ProtectedRoute requiredPermission="DIAGNOSTIC:ULTRASOUND:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Waves className="h-8 w-8 text-blue-600" />
              Ultrasound & Biometry
            </h1>
            <p className="text-gray-600 mt-1">
              A-Scan, B-Scan, and Ultrasound Biomicroscopy (UBM)
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/diagnostic/ultrasound/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Ultrasound Scan
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Scans</p>
                <p className="text-2xl font-bold text-blue-900">{mockScans.length}</p>
              </div>
              <Waves className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">A-Scan</p>
                <p className="text-2xl font-bold text-purple-900">{aScanCount}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">B-Scan</p>
                <p className="text-2xl font-bold text-indigo-900">{bScanCount}</p>
              </div>
              <Eye className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">UBM</p>
                <p className="text-2xl font-bold text-orange-900">{ubmCount}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={scanTypeFilter}
            onChange={(e) => setScanTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Scan Types</option>
            <option value="A-Scan">A-Scan</option>
            <option value="B-Scan">B-Scan</option>
            <option value="UBM">UBM</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>

        {/* Scan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredScans.map(scan => (
            <div key={scan.id} className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{scan.patientName}</h3>
                    <p className="text-sm text-gray-500">{scan.patientMRN}</p>
                  </div>
                  <div className="flex gap-2">
                    {getScanTypeBadge(scan.scanType)}
                    {getStatusBadge(scan.status)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Indication</p>
                    <p className="text-sm font-medium text-gray-900">{scan.indication}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date/Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(scan.scanDate).toLocaleDateString('en-IN')} {new Date(scan.scanDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Technician</p>
                      <p className="text-sm font-medium text-gray-900">{scan.technician}</p>
                    </div>
                  </div>

                  {scan.scanType === 'A-Scan' && scan.axialLength && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 mb-2">Measurements</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-purple-600">Axial Length</p>
                          <p className="font-bold text-purple-900">{scan.axialLength} mm</p>
                        </div>
                        <div>
                          <p className="text-purple-600">ACD</p>
                          <p className="font-bold text-purple-900">{scan.acd} mm</p>
                        </div>
                        <div>
                          <p className="text-purple-600">Lens</p>
                          <p className="font-bold text-purple-900">{scan.lensThickness} mm</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {scan.findings && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Findings</p>
                      <p className="text-sm text-gray-600">{scan.findings}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t">
                    <p className="text-sm text-gray-500">
                      Interpreting: <span className="font-medium">{scan.interpretingDoctor}</span>
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                        View Details
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredScans.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Waves className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Scans Found</h3>
            <p className="text-gray-600 mb-4">No ultrasound scans match your search criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setScanTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-blue-600 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
