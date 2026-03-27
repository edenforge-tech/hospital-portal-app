'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Eye, Search, Plus, Calendar, User, Activity } from 'lucide-react';
import biometryApi, { BiometryRecord, BiometryStatistics } from '@/lib/api/biometry.api';
import { toast } from 'react-hot-toast';

export default function BiometryListPage() {
  const router = useRouter();
  const [records, setRecords] = useState<BiometryRecord[]>([]);
  const [statistics, setStatistics] = useState<BiometryStatistics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterEye, setFilterEye] = useState<'ALL' | 'OD' | 'OS'>('ALL');

  useEffect(() => {
    fetchRecords();
  }, [filterEye]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const [recordsData, statsData] = await Promise.all([
        biometryApi.getAll({
          pageSize: 100,
          filter: filterEye !== 'ALL' ? { eye: filterEye } : undefined,
        }),
        biometryApi.getStatistics(),
      ]);

      setRecords(recordsData.data);
      setStatistics(statsData);
      toast.success('Biometry records loaded');
    } catch (error) {
      console.error('Failed to fetch biometry records:', error);
      toast.error('Failed to load biometry records');
      // Set empty data on error
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patientCode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEye = filterEye === 'ALL' || record.eye === filterEye;
    return matchesSearch && matchesEye;
  });

  const handleNewBiometry = () => {
    router.push('/dashboard/diagnostic/biometry/new');
  };

  const handleViewRecord = (id: string) => {
    router.push(`/dashboard/diagnostic/biometry/${id}`);
  };

  // Get statistics with fallback to calculated values
  const stats = statistics || {
    totalRecords: records.length,
    thisWeek: records.filter(r => {
      const recordDate = new Date(r.examinationDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return recordDate >= weekAgo;
    }).length,
    odCount: records.filter(r => r.eye === 'OD').length,
    osCount: records.filter(r => r.eye === 'OS').length,
    averageAxialLength: 0,
    averageIOLPower: 0,
  };

  return (
    <ProtectedRoute requiredPermission="CLINICAL:EXAMINATION:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-600" />
              Biometry & IOL Calculations
            </h1>
            <p className="text-gray-600 mt-1">
              Pre-operative biometry measurements and IOL power calculations
            </p>
          </div>
          <button
            onClick={handleNewBiometry}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Biometry
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Records</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalRecords}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">This Week</p>
                <p className="text-2xl font-bold text-green-900">{stats.thisWeek}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Right Eye (OD)</p>
                <p className="text-2xl font-bold text-purple-900">{stats.odCount}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Left Eye (OS)</p>
                <p className="text-2xl font-bold text-amber-900">{stats.osCount}</p>
              </div>
              <Eye className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterEye('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterEye === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Eyes
            </button>
            <button
              onClick={() => setFilterEye('OD')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterEye === 'OD'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              OD (Right)
            </button>
            <button
              onClick={() => setFilterEye('OS')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterEye === 'OS'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              OS (Left)
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading biometry records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center">
              <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No biometry records found</p>
              <p className="text-gray-500 mt-2">Start by creating a new biometry measurement</p>
              <button
                onClick={handleNewBiometry}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                + Create First Record
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Axial Length
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keratometry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calculated IOL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                          <div className="text-sm text-gray-500">{record.patientCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.eye === 'OD' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {record.eye}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.axialLength.toFixed(2)} mm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.k1.toFixed(2)} / {record.k2.toFixed(2)} D
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.calculatedIOL ? (
                        <span className="text-sm font-semibold text-blue-600">
                          +{record.calculatedIOL.toFixed(2)} D
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not calculated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.examinationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.device}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewRecord(record.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Biometry Quick Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <span className="font-medium">Normal AL:</span> 22.5 - 24.5 mm
            </div>
            <div>
              <span className="font-medium">Normal K:</span> 42 - 46 D
            </div>
            <div>
              <span className="font-medium">Normal ACD:</span> 2.5 - 3.5 mm
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
