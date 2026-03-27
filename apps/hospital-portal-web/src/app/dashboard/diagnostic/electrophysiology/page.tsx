'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Plus, Search, Activity, Zap, Eye } from 'lucide-react';
import electrophysiologyApi, { ElectrophysiologyTest, ElectrophysiologyStatistics } from '@/lib/api/electrophysiology.api';
import { toast } from 'react-hot-toast';

export default function ElectrophysiologyPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState<'ALL' | 'ERG' | 'VEP' | 'EOG'>('ALL');
  const [tests, setTests] = useState<ElectrophysiologyTest[]>([]);
  const [statistics, setStatistics] = useState<ElectrophysiologyStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [testTypeFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [testsData, statsData] = await Promise.all([
        electrophysiologyApi.getAll({
          pageSize: 100,
          filter: testTypeFilter !== 'ALL' ? { testType: testTypeFilter } : undefined,
        }),
        electrophysiologyApi.getStatistics(),
      ]);

      setTests(testsData.data);
      setStatistics(statsData);
      toast.success('Electrophysiology tests loaded');
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      toast.error('Failed to load tests');
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTests = tests.filter(test =>
    test.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.patientMRN?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermission="DIAGNOSTIC:ELECTROPHYSIOLOGY:VIEW">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-600" />
              Electrophysiology Laboratory
            </h1>
            <p className="text-gray-600 mt-1">
              ERG, VEP, and EOG testing for visual pathway assessment
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/diagnostic/electrophysiology/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Test
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Tests</p>
                <p className="text-2xl font-bold text-blue-900">{statistics?.totalTests || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">ERG Tests</p>
                <p className="text-2xl font-bold text-green-900">
                  {statistics?.testTypeDistribution?.['ERG'] || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">VEP Tests</p>
                <p className="text-2xl font-bold text-purple-900">
                  {statistics?.testTypeDistribution?.['VEP'] || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">EOG Tests</p>
                <p className="text-2xl font-bold text-amber-900">
                  {statistics?.testTypeDistribution?.['EOG'] || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-amber-600" />
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
              {['ALL', 'ERG', 'VEP', 'EOG'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTestTypeFilter(type as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    testTypeFilter === type
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
              <p className="text-gray-600">Loading tests...</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Electrophysiology Tests Yet</h3>
              <p className="text-gray-600 mb-4">Start performing ERG, VEP, or EOG tests</p>
              <button
                onClick={() => router.push('/dashboard/diagnostic/electrophysiology/new')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Schedule Test
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eye</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">B-Wave</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{test.patientName}</p>
                          <p className="text-sm text-gray-500">{test.patientMRN}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(test.testDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          test.testType === 'ERG' ? 'bg-green-100 text-green-800' :
                          test.testType === 'VEP' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {test.testType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {test.eyeTested}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {test.bWaveAmplitude ? `${test.bWaveAmplitude}μV` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {test.findings || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/dashboard/diagnostic/electrophysiology/${test.id}`)}
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
          <h3 className="text-sm font-semibold text-blue-900 mb-3">⚡ Electrophysiology Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-800">
            <div><span className="font-medium">ERG:</span> Electroretinography - retinal function assessment</div>
            <div><span className="font-medium">VEP:</span> Visual Evoked Potential - optic nerve/pathway function</div>
            <div><span className="font-medium">EOG:</span> Electrooculography - retinal pigment epithelium function</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
