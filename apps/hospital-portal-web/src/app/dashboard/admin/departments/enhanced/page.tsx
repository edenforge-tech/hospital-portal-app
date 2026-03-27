'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { departmentsEnhancedApi, Department, DepartmentFilters } from '@/lib/api/departments-enhanced.api';
import DepartmentCapacityManager from '@/components/departments/DepartmentCapacityManager';
import DepartmentServiceManager from '@/components/departments/DepartmentServiceManager';
import DepartmentStaffAssignments from '@/components/departments/DepartmentStaffAssignments';
import DepartmentWorkflowManager from '@/components/departments/DepartmentWorkflowManager';
import DepartmentAnalyticsDashboard from '@/components/departments/DepartmentAnalyticsDashboard';
import EnhancedDepartmentFormModal from '@/components/departments/EnhancedDepartmentFormModal';
import { 
  Building2, 
  Plus, 
  RefreshCw, 
  Users, 
  BarChart3, 
  Settings, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Filter,
  Download,
  Search
} from 'lucide-react';

export default function EnhancedDepartmentsPage() {
  const { user } = useAuthStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'capacity' | 'services' | 'staff' | 'workflow' | 'analytics'>('overview');
  const [filters, setFilters] = useState<DepartmentFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'hierarchy'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadDepartments();
    }
  }, [user, filters]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await departmentsEnhancedApi.getAll(filters);
      setDepartments(response.items || []);
    } catch (err: any) {
      console.error('Error loading departments:', err);
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setShowFormModal(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowFormModal(true);
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (!window.confirm(`Are you sure you want to delete ${department.departmentName}?`)) {
      return;
    }

    try {
      await departmentsEnhancedApi.delete(department.id);
      await loadDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const handleExportData = async (department: Department) => {
    try {
      const blob = await departmentsEnhancedApi.exportDepartmentData(department.id, 'xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${department.departmentName}-data.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'undermaintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 75) return 'text-yellow-600';
    if (rate >= 50) return 'text-green-600';
    return 'text-gray-600';
  };

  const filteredDepartments = departments.filter(dept =>
    dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.departmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.departmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departmentStats = {
    total: departments.length,
    active: departments.filter(d => d.status === 'Active').length,
    highUtilization: departments.filter(d => d.capacity.utilizationRate >= 80).length,
    underStaffed: departments.filter(d => d.capacity.currentStaff < d.capacity.maxStaff * 0.7).length,
  };

  if (loading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600 mt-1">Manage departments, capacity, services, and staff assignments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadDepartments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCreateDepartment}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Department
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departmentStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{departmentStats.active}</p>
              <p className="text-sm text-green-600">
                {departmentStats.total > 0 ? Math.round((departmentStats.active / departmentStats.total) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Utilization</p>
              <p className="text-2xl font-bold text-gray-900">{departmentStats.highUtilization}</p>
              <p className="text-sm text-red-600">≥80% capacity</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Under-Staffed</p>
              <p className="text-2xl font-bold text-gray-900">{departmentStats.underStaffed}</p>
              <p className="text-sm text-yellow-600">&lt;70% staff capacity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="UnderMaintenance">Under Maintenance</option>
            </select>

            <select
              value={filters.departmentType || ''}
              onChange={(e) => setFilters({ ...filters, departmentType: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="Clinical">Clinical</option>
              <option value="Administrative">Administrative</option>
              <option value="Support">Support</option>
              <option value="Emergency">Emergency</option>
              <option value="Diagnostic">Diagnostic</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Activity className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Department Selection */}
      {selectedDepartment && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedDepartment.departmentName}</h2>
                  <p className="text-gray-600">{selectedDepartment.description}</p>
                </div>
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="flex space-x-1 mt-4">
                {['overview', 'capacity', 'services', 'staff', 'workflow', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'capacity' && (
                <DepartmentCapacityManager 
                  department={selectedDepartment}
                  onUpdate={loadDepartments}
                />
              )}
              {activeTab === 'services' && (
                <DepartmentServiceManager 
                  department={selectedDepartment}
                  onUpdate={loadDepartments}
                />
              )}
              {activeTab === 'staff' && (
                <DepartmentStaffAssignments 
                  department={selectedDepartment}
                  onUpdate={loadDepartments}
                />
              )}
              {activeTab === 'workflow' && (
                <DepartmentWorkflowManager 
                  department={selectedDepartment}
                  onUpdate={loadDepartments}
                />
              )}
              {activeTab === 'analytics' && (
                <DepartmentAnalyticsDashboard 
                  department={selectedDepartment}
                />
              )}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Capacity Overview</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Patients:</span>
                          <span>{selectedDepartment.capacity.currentPatients}/{selectedDepartment.capacity.maxPatients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Staff:</span>
                          <span>{selectedDepartment.capacity.currentStaff}/{selectedDepartment.capacity.maxStaff}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Utilization:</span>
                          <span className={getUtilizationColor(selectedDepartment.capacity.utilizationRate)}>
                            {selectedDepartment.capacity.utilizationRate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Services</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Services:</span>
                          <span>{selectedDepartment.services.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active:</span>
                          <span>{selectedDepartment.services.filter(s => s.isActive).length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Performance</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Patient Satisfaction:</span>
                          <span>{selectedDepartment.operationalMetrics.patientSatisfaction}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Wait Time:</span>
                          <span>{selectedDepartment.capacity.averageWaitTime} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Departments Grid/List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Departments ({filteredDepartments.length})
          </h3>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredDepartments.map((department) => (
              <div 
                key={department.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDepartment(department)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{department.departmentName}</h4>
                    <p className="text-sm text-gray-600">{department.departmentCode}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(department.status)}`}>
                    {department.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Staff:</span>
                    <span>{department.capacity.currentStaff}/{department.capacity.maxStaff}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Patients:</span>
                    <span>{department.capacity.currentPatients}/{department.capacity.maxPatients}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Utilization:</span>
                    <span className={getUtilizationColor(department.capacity.utilizationRate)}>
                      {department.capacity.utilizationRate}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportData(department);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDepartment(department);
                    }}
                    className="p-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDepartments.map((department) => (
                  <tr 
                    key={department.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedDepartment(department)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{department.departmentName}</div>
                        <div className="text-sm text-gray-500">{department.departmentCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {department.departmentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {department.capacity.currentStaff}/{department.capacity.maxStaff}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {department.capacity.currentPatients}/{department.capacity.maxPatients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getUtilizationColor(department.capacity.utilizationRate)}`}>
                        {department.capacity.utilizationRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(department.status)}`}>
                        {department.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportData(department);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDepartment(department);
                          }}
                          className="p-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Form Modal */}
      {showFormModal && (
        <EnhancedDepartmentFormModal
          department={selectedDepartment}
          onClose={() => {
            setShowFormModal(false);
            setSelectedDepartment(null);
          }}
          onSave={loadDepartments}
        />
      )}
    </div>
  );
}