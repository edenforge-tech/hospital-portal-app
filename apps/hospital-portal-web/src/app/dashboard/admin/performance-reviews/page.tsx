'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceReviewApi, PerformanceReview, ReviewStatisticsDto } from '@/lib/api/performance-review.api';
import { getApi } from '@/lib/api';
import { Search, Plus, Filter, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

export default function PerformanceReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatisticsDto | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, employeesRes] = await Promise.all([
        performanceReviewApi.getStatistics(),
        getApi().get<Employee[]>('/employees')
      ]);

      setStatistics(statsRes.data);
      setEmployees(employeesRes.data || []);

      // Load reviews based on status filter
      let reviewsData: PerformanceReview[] = [];
      if (statusFilter === 'pending') {
        const res = await performanceReviewApi.getPending();
        reviewsData = res.data;
      } else {
        // For 'all' or specific status, we'd need a getAll endpoint
        // For now, show pending as default
        const res = await performanceReviewApi.getPending();
        reviewsData = res.data;
      }

      if (statusFilter !== 'all' && statusFilter !== 'pending') {
        reviewsData = reviewsData.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
      }

      setReviews(reviewsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.reviewerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.reviewType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateReview = () => {
    setShowCreateModal(true);
  };

  const handleViewReview = (id: string) => {
    router.push(`/dashboard/admin/performance-reviews/${id}`);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Draft: 'bg-gray-100 text-gray-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getReviewTypeColor = (type: string) => {
    const colors = {
      Annual: 'text-blue-600',
      'Mid-Year': 'text-purple-600',
      Probation: 'text-orange-600',
      Quarterly: 'text-green-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
        <p className="text-gray-600 mt-1">Manage employee performance reviews and assessments</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Reviews</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.totalReviews}</p>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Pending Reviews</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.pendingReviews}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Approved</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.approvedReviews}</p>
            <p className="text-sm text-gray-500 mt-1">This quarter: {statistics.reviewsThisQuarter}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <AlertCircle className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Average Score</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.averageScore.toFixed(1)}</p>
            <p className="text-sm text-gray-500 mt-1">Out of 5.0</p>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by employee, reviewer, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateReview}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            <Plus size={20} />
            New Review
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No reviews found</p>
            <p className="text-gray-500 mt-2">Create a new review to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
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
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{review.employeeName || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{review.reviewerName || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${getReviewTypeColor(review.reviewType)}`}>
                        {review.reviewType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(review.reviewPeriodStart).toLocaleDateString()} - {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.overallScore ? (
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-900">{review.overallScore.toFixed(1)}</span>
                          <span className="text-gray-500 ml-1">/5.0</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scored</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewReview(review.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
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

      {/* Create Review Modal */}
      {showCreateModal && (
        <CreateReviewModal
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Create Review Modal Component
interface CreateReviewModalProps {
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

function CreateReviewModal({ employees, onClose, onSuccess }: CreateReviewModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const [reviewType, setReviewType] = useState('Annual');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId || !reviewerId || !periodStart || !periodEnd) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await performanceReviewApi.create({
        employeeId,
        reviewerId,
        reviewType,
        reviewPeriodStart: periodStart,
        reviewPeriodEnd: periodEnd
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Performance Review</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reviewer <span className="text-red-500">*</span>
            </label>
            <select
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Reviewer</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Type <span className="text-red-500">*</span>
            </label>
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Annual">Annual Review</option>
              <option value="Mid-Year">Mid-Year Review</option>
              <option value="Probation">Probation Review</option>
              <option value="Quarterly">Quarterly Review</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period Start <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period End <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
