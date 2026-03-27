'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Plus, Search, Eye, AlertCircle, CheckCircle, Calendar, User } from 'lucide-react';
import retinopathyApi, { RetinopathyScreening, RetinopathyStatistics } from '@/lib/api/retinopathy-screening.api';
import { toast } from 'react-hot-toast';

export default function RetinopathyScreeningPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE' | 'PDR'>('ALL');
  const [screenings, setScreenings] = useState<RetinopathyScreening[]>([]);
  const [statistics, setStatistics] = useState<RetinopathyStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [gradeFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [screeningsData, statsData] = await Promise.all([
        retinopathyApi.getAll({
          pageSize: 100,
          filter: gradeFilter !== 'ALL' ? { drGrade: gradeFilter } : undefined,
        }),
        retinopathyApi.getStatistics(),
      ]);

      setScreenings(screeningsData.data);
      setStatistics(statsData);
      toast.success('Screenings loaded');
    } catch (error) {
      console.error('Failed to fetch screenings:', error);
      toast.error('Failed to load screenings');
      setScreenings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredScreenings = screenings.filter(screening =>
    screening.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screening.patientMRN?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute requiredPermission="CLINICAL:SCREENING:VIEW">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-600" />
              Diabetic Retinopathy Screening
            </h1>
            <p className="text-gray-600 mt-1">
              Screen and grade diabetic retinopathy with AI assistance
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/diagnostic/retinopathy-screening/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Screening
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">No DR</p>
                <p className="text-2xl font-bold text-green-900">
                  {statistics?.drGradeDistribution?.['None'] || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Mild NPDR</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {statistics?.drGradeDistribution?.['Mild NPDR'] || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Moderate NPDR</p>
                <p className="text-2xl font-bold text-amber-900">
                  {statistics?.drGradeDistribution?.['Moderate NPDR'] || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Severe NPDR</p>
                <p className="text-2xl font-bold text-orange-900">
                  {statistics?.drGradeDistribution?.['Severe NPDR'] || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">PDR</p>
                <p className="text-2xl font-bold text-red-900">
                  {statistics?.drGradeDistribution?.['PDR'] || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {['ALL', 'NONE', 'MILD', 'MODERATE', 'SEVERE', 'PDR'].map((grade) => (
            <button
              key={grade}
              onClick={() => setGradeFilter(grade as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                gradeFilter === grade
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading screenings...</p>
            </div>
          ) : filteredScreenings.length === 0 ? (
            <div className="p-12 text-center">
              <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Screening Records Yet</h3>
              <p className="text-gray-600 mb-4">Start screening patients for diabetic retinopathy</p>
              <button
                onClick={() => router.push('/dashboard/diagnostic/retinopathy-screening/new')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Start Screening
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DR Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredScreenings.map((screening) => (
                    <tr key={screening.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{screening.patientName}</p>
                          <p className="text-sm text-gray-500">{screening.patientMRN}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(screening.screeningDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {screening.eye}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          screening.drGrade === 'None' ? 'bg-green-100 text-green-800' :
                          screening.drGrade === 'Mild NPDR' ? 'bg-yellow-100 text-yellow-800' :
                          screening.drGrade === 'Moderate NPDR' ? 'bg-amber-100 text-amber-800' :
                          screening.drGrade === 'Severe NPDR' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {screening.drGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {screening.findings || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/dashboard/diagnostic/retinopathy-screening/${screening.id}`)}
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
      </div>
    </ProtectedRoute>
  );
}
