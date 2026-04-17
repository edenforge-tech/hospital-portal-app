'use client';

import { useState, useEffect } from 'react';
import { departmentsEnhancedApi, Department, StaffAssignment, StaffFilters } from '@/lib/api/departments-enhanced.api';
import { useDeleteConfirmation } from '@/components/common/ConfirmationDialog';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  Star, 
  Award, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Badge,
  Activity
} from 'lucide-react';

interface DepartmentStaffAssignmentsProps {
  department: Department;
  onUpdate: () => void;
}

interface StaffAssignmentFormData {
  id?: string;
  userId: string;
  roleTitle: string;
  assignmentType: string;
  startDate: string;
  endDate?: string;
  workingHours: {
    monday: { start: string; end: string; isWorkingDay: boolean };
    tuesday: { start: string; end: string; isWorkingDay: boolean };
    wednesday: { start: string; end: string; isWorkingDay: boolean };
    thursday: { start: string; end: string; isWorkingDay: boolean };
    friday: { start: string; end: string; isWorkingDay: boolean };
    saturday: { start: string; end: string; isWorkingDay: boolean };
    sunday: { start: string; end: string; isWorkingDay: boolean };
  };
  responsibilities: string[];
  certifications: { name: string; issuedDate: string; expiryDate?: string }[];
  performanceTargets: {
    patientSatisfactionTarget: number;
    productivityTarget: number;
    attendanceTarget: number;
  };
}

