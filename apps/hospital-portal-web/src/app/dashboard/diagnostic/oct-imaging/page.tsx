'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Plus, Search, Layers, Eye, Activity } from 'lucide-react';
import octImagingApi, { OctImagingScan, OctStatistics } from '@/lib/api/oct-imaging.api';
import { toast } from 'react-hot-toast';

export default function OCTImagingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [scans, setScans] = useState<OctImagingScan[]>([]);
  const [statistics, setStatistics] = useState<OctStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanTypeFilter, setScanTypeFilter] = useState<'ALL' | 'Macula' | 'Optic Disc' | 'RNFL' | 'Anterior Segment'>('ALL');

  useEffect(() => {
    fetchData();
  }, [scanTypeFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [scansData, statsData] = await Promise.all([
        octImagingApi.getAll({
          pageSize: 100,
          filter: scanTypeFilter !== 'ALL' ? { scanType: scanTypeFilter } : undefined,
        }),
        octImagingApi.getStatistics(),
      ]);

      setScans(scansData.data);
      setStatistics(statsData);
      toast.success('OCT scans loaded');
    } catch (error) {
      console.error('Failed to fetch OCT scans:', error);
      toast.error('Failed to load OCT scans');
      setScans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredScans = scans.filter(scan =>
    scan.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.patientMRN?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermission="DIAGNOSTIC:OCT:VIEW">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Layers className="h-8 w-8 text-blue-600" />
              OCT Imaging Management
            </h1>
            <p className="text-gray-600 mt-1">
              Optical Coherence Tomography scans and analysis
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/diagnostic/oct-imaging/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New OCT Scan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Scans</p>
                <p className="text-2xl font-bold text-blue-900">{statistics?.totalScans || 0}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Macula Scans</p>
                <p className="text-2xl font-bold text-green-900">
                  {statistics?.scanTypeDistribution?.['Macula'] || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Optic Disc</p>
                <p className="text-2xl font-bold text-purple-900">
                  {statistics?.scanTypeDistribution?.['Optic Disc'] || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Avg Thickness</p>
                <p className="text-2xl font-bold text-amber-900">
                  {statistics?.averageCentralThickness?.toFixed(0) || 0}μm
                </p>
              </div>
              <Layers className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'Macula', 'Optic Disc', 'RNFL', 'Anterior Segment'].map((type) => (
                <button
                  key={type}
                  onClick={() => setScanTypeFilter(type as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    scanTypeFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading scans...</p>
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No OCT Scans Yet</h3>
              <p className="text-gray-600 mb-4">Start performing OCT imaging for detailed retinal analysis</p>
              <button
                onClick={() => router.push('/dashboard/diagnostic/oct-imaging/new')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Perform OCT Scan
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eye</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scan Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Central Thickness</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signal Strength</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{scan.patientName}</p>
                          <p className="text-sm text-gray-500">{scan.patientMRN}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(scan.scanDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {scan.eye}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                          {scan.scanType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {scan.centralThickness ? `${scan.centralThickness}μm` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {scan.signalStrength && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  scan.signalStrength >= 7 ? 'bg-green-500' :
                                  scan.signalStrength >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${(scan.signalStrength / 10) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{scan.signalStrength}/10</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/dashboard/diagnostic/oct-imaging/${scan.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">📊 OCT Scan Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
            <div><span className="font-medium">Macula OCT:</span> Central retinal thickness, macular edema</div>
            <div><span className="font-medium">Optic Disc OCT:</span> RNFL thickness, glaucoma assessment</div>
            <div><span className="font-medium">Anterior Segment:</span> Cornea, angle structures</div>
            <div><span className="font-medium">Widefield OCT:</span> Peripheral retinal pathology</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
