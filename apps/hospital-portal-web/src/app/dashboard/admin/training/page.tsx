'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, Plus, Search, Filter, Users, TrendingUp, 
  CheckCircle, Clock, Calendar, DollarSign 
} from 'lucide-react';
import { trainingApi, TrainingProgram, TrainingStatistics } from '@/lib/api/training.api';

export default function TrainingProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [statistics, setStatistics] = useState<TrainingStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
      if (categoryFilter && categoryFilter !== 'all') filters.category = categoryFilter;
      if (searchTerm) filters.search = searchTerm;

      const [programsRes, statsRes] = await Promise.all([
        trainingApi.getPrograms(filters),
        trainingApi.getStatistics()
      ]);

      setPrograms(programsRes.data);
      setStatistics(statsRes.data);
    } catch (error) {
      console.error('Failed to load training data:', error);
      alert('Failed to load training programs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgram = (id: string) => {
    router.push(`/dashboard/admin/training/${id}`);
  };

  const categories = ['Technical', 'Compliance', 'Clinical', 'Safety', 'Leadership', 'Soft Skills'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Programs</h1>
          <p className="text-gray-600 mt-1">Manage training programs and employee enrollments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          New Program
        </button>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Programs</p>
                <p className="text-3xl font-bold mt-1">{statistics.totalPrograms}</p>
                <p className="text-blue-100 text-xs mt-2">All time</p>
              </div>
              <GraduationCap className="h-12 w-12 text-blue-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Programs</p>
                <p className="text-3xl font-bold mt-1">{statistics.activePrograms}</p>
                <p className="text-green-100 text-xs mt-2">Currently running</p>
              </div>
              <Clock className="h-12 w-12 text-green-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Enrollments</p>
                <p className="text-3xl font-bold mt-1">{statistics.totalEnrollments}</p>
                <p className="text-purple-100 text-xs mt-2">Completed: {statistics.completedEnrollments}</p>
              </div>
              <Users className="h-12 w-12 text-purple-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Completion Rate</p>
                <p className="text-3xl font-bold mt-1">{statistics.averageCompletionRate.toFixed(1)}%</p>
                <p className="text-orange-100 text-xs mt-2">Upcoming: {statistics.upcomingPrograms}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-200 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading programs...</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No training programs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map(program => (
            <div
              key={program.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewProgram(program.id!)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{program.programName}</h3>
                    <p className="text-sm text-gray-500">{program.programCode}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    program.status === 'active' ? 'bg-green-100 text-green-800' :
                    program.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    program.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {program.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>

                {/* Details Grid */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    <span className="font-medium mr-2">Category:</span> {program.category}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium mr-2">Duration:</span> {program.durationHours} hours
                  </div>
                  {program.provider && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="font-medium mr-2">Provider:</span> {program.provider}
                    </div>
                  )}
                  {program.cost !== undefined && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="font-medium mr-2">Cost:</span> ${program.cost.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <div className="font-medium">Start Date</div>
                      <div>{program.startDate ? new Date(program.startDate).toLocaleDateString() : 'TBD'}</div>
                    </div>
                    <div>
                      <div className="font-medium">End Date</div>
                      <div>{program.endDate ? new Date(program.endDate).toLocaleDateString() : 'TBD'}</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                {program.certificateIssued && (
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Certificate Issued
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProgramModal
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

// Create Program Modal Component
function CreateProgramModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    programName: '',
    programCode: '',
    description: '',
    category: 'Technical',
    durationHours: 0,
    provider: '',
    cost: 0,
    maxParticipants: undefined as number | undefined,
    status: 'upcoming' as 'active' | 'upcoming' | 'completed' | 'cancelled',
    startDate: '',
    endDate: '',
    location: '',
    instructor: '',
    certificateIssued: false,
    mandatoryForRoles: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.programName || !formData.programCode || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await trainingApi.createProgram(formData);
      alert('Training program created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to create program:', error);
      alert('Failed to create training program');
    }
  };

  const categories = ['Technical', 'Compliance', 'Clinical', 'Safety', 'Leadership', 'Soft Skills'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Training Program</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.programName}
                  onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.programCode}
                  onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="certificateIssued"
                checked={formData.certificateIssued}
                onChange={(e) => setFormData({ ...formData, certificateIssued: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="certificateIssued" className="ml-2 block text-sm text-gray-700">
                Issue Certificate upon completion
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Program
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