export default function DepartmentStaffAssignments({ department, onUpdate }: DepartmentStaffAssignmentsProps) {
  const { confirmDelete, ConfirmationComponent } = useDeleteConfirmation();
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffAssignment | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<StaffFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStaffAssignments();
  }, [department.id, filters]);

  const loadStaffAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await departmentsEnhancedApi.getDepartmentStaff(department.id, filters);
      setStaffAssignments(response.items || []);
    } catch (err: any) {
      console.error('Error loading staff assignments:', err);
      setError(err.response?.data?.message || 'Failed to load staff assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    setSelectedStaff(null);
    setShowFormModal(true);
  };

  const handleEditAssignment = (assignment: StaffAssignment) => {
    setSelectedStaff(assignment);
    setShowFormModal(true);
  };

  const handleViewStaff = (assignment: StaffAssignment) => {
    setSelectedStaff(assignment);
    setShowDetailsModal(true);
  };

  const handleDeleteAssignment = async (assignment: StaffAssignment) => {
    confirmDelete(`${assignment.user.firstName} ${assignment.user.lastName}`, async () => {
      try {
        await departmentsEnhancedApi.deleteStaffAssignment(department.id, assignment.id);
        await loadStaffAssignments();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to remove staff assignment');
      }
    });
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAssignmentStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'on_leave': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'terminated': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredStaff = staffAssignments.filter(assignment =>
    `${assignment.user.firstName} ${assignment.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.assignmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffStats = {
    total: staffAssignments.length,
    active: staffAssignments.filter(s => s.isActive).length,
    avgPerformance: staffAssignments.length > 0 ? 
      staffAssignments.reduce((sum, s) => sum + (s.performanceMetrics?.overallScore || 0), 0) / staffAssignments.length : 0,
    onLeave: staffAssignments.filter(s => s.assignmentStatus === 'On_Leave').length,
  };

  return (
    <div className="space-y-6">
      <ConfirmationComponent />
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Staff Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staffStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{staffStats.active}</p>
              <p className="text-sm text-green-600">
                {staffStats.total > 0 ? Math.round((staffStats.active / staffStats.total) * 100) : 0}% active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg. Performance</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(staffStats.avgPerformance)}`}>
                {staffStats.avgPerformance.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-gray-900">{staffStats.onLeave}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select
              value={filters.assignmentStatus || ''}
              onChange={(e) => setFilters({ ...filters, assignmentStatus: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On_Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>

            <select
              value={filters.assignmentType || ''}
              onChange={(e) => setFilters({ ...filters, assignmentType: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="FullTime">Full Time</option>
              <option value="PartTime">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>

          <button
            onClick={handleCreateAssignment}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Staff Assignments ({filteredStaff.length})
          </h3>
          <button
            onClick={loadStaffAssignments}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && staffAssignments.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <Users className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p>No staff assignments found</p>
            {staffAssignments.length === 0 && (
              <button
                onClick={handleCreateAssignment}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Add your first staff member
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStaff.map((assignment) => (
              <div 
                key={assignment.id} 
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewStaff(assignment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getAssignmentStatusIcon(assignment.assignmentStatus)}
                      <h4 className="text-lg font-medium text-gray-900">
                        {assignment.user.firstName} {assignment.user.lastName}
                      </h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {assignment.roleTitle}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {assignment.assignmentType}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {assignment.user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {assignment.user.email}
                        </div>
                      )}
                      {assignment.user.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {assignment.user.phoneNumber}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Since {new Date(assignment.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Performance:</span>
                        <div className={`font-medium ${getPerformanceColor(assignment.performanceMetrics?.overallScore || 0)}`}>
                          {assignment.performanceMetrics?.overallScore || 0}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Attendance:</span>
                        <div className="font-medium text-gray-900">
                          {assignment.performanceMetrics?.attendanceRate || 0}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Certifications:</span>
                        <div className="font-medium text-gray-900">
                          {assignment.certifications.filter(c => !c.isExpired).length} active
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Weekly Hours:</span>
                        <div className="font-medium text-gray-900">
                          {assignment.workingHours.weeklyHours || 0}h
                        </div>
                      </div>
                    </div>

                    {assignment.responsibilities.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Responsibilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {assignment.responsibilities.slice(0, 3).map((resp, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {resp}
                            </span>
                          ))}
                          {assignment.responsibilities.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{assignment.responsibilities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAssignment(assignment);
                      }}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                      title="Edit Assignment"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAssignment(assignment);
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Remove Assignment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff Assignment Form Modal */}
      {showFormModal && (
        <StaffAssignmentFormModal
          assignment={selectedStaff}
          departmentId={department.id}
          onClose={() => {
            setShowFormModal(false);
            setSelectedStaff(null);
          }}
          onSave={() => {
            loadStaffAssignments();
            setShowFormModal(false);
            setSelectedStaff(null);
          }}
        />
      )}

      {/* Staff Details Modal */}
      {showDetailsModal && selectedStaff && (
        <StaffDetailsModal
          assignment={selectedStaff}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStaff(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowFormModal(true);
          }}
        />
      )}
    </div>
  );
}

// Staff Assignment Form Modal Component
interface StaffAssignmentFormModalProps {
  assignment: StaffAssignment | null;
  departmentId: string;
  onClose: () => void;
  onSave: () => void;
}

function StaffAssignmentFormModal({ assignment, departmentId, onClose, onSave }: StaffAssignmentFormModalProps) {
  const [formData, setFormData] = useState<StaffAssignmentFormData>({
    userId: assignment?.userId || '',
    roleTitle: assignment?.roleTitle || '',
    assignmentType: assignment?.assignmentType || 'FullTime',
    startDate: assignment?.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : '',
    endDate: assignment?.endDate ? new Date(assignment.endDate).toISOString().split('T')[0] : '',
    workingHours: assignment?.workingHours || {
      monday: { start: '09:00', end: '17:00', isWorkingDay: true },
      tuesday: { start: '09:00', end: '17:00', isWorkingDay: true },
      wednesday: { start: '09:00', end: '17:00', isWorkingDay: true },
      thursday: { start: '09:00', end: '17:00', isWorkingDay: true },
      friday: { start: '09:00', end: '17:00', isWorkingDay: true },
      saturday: { start: '09:00', end: '17:00', isWorkingDay: false },
      sunday: { start: '09:00', end: '17:00', isWorkingDay: false },
    },
    responsibilities: assignment?.responsibilities || [],
    certifications: assignment?.certifications || [],
    performanceTargets: assignment?.performanceTargets || {
      patientSatisfactionTarget: 90,
      productivityTarget: 85,
      attendanceTarget: 95,
    },
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (assignment) {
        await departmentsEnhancedApi.updateStaffAssignment(departmentId, assignment.id, formData);
      } else {
        await departmentsEnhancedApi.createStaffAssignment(departmentId, formData);
      }
      
      onSave();
    } catch (err: any) {
      console.error('Error saving staff assignment:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {assignment ? 'Edit Staff Assignment' : 'Create Staff Assignment'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="Enter user ID or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Title
              </label>
              <input
                type="text"
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="e.g., Senior Nurse, Doctor, Technician"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Type
              </label>
              <select
                value={formData.assignmentType}
                onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="FullTime">Full Time</option>
                <option value="PartTime">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (optional)
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Working Hours</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-3">
                  <label className="flex items-center min-w-[100px]">
                    <input
                      type="checkbox"
                      checked={hours.isWorkingDay}
                      onChange={(e) => setFormData({
                        ...formData,
                        workingHours: {
                          ...formData.workingHours,
                          [day]: { ...hours, isWorkingDay: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm capitalize">{day}</span>
                  </label>
                  {hours.isWorkingDay && (
                    <>
                      <input
                        type="time"
                        value={hours.start}
                        onChange={(e) => setFormData({
                          ...formData,
                          workingHours: {
                            ...formData.workingHours,
                            [day]: { ...hours, start: e.target.value }
                          }
                        })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.end}
                        onChange={(e) => setFormData({
                          ...formData,
                          workingHours: {
                            ...formData.workingHours,
                            [day]: { ...hours, end: e.target.value }
                          }
                        })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Performance Targets</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Satisfaction (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.performanceTargets.patientSatisfactionTarget}
                  onChange={(e) => setFormData({
                    ...formData,
                    performanceTargets: {
                      ...formData.performanceTargets,
                      patientSatisfactionTarget: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Productivity (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.performanceTargets.productivityTarget}
                  onChange={(e) => setFormData({
                    ...formData,
                    performanceTargets: {
                      ...formData.performanceTargets,
                      productivityTarget: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.performanceTargets.attendanceTarget}
                  onChange={(e) => setFormData({
                    ...formData,
                    performanceTargets: {
                      ...formData.performanceTargets,
                      attendanceTarget: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Staff Details Modal Component
interface StaffDetailsModalProps {
  assignment: StaffAssignment;
  onClose: () => void;
  onEdit: () => void;
}

function StaffDetailsModal({ assignment, onClose, onEdit }: StaffDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {assignment.user.firstName} {assignment.user.lastName}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Assignment Details</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Role:</span>
                  <p className="font-medium">{assignment.roleTitle}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Type:</span>
                  <p className="font-medium">{assignment.assignmentType}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p className="font-medium">{assignment.assignmentStatus}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Start Date:</span>
                  <p className="font-medium">{new Date(assignment.startDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-medium">{assignment.user.email}</p>
                </div>
                {assignment.user.phoneNumber && (
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium">{assignment.user.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {assignment.performanceMetrics && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{assignment.performanceMetrics.overallScore}%</p>
                  <p className="text-sm text-gray-500">Overall Score</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{assignment.performanceMetrics.patientSatisfaction}%</p>
                  <p className="text-sm text-gray-500">Patient Satisfaction</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{assignment.performanceMetrics.productivity}%</p>
                  <p className="text-sm text-gray-500">Productivity</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{assignment.performanceMetrics.attendanceRate}%</p>
                  <p className="text-sm text-gray-500">Attendance Rate</p>
                </div>
              </div>
            </div>
          )}

          {assignment.certifications.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Certifications</h4>
              <div className="space-y-2">
                {assignment.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-gray-500">
                        Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                        {cert.expiryDate && ` | Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${cert.isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {cert.isExpired ? 'Expired' : 'Active'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignment.responsibilities.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Responsibilities</h4>
              <div className="flex flex-wrap gap-2">
                {assignment.responsibilities.map((resp, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {resp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}