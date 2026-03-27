'use client';

import { useState, useEffect } from 'react';
import { departmentsEnhancedApi, Department, DepartmentCapacity, CapacityResource, CapacityAlert } from '@/lib/api/departments-enhanced.api';
import { 
  Bed, 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Edit, 
  Plus,
  Activity,
  Building,
  Stethoscope,
  Monitor,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface DepartmentCapacityManagerProps {
  department: Department;
  onUpdate: () => void;
}

export default function DepartmentCapacityManager({ department, onUpdate }: DepartmentCapacityManagerProps) {
  const [capacity, setCapacity] = useState<DepartmentCapacity | null>(null);
  const [resources, setResources] = useState<CapacityResource[]>([]);
  const [alerts, setAlerts] = useState<CapacityAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<CapacityResource | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);

  useEffect(() => {
    loadCapacityData();
  }, [department.id]);

  const loadCapacityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [capacityResponse, resourcesResponse, alertsResponse] = await Promise.all([
        departmentsEnhancedApi.getCapacity(department.id),
        departmentsEnhancedApi.getCapacityResources(department.id),
        departmentsEnhancedApi.getCapacityAlerts(department.id)
      ]);

      setCapacity(capacityResponse);
      setResources(resourcesResponse.items || []);
      setAlerts(alertsResponse.items || []);
    } catch (err: any) {
      console.error('Error loading capacity data:', err);
      setError(err.response?.data?.message || 'Failed to load capacity data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCapacity = async (updatedCapacity: Partial<DepartmentCapacity>) => {
    if (!capacity) return;

    try {
      const updated = await departmentsEnhancedApi.updateCapacity(department.id, updatedCapacity);
      setCapacity(updated);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update capacity');
    }
  };

  const handleAddResource = () => {
    setSelectedResource(null);
    setShowResourceModal(true);
  };

  const handleEditResource = (resource: CapacityResource) => {
    setSelectedResource(resource);
    setShowResourceModal(true);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-100';
    if (rate >= 75) return 'text-yellow-600 bg-yellow-100';
    if (rate >= 50) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_use': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'maintenance': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'out_of_order': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading && !capacity) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!capacity) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Building className="mx-auto h-12 w-12 mb-4 text-gray-400" />
        <p>No capacity data available</p>
      </div>
    );
  }

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

      {/* Capacity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bed className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-600">Bed Capacity</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900">{capacity.currentPatients}/{capacity.maxPatients}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(capacity.utilizationRate)}`}>
                  {capacity.utilizationRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-600">Staff</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900">{capacity.currentStaff}/{capacity.maxStaff}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor((capacity.currentStaff / capacity.maxStaff) * 100)}`}>
                  {Math.round((capacity.currentStaff / capacity.maxStaff) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Monitor className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-600">Equipment</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900">{capacity.equipmentInUse}/{capacity.totalEquipment}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor((capacity.equipmentInUse / capacity.totalEquipment) * 100)}`}>
                  {Math.round((capacity.equipmentInUse / capacity.totalEquipment) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-600">Avg. Wait Time</p>
              <p className="text-2xl font-bold text-gray-900">{capacity.averageWaitTime}</p>
              <p className="text-xs text-gray-500">minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            <span className="text-sm text-gray-500">{alerts.length} active</span>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${getAlertSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <h4 className="font-medium">{alert.title}</h4>
                        <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-50">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{alert.description}</p>
                      <p className="mt-1 text-xs opacity-75">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {alert.actions && alert.actions.length > 0 && (
                      <div className="ml-4">
                        <button className="text-sm underline hover:no-underline">
                          Take Action
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Capacity Resources */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
          <button
            onClick={handleAddResource}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div 
                key={resource.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => handleEditResource(resource)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getResourceStatusIcon(resource.status)}
                    <div className="ml-2">
                      <h4 className="font-medium text-gray-900">{resource.name}</h4>
                      <p className="text-sm text-gray-500">{resource.type}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacity:</span>
                    <span>{resource.currentCount}/{resource.maxCount}</span>
                  </div>
                  {resource.location && (
                    <div className="flex justify-between text-sm">
                      <span>Location:</span>
                      <span className="text-gray-600">{resource.location}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Utilization:</span>
                    <span className={`font-medium ${getUtilizationColor(resource.utilizationRate).split(' ')[0]}`}>
                      {resource.utilizationRate}%
                    </span>
                  </div>
                </div>

                {resource.maintenanceSchedule && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Next Maintenance: {new Date(resource.maintenanceSchedule.nextMaintenanceDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {resources.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p>No resources configured</p>
              <button
                onClick={handleAddResource}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Add your first resource
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Utilization Trends */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Utilization Trends</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Bed Utilization</span>
                <span className="text-sm text-gray-500">{capacity.utilizationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${capacity.utilizationRate >= 90 ? 'bg-red-600' : capacity.utilizationRate >= 75 ? 'bg-yellow-600' : 'bg-green-600'}`}
                  style={{ width: `${Math.min(capacity.utilizationRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Staff Utilization</span>
                <span className="text-sm text-gray-500">{Math.round((capacity.currentStaff / capacity.maxStaff) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${(capacity.currentStaff / capacity.maxStaff) * 100 >= 90 ? 'bg-red-600' : (capacity.currentStaff / capacity.maxStaff) * 100 >= 75 ? 'bg-yellow-600' : 'bg-green-600'}`}
                  style={{ width: `${Math.min((capacity.currentStaff / capacity.maxStaff) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Equipment Utilization</span>
                <span className="text-sm text-gray-500">{Math.round((capacity.equipmentInUse / capacity.totalEquipment) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${(capacity.equipmentInUse / capacity.totalEquipment) * 100 >= 90 ? 'bg-red-600' : (capacity.equipmentInUse / capacity.totalEquipment) * 100 >= 75 ? 'bg-yellow-600' : 'bg-green-600'}`}
                  style={{ width: `${Math.min((capacity.equipmentInUse / capacity.totalEquipment) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={loadCapacityData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Resource Modal */}
      {showResourceModal && (
        <ResourceModal
          resource={selectedResource}
          departmentId={department.id}
          onClose={() => {
            setShowResourceModal(false);
            setSelectedResource(null);
          }}
          onSave={() => {
            loadCapacityData();
            setShowResourceModal(false);
            setSelectedResource(null);
          }}
        />
      )}
    </div>
  );
}

// Resource Modal Component
interface ResourceModalProps {
  resource: CapacityResource | null;
  departmentId: string;
  onClose: () => void;
  onSave: () => void;
}

function ResourceModal({ resource, departmentId, onClose, onSave }: ResourceModalProps) {
  const [formData, setFormData] = useState({
    name: resource?.name || '',
    type: resource?.type || 'Equipment',
    maxCount: resource?.maxCount || 1,
    currentCount: resource?.currentCount || 0,
    location: resource?.location || '',
    status: resource?.status || 'Available',
    description: resource?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (resource) {
        await departmentsEnhancedApi.updateCapacityResource(departmentId, resource.id, formData);
      } else {
        await departmentsEnhancedApi.createCapacityResource(departmentId, formData);
      }
      
      onSave();
    } catch (err: any) {
      console.error('Error saving resource:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {resource ? 'Edit Resource' : 'Add Resource'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Equipment">Equipment</option>
              <option value="Room">Room</option>
              <option value="Bed">Bed</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Count
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxCount}
                onChange={(e) => setFormData({ ...formData, maxCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentCount}
                onChange={(e) => setFormData({ ...formData, currentCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Available">Available</option>
              <option value="In_Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out_Of_Order">Out of Order</option>
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

          <div className="flex justify-end space-x-3 pt-4">
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
              {saving ? 'Saving...' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}