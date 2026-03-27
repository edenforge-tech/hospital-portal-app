'use client';

import { useState, useEffect } from 'react';
import { departmentsEnhancedApi, Department, DepartmentWorkflow, WorkflowFilters, WorkflowStep } from '@/lib/api/departments-enhanced.api';
import { 
  Workflow, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Activity,
  FileText,
  Eye,
  Copy
} from 'lucide-react';

interface DepartmentWorkflowManagerProps {
  department: Department;
  onUpdate: () => void;
}

interface WorkflowFormData {
  id?: string;
  workflowName: string;
  description: string;
  category: string;
  priority: string;
  isActive: boolean;
  estimatedDuration: number;
  steps: WorkflowStep[];
  qualityCheckpoints: {
    stepId: string;
    checkpointName: string;
    criteria: string;
    isRequired: boolean;
  }[];
  requiredRoles: string[];
  approvalRequired: boolean;
  approverRoles: string[];
}

export default function DepartmentWorkflowManager({ department, onUpdate }: DepartmentWorkflowManagerProps) {
  const [workflows, setWorkflows] = useState<DepartmentWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<DepartmentWorkflow | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkflowFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, [department.id, filters]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await departmentsEnhancedApi.getDepartmentWorkflows(department.id, filters);
      setWorkflows(response.items || []);
    } catch (err: any) {
      console.error('Error loading workflows:', err);
      setError(err.response?.data?.message || 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setShowFormModal(true);
  };

  const handleEditWorkflow = (workflow: DepartmentWorkflow) => {
    setSelectedWorkflow(workflow);
    setShowFormModal(true);
  };

  const handleViewWorkflow = (workflow: DepartmentWorkflow) => {
    setSelectedWorkflow(workflow);
    setShowDetailsModal(true);
  };

  const handleDeleteWorkflow = async (workflow: DepartmentWorkflow) => {
    if (!window.confirm(`Are you sure you want to delete ${workflow.workflowName}?`)) {
      return;
    }

    try {
      await departmentsEnhancedApi.deleteWorkflow(department.id, workflow.id);
      await loadWorkflows();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete workflow');
    }
  };

  const handleToggleWorkflowStatus = async (workflow: DepartmentWorkflow) => {
    try {
      await departmentsEnhancedApi.updateWorkflow(department.id, workflow.id, {
        isActive: !workflow.isActive
      });
      await loadWorkflows();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update workflow status');
    }
  };

  const handleDuplicateWorkflow = async (workflow: DepartmentWorkflow) => {
    try {
      const duplicatedWorkflow = {
        ...workflow,
        workflowName: `${workflow.workflowName} (Copy)`,
        isActive: false
      };
      delete duplicatedWorkflow.id;
      
      await departmentsEnhancedApi.createWorkflow(department.id, duplicatedWorkflow);
      await loadWorkflows();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to duplicate workflow');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'waiting': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const workflowStats = {
    total: workflows.length,
    active: workflows.filter(w => w.isActive).length,
    avgCompletionTime: workflows.length > 0 ? 
      workflows.reduce((sum, w) => sum + (w.averageCompletionTime || 0), 0) / workflows.length : 0,
    totalExecutions: workflows.reduce((sum, w) => sum + (w.totalExecutions || 0), 0),
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

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Workflow className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{workflowStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{workflowStats.active}</p>
              <p className="text-sm text-green-600">
                {workflowStats.total > 0 ? Math.round((workflowStats.active / workflowStats.total) * 100) : 0}% active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
              <p className="text-2xl font-bold text-gray-900">{workflowStats.avgCompletionTime.toFixed(1)}</p>
              <p className="text-sm text-gray-600">hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">{workflowStats.totalExecutions}</p>
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
                placeholder="Search workflows..."
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
              <option value="Patient Care">Patient Care</option>
              <option value="Administrative">Administrative</option>
              <option value="Emergency">Emergency</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Training">Training</option>
            </select>

            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <button
            onClick={handleCreateWorkflow}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create Workflow
          </button>
        </div>
      </div>

      {/* Workflows List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Workflows ({filteredWorkflows.length})
          </h3>
          <button
            onClick={loadWorkflows}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && workflows.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <Workflow className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p>No workflows found</p>
            {workflows.length === 0 && (
              <button
                onClick={handleCreateWorkflow}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Create your first workflow
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredWorkflows.map((workflow) => (
              <div key={workflow.id}>
                <div className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedWorkflow === workflow.id ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </button>
                        
                        {workflow.isActive ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <Pause className="h-4 w-4 text-gray-500" />
                        }
                        
                        <h4 className="text-lg font-medium text-gray-900">{workflow.workflowName}</h4>
                        
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {workflow.category}
                        </span>
                        
                        <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(workflow.priority)}`}>
                          {workflow.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{workflow.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Steps:</span>
                          <div className="font-medium text-gray-900">{workflow.steps.length}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Est. Duration:</span>
                          <div className="font-medium text-gray-900">{workflow.estimatedDuration}h</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg. Completion:</span>
                          <div className="font-medium text-gray-900">
                            {workflow.averageCompletionTime ? `${workflow.averageCompletionTime}h` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Executions:</span>
                          <div className="font-medium text-gray-900">{workflow.totalExecutions || 0}</div>
                        </div>
                      </div>

                      {workflow.requiredRoles.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500">Required Roles:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {workflow.requiredRoles.slice(0, 3).map((role, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {role}
                              </span>
                            ))}
                            {workflow.requiredRoles.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{workflow.requiredRoles.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleViewWorkflow(workflow)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateWorkflow(workflow)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Duplicate Workflow"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditWorkflow(workflow)}
                        className="p-2 text-indigo-600 hover:text-indigo-800"
                        title="Edit Workflow"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleWorkflowStatus(workflow)}
                        className={`p-2 ${workflow.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                        title={workflow.isActive ? 'Deactivate Workflow' : 'Activate Workflow'}
                      >
                        {workflow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Delete Workflow"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Workflow Steps */}
                {expandedWorkflow === workflow.id && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <h5 className="font-medium text-gray-900 mb-3 mt-4">Workflow Steps</h5>
                    <div className="space-y-3">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-700">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              {getStepStatusIcon(step.status || 'pending')}
                              <h6 className="font-medium text-gray-900">{step.stepName}</h6>
                              {step.isRequired && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Required</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>Duration: {step.estimatedDuration} min</span>
                              {step.assignedRoles.length > 0 && (
                                <span>Roles: {step.assignedRoles.join(', ')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {workflow.qualityCheckpoints.length > 0 && (
                      <div className="mt-6">
                        <h5 className="font-medium text-gray-900 mb-3">Quality Checkpoints</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {workflow.qualityCheckpoints.map((checkpoint, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <Target className="h-4 w-4 text-yellow-600" />
                                <h6 className="font-medium text-gray-900">{checkpoint.checkpointName}</h6>
                                {checkpoint.isRequired && (
                                  <span className="px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded">Required</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{checkpoint.criteria}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Form Modal */}
      {showFormModal && (
        <WorkflowFormModal
          workflow={selectedWorkflow}
          departmentId={department.id}
          onClose={() => {
            setShowFormModal(false);
            setSelectedWorkflow(null);
          }}
          onSave={() => {
            loadWorkflows();
            setShowFormModal(false);
            setSelectedWorkflow(null);
          }}
        />
      )}

      {/* Workflow Details Modal */}
      {showDetailsModal && selectedWorkflow && (
        <WorkflowDetailsModal
          workflow={selectedWorkflow}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedWorkflow(null);
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

// Workflow Form Modal Component (simplified for brevity)
interface WorkflowFormModalProps {
  workflow: DepartmentWorkflow | null;
  departmentId: string;
  onClose: () => void;
  onSave: () => void;
}

function WorkflowFormModal({ workflow, departmentId, onClose, onSave }: WorkflowFormModalProps) {
  const [formData, setFormData] = useState<WorkflowFormData>({
    workflowName: workflow?.workflowName || '',
    description: workflow?.description || '',
    category: workflow?.category || 'Patient Care',
    priority: workflow?.priority || 'Medium',
    isActive: workflow?.isActive ?? true,
    estimatedDuration: workflow?.estimatedDuration || 1,
    steps: workflow?.steps || [],
    qualityCheckpoints: workflow?.qualityCheckpoints || [],
    requiredRoles: workflow?.requiredRoles || [],
    approvalRequired: workflow?.approvalRequired || false,
    approverRoles: workflow?.approverRoles || [],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (workflow) {
        await departmentsEnhancedApi.updateWorkflow(departmentId, workflow.id, formData);
      } else {
        await departmentsEnhancedApi.createWorkflow(departmentId, formData);
      }
      
      onSave();
    } catch (err: any) {
      console.error('Error saving workflow:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {workflow ? 'Edit Workflow' : 'Create Workflow'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workflow Name
            </label>
            <input
              type="text"
              value={formData.workflowName}
              onChange={(e) => setFormData({ ...formData, workflowName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
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
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Patient Care">Patient Care</option>
                <option value="Administrative">Administrative</option>
                <option value="Emergency">Emergency</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Training">Training</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (hours)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
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
                checked={formData.approvalRequired}
                onChange={(e) => setFormData({ ...formData, approvalRequired: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Approval Required</span>
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
              {saving ? 'Saving...' : 'Save Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Workflow Details Modal Component (simplified for brevity)
interface WorkflowDetailsModalProps {
  workflow: DepartmentWorkflow;
  onClose: () => void;
  onEdit: () => void;
}

function WorkflowDetailsModal({ workflow, onClose, onEdit }: WorkflowDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{workflow.workflowName}</h3>
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
              <h4 className="font-medium text-gray-900 mb-3">Workflow Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Category:</span>
                  <p className="font-medium">{workflow.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Priority:</span>
                  <p className="font-medium">{workflow.priority}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p className="font-medium">{workflow.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Estimated Duration:</span>
                  <p className="font-medium">{workflow.estimatedDuration} hours</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Total Executions:</span>
                  <p className="font-medium">{workflow.totalExecutions || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Average Completion Time:</span>
                  <p className="font-medium">
                    {workflow.averageCompletionTime ? `${workflow.averageCompletionTime} hours` : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Success Rate:</span>
                  <p className="font-medium">
                    {workflow.successRate ? `${workflow.successRate}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700">{workflow.description}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Workflow Steps ({workflow.steps.length})</h4>
            <div className="space-y-4">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-700">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{step.stepName}</h5>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Duration: {step.estimatedDuration} min</span>
                        {step.assignedRoles.length > 0 && (
                          <span>Roles: {step.assignedRoles.join(', ')}</span>
                        )}
                        {step.isRequired && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Required</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}