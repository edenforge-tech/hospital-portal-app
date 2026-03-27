'use client';

import { useState, useEffect } from 'react';
import { departmentsEnhancedApi, Department, DepartmentService, ServiceFilters } from '@/lib/api/departments-enhanced.api';
import { 
  Activity, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  FileText
} from 'lucide-react';

interface DepartmentServiceManagerProps {
  department: Department;
  onUpdate: () => void;
}

interface ServiceFormData {
  id?: string;
  serviceName: string;
  serviceCode: string;
  category: string;
  description: string;
  baseCost: number;
  duration: number;
  isActive: boolean;
  requiresBooking: boolean;
  maxConcurrentBookings: number;
  skillRequirements: string[];
  equipmentRequirements: string[];
  qualityMetrics: {
    targetSuccessRate: number;
    targetPatientSatisfaction: number;
    targetCompletionTime: number;
  };
}

export default function DepartmentServiceManager({ department, onUpdate }: DepartmentServiceManagerProps) {
  const [services, setServices] = useState<DepartmentService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<DepartmentService | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<ServiceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadServices();
  }, [department.id, filters]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await departmentsEnhancedApi.getDepartmentServices(department.id, filters);
      setServices(response.items || []);
    } catch (err: any) {
      console.error('Error loading services:', err);
      setError(err.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setShowFormModal(true);
  };

  const handleEditService = (service: DepartmentService) => {
    setSelectedService(service);
    setShowFormModal(true);
  };

  const handleViewService = (service: DepartmentService) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleDeleteService = async (service: DepartmentService) => {
    if (!window.confirm(`Are you sure you want to delete ${service.serviceName}?`)) {
      return;
    }

    try {
      await departmentsEnhancedApi.deleteService(department.id, service.id);
      await loadServices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleToggleServiceStatus = async (service: DepartmentService) => {
    try {
      await departmentsEnhancedApi.updateService(department.id, service.id, {
        isActive: !service.isActive
      });
      await loadServices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update service status');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getServiceStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> :
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const filteredServices = services.filter(service =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.serviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const serviceStats = {
    total: services.length,
    active: services.filter(s => s.isActive).length,
    avgRating: services.length > 0 ? services.reduce((sum, s) => sum + (s.averageRating || 0), 0) / services.length : 0,
    totalRevenue: services.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
  };

  return (
    <div className="space-y-6">
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

      {/* Service Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{serviceStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-gray-900">{serviceStats.active}</p>
              <p className="text-sm text-green-600">
                {serviceStats.total > 0 ? Math.round((serviceStats.active / serviceStats.total) * 100) : 0}% active
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
              <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{serviceStats.avgRating.toFixed(1)}</p>
                <div className="ml-2 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(serviceStats.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${serviceStats.totalRevenue.toLocaleString()}</p>
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
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select
              value={filters.isActive?.toString() || ''}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value ? e.target.value === 'true' : undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="Consultation">Consultation</option>
              <option value="Diagnostic">Diagnostic</option>
              <option value="Treatment">Treatment</option>
              <option value="Surgery">Surgery</option>
              <option value="Emergency">Emergency</option>
              <option value="Preventive">Preventive</option>
            </select>
          </div>

          <button
            onClick={handleCreateService}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Services ({filteredServices.length})
          </h3>
          <button
            onClick={loadServices}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && services.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <Activity className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p>No services found</p>
            {services.length === 0 && (
              <button
                onClick={handleCreateService}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Create your first service
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredServices.map((service) => (
              <div key={service.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getServiceStatusIcon(service.isActive)}
                      <h4 className="text-lg font-medium text-gray-900">{service.serviceName}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {service.serviceCode}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {service.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{service.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Base Cost:</span>
                        <div className="font-medium text-gray-900">${service.baseCost}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div className="font-medium text-gray-900">{service.duration} min</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Rating:</span>
                        <div className={`font-medium ${getRatingColor(service.averageRating || 0)}`}>
                          {service.averageRating ? service.averageRating.toFixed(1) : 'N/A'}
                          <Star className="inline h-4 w-4 ml-1" />
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Bookings:</span>
                        <div className="font-medium text-gray-900">{service.totalBookings || 0}</div>
                      </div>
                    </div>

                    {service.qualityMetrics && (
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Success Rate:</span>
                          <div className="font-medium text-gray-900">
                            {service.qualityMetrics.actualSuccessRate || 0}%
                            <span className="text-xs text-gray-500 ml-1">
                              (target: {service.qualityMetrics.targetSuccessRate}%)
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Patient Satisfaction:</span>
                          <div className="font-medium text-gray-900">
                            {service.qualityMetrics.actualPatientSatisfaction || 0}%
                            <span className="text-xs text-gray-500 ml-1">
                              (target: {service.qualityMetrics.targetPatientSatisfaction}%)
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Completion Time:</span>
                          <div className="font-medium text-gray-900">
                            {service.qualityMetrics.actualCompletionTime || 0} min
                            <span className="text-xs text-gray-500 ml-1">
                              (target: {service.qualityMetrics.targetCompletionTime} min)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewService(service)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditService(service)}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                      title="Edit Service"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleServiceStatus(service)}
                      className={`p-2 ${service.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                      title={service.isActive ? 'Deactivate Service' : 'Activate Service'}
                    >
                      {service.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteService(service)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete Service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      {showFormModal && (
        <ServiceFormModal
          service={selectedService}
          departmentId={department.id}
          onClose={() => {
            setShowFormModal(false);
            setSelectedService(null);
          }}
          onSave={() => {
            loadServices();
            setShowFormModal(false);
            setSelectedService(null);
          }}
        />
      )}

      {/* Service Details Modal */}
      {showDetailsModal && selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedService(null);
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

// Service Form Modal Component
interface ServiceFormModalProps {
  service: DepartmentService | null;
  departmentId: string;
  onClose: () => void;
  onSave: () => void;
}

function ServiceFormModal({ service, departmentId, onClose, onSave }: ServiceFormModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceName: service?.serviceName || '',
    serviceCode: service?.serviceCode || '',
    category: service?.category || 'Consultation',
    description: service?.description || '',
    baseCost: service?.baseCost || 0,
    duration: service?.duration || 30,
    isActive: service?.isActive ?? true,
    requiresBooking: service?.requiresBooking ?? true,
    maxConcurrentBookings: service?.maxConcurrentBookings || 1,
    skillRequirements: service?.skillRequirements || [],
    equipmentRequirements: service?.equipmentRequirements || [],
    qualityMetrics: service?.qualityMetrics || {
      targetSuccessRate: 95,
      targetPatientSatisfaction: 90,
      targetCompletionTime: 30,
    },
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (service) {
        await departmentsEnhancedApi.updateService(departmentId, service.id, formData);
      } else {
        await departmentsEnhancedApi.createService(departmentId, formData);
      }
      
      onSave();
    } catch (err: any) {
      console.error('Error saving service:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {service ? 'Edit Service' : 'Create Service'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name
              </label>
              <input
                type="text"
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Code
              </label>
              <input
                type="text"
                value={formData.serviceCode}
                onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Consultation">Consultation</option>
              <option value="Diagnostic">Diagnostic</option>
              <option value="Treatment">Treatment</option>
              <option value="Surgery">Surgery</option>
              <option value="Emergency">Emergency</option>
              <option value="Preventive">Preventive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.baseCost}
                onChange={(e) => setFormData({ ...formData, baseCost: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent Bookings
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxConcurrentBookings}
                onChange={(e) => setFormData({ ...formData, maxConcurrentBookings: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Quality Metrics Targets</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.qualityMetrics.targetSuccessRate}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    qualityMetrics: { 
                      ...formData.qualityMetrics, 
                      targetSuccessRate: parseInt(e.target.value) 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Satisfaction (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.qualityMetrics.targetPatientSatisfaction}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    qualityMetrics: { 
                      ...formData.qualityMetrics, 
                      targetPatientSatisfaction: parseInt(e.target.value) 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Time (min)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.qualityMetrics.targetCompletionTime}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    qualityMetrics: { 
                      ...formData.qualityMetrics, 
                      targetCompletionTime: parseInt(e.target.value) 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requiresBooking}
                onChange={(e) => setFormData({ ...formData, requiresBooking: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Requires Booking</span>
            </label>
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
              {saving ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Service Details Modal Component
interface ServiceDetailsModalProps {
  service: DepartmentService;
  onClose: () => void;
  onEdit: () => void;
}

function ServiceDetailsModal({ service, onClose, onEdit }: ServiceDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{service.serviceName}</h3>
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
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Service Code:</span>
                  <p className="font-medium">{service.serviceCode}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Category:</span>
                  <p className="font-medium">{service.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p className="font-medium">{service.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pricing & Duration</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Base Cost:</span>
                  <p className="font-medium">${service.baseCost}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Duration:</span>
                  <p className="font-medium">{service.duration} minutes</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Revenue:</span>
                  <p className="font-medium">${service.totalRevenue?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {service.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{service.description}</p>
            </div>
          )}

          {service.qualityMetrics && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Quality Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-lg font-bold text-gray-900">
                    {service.qualityMetrics.actualSuccessRate || 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: {service.qualityMetrics.targetSuccessRate}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Patient Satisfaction</p>
                  <p className="text-lg font-bold text-gray-900">
                    {service.qualityMetrics.actualPatientSatisfaction || 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: {service.qualityMetrics.targetPatientSatisfaction}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Completion Time</p>
                  <p className="text-lg font-bold text-gray-900">
                    {service.qualityMetrics.actualCompletionTime || 0} min
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: {service.qualityMetrics.targetCompletionTime} min
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Performance Summary</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{service.totalBookings || 0}</p>
                <p className="text-sm text-gray-500">Total Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{service.averageRating?.toFixed(1) || 'N/A'}</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{service.completedBookings || 0}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{service.cancelledBookings || 0}</p>
                <p className="text-sm text-gray-500">Cancelled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}